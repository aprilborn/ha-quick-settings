import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import { gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import { mqttPublish } from '../actions/mqtt.actions.js';
import { httpPublish } from '../actions/http.actions.js';
import { extensionIcon } from '../icons.js';

export const HAMQTTButton = GObject.registerClass(
  class HAMQTTButton extends QuickSettings.QuickToggle {
    _init(params) {
      let extensionPath = params.extensionPath;

      super._init({
          title: params.buttonTopicLabel || _('MQTT Button'),
          gicon: extensionIcon(extensionPath, 'lightbulb-symbolic.svg'),
          toggleMode: true,
      });

      this._extensionPath = extensionPath;

      this.topicButton = params.topicButton;
      this.webhookButton = params.webhookButton;
      this.MQTT_HOST = params.host;
      this.MQTT_USER = params.user;
      this.MQTT_PASS = params.pass;

      this._updatingFromMQTT = false;

      this.connect('notify::checked', () => {
        if (this._updatingFromMQTT) return;
    
        mqttPublish(
            `${this.topicButton}/set`,
            JSON.stringify({
                state: this.checked ? 'ON' : 'OFF'
            }),
            this.MQTT_USER,
            this.MQTT_PASS,
            this.MQTT_HOST
        );
    
        this.gicon = this.checked
            ? extensionIcon(this._extensionPath, 'lightbulb-symbolic.svg')
            : extensionIcon(this._extensionPath, 'lightbulb-off-symbolic.svg');
      });
    }
  }
);

export const HAHTTPButton = GObject.registerClass(
  class HAHTTPButton extends QuickSettings.QuickToggle {
    _init(params) {
      super._init({
          title: params.buttonWebhookLabel || _('Webhook Button'),
          gicon: extensionIcon(params.extensionPath, 'lightstrip-symbolic.svg'),
          toggleMode: false,
      });
  
      this.webhookButton = params.webhookButton;
  
      this.connect('clicked', () => {
        if (!this.webhookButton) return;
        httpPublish(this.webhookButton);
    });
  }
});