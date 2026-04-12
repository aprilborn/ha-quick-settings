import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import { mqttPublish } from './utils/actions/mqtt.actions.js';
import { startMQTTListener } from './utils/helpers.js';
import { HASlider } from './utils/components/slider.js';
import { HAMQTTButton, HAHTTPButton } from './utils/components/button.js';
import { extensionIcon } from './utils/icons.js';


export default class HomeAssistantExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        this.MQTT_HOST = this._settings.get_string('mqtt-host');
        this.MQTT_USER = this._settings.get_string('mqtt-user');
        this.MQTT_PASS = this._settings.get_string('mqtt-pass');

        this.topicButton = this._settings.get_string('topic-button');
        this.topicSlider = this._settings.get_string('topic-slider');
        this.webhookButton = this._settings.get_string('webhook-button');
        this.buttonTopicLabel = this._settings.get_string('button-topic-label');
        this.buttonWebhookLabel = this._settings.get_string('button-webhook-label');

        this._indicator = new QuickSettings.SystemIndicator();
    
        this._slider = new HASlider({
            extensionPath: this.path,
            topicSlider: this.topicSlider,
            host: this.MQTT_HOST,
            user: this.MQTT_USER,
            pass: this.MQTT_PASS,
        });

        this._mqttButton = new HAMQTTButton({
            extensionPath: this.path,
            topicButton: this.topicButton,
            host: this.MQTT_HOST,
            user: this.MQTT_USER,
            pass: this.MQTT_PASS,
            buttonTopicLabel: this.buttonTopicLabel,
        });

        this._httpButton = new HAHTTPButton({
            extensionPath: this.path,
            webhookButton: this.webhookButton,
            buttonWebhookLabel: this.buttonWebhookLabel,
        });

        let qs = Main.panel.statusArea.quickSettings;

        this._indicator.quickSettingsItems.push(this._mqttButton, this._httpButton);
        qs.addExternalIndicator(this._indicator);

        this._indicatorRow = new QuickSettings.SystemIndicator(this._slider);
        this._indicatorRow.quickSettingsItems.push(this._slider);
        qs.addExternalIndicator(this._indicatorRow, 2);


        this._proc = startMQTTListener((msg) => {
            try {
                let json;

                let firstBrace = msg.indexOf('{');
                if (firstBrace === -1) return;

                let topic = msg.slice(0, firstBrace - 1);
                let payload = msg.slice(firstBrace);

                try {
                    json = JSON.parse(payload);
                } catch (e) {
                    return; // just ignore garbage
                }

                // button
                if (topic === this.topicButton) {
                    if (json.state !== undefined) {
                        this._mqttButton._updatingFromMQTT = true;
                        this._mqttButton.checked = json.state === 'ON';
                        this._mqttButton._updatingFromMQTT = false;
        
                        this._mqttButton.gicon = this._mqttButton.checked
                            ? extensionIcon(this.path, 'lightbulb-symbolic.svg')
                            : extensionIcon(this.path, 'lightbulb-off-symbolic.svg');
                    }
                }

                // slider
                if (topic === this.topicSlider) {
                    this._slider._updatingFromMQTT = true;

                    if (!!json.state) {
                        this._slider._isOn = json.state === 'ON';
                        this._slider.gicon = this._slider._isOn
                            ? extensionIcon(this.path, 'blur_on-symbolic.svg')
                            : extensionIcon(this.path, 'blur_off-symbolic.svg');
                    }

                    if (!!json.brightness) {
                        this._slider.slider.value = json.brightness / 254;
                    }

                    this._slider._updatingFromMQTT = false;
                }        
            } catch (e) {
                logError(e);
            }
        }, this.MQTT_USER, this.MQTT_PASS, this.MQTT_HOST, this.topicSlider, this.topicButton);

        // request initial values
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
            mqttPublish(this.topicSlider, '{}', this.MQTT_USER, this.MQTT_PASS, this.MQTT_HOST);
            mqttPublish(this.topicButton, '{}', this.MQTT_USER, this.MQTT_PASS, this.MQTT_HOST);
            return GLib.SOURCE_REMOVE;
        });
    }

    disable() {
        // this._indicator.quickSettingsItems.forEach(item => item.destroy());
        if (this._proc) {
            try { this._proc.force_exit(); } catch (e) {}
            this._proc = null;
        }
    
        if (this._indicator) {
            this._indicator.quickSettingsItems.forEach(item => {
                try { item.destroy(); } catch (e) {}
            });

            this._indicatorRow.quickSettingsItems.forEach(item => {
                try { item.destroy(); } catch (e) {}
            });
    
            try { this._indicator.destroy(); } catch (e) {}
            try { this._indicatorRow.destroy(); } catch (e) {}
            this._indicator = null;
        }
    }
}
