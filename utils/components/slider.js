import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import { mqttPublish } from '../actions/mqtt.actions.js';
import { extensionIcon } from '../icons.js';

export const HASlider = GObject.registerClass(
  class HASlider extends QuickSettings.QuickSlider {
    _init(params) {
      let extensionPath = params.extensionPath;

      super._init({
          gicon: extensionIcon(extensionPath, 'blur_off-symbolic.svg'),
      });

      this._extensionPath = extensionPath;

      this.topicSlider = params.topicSlider;
      this.MQTT_HOST = params.host;
      this.MQTT_USER = params.user;
      this.MQTT_PASS = params.pass;

      this._updatingFromMQTT = false;

      this._iconButton.reactive = true;
      this._iconButton.can_focus = true;
      this._iconButton.track_hover = true;

      this._isOn = false;

      // --- button (icon before the slider) ---
      this._iconButton.connect('clicked', () => {
          if (this._updatingFromMQTT) return;
          this._isOn = !this._isOn;

          mqttPublish(
              `${this.topicSlider}/set`,
              JSON.stringify({
                  state: this._isOn ? 'ON' : 'OFF'
              }),
              this.MQTT_USER,
              this.MQTT_PASS,
              this.MQTT_HOST
          );

          // change icon for feedback
          this.gicon = this._isOn
              ? extensionIcon(this._extensionPath, 'blur_on-symbolic.svg')
              : extensionIcon(this._extensionPath, 'blur_off-symbolic.svg');
      });

      // --- slider ---
      this.slider.value = 0.5;

      this._debounceTimeout = null;

      this.slider.connect('notify::value', () => {
          if (this._updatingFromMQTT) return;

          if (this._debounceTimeout) GLib.source_remove(this._debounceTimeout);

          this._debounceTimeout = GLib.timeout_add(
              GLib.PRIORITY_DEFAULT,
              300,
              () => {
                  let brightness = Math.round(this.slider.value * 254);

                  mqttPublish(
                      `${this.topicSlider}/set`,
                      JSON.stringify({ brightness }),
                      this.MQTT_USER,
                      this.MQTT_PASS,
                      this.MQTT_HOST
                  );

                  this._debounceTimeout = null;
                  return GLib.SOURCE_REMOVE;
              }
          );
      });
    }
});