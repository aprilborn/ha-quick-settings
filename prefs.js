import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class MyPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'MQTT Settings',
        });

        // --- helper ---
        function addEntry(title, key, isPassword = false) {
            const row = new Adw.EntryRow({ title });

            row.text = settings.get_string(key);

            if (isPassword) {
                row.visibility = false;
                row.input_purpose = Gtk.InputPurpose.PASSWORD;
            }

            row.connect('changed', (e) => {
                settings.set_string(key, e.text);
            });

            group.add(row);
        }

        addEntry('MQTT Host', 'mqtt-host');
        addEntry('MQTT Login', 'mqtt-user');
        addEntry('MQTT Password', 'mqtt-pass', true);

        addEntry('Button Topic', 'topic-button');
        addEntry('Button Topic label', 'button-topic-label');
        addEntry('Button Webhook', 'webhook-button');
        addEntry('Button Webhook label', 'button-webhook-label');
        addEntry('Slider Topic', 'topic-slider');

        page.add(group);
        window.add(page);
    }
}
