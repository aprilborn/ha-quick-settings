# Gnome Extension

A simple [GNOME Shell](https://www.gnome.org/gnome-shell/) extension to interact with your local [Home Assistant](https://www.home-assistant.io/) instance.

![Screenshot of Home Assistant GNOME Extension in Quick Settings](/icons/extension.webp)

## Installation

1. **Clone this repo:**
   ```bash
   git clone https://github.com/aprilborn/ha-quick-settings.git
   ```

2. **Copy to extensions directory:**
   ```bash
   mv ha-quick-settings ~/.local/share/gnome-shell/extensions/home-assistant@local
   ```

3. **Restart GNOME Shell:**
   - Press <kbd>Alt</kbd> + <kbd>F2</kbd>, type `r` and press <kbd>Enter</kbd> (on Xorg), or log out and log in again.

4. **Enable the extension:**
   - Use [GNOME Extension Manager](https://extensions.gnome.org/local/) app or `gnome-extensions enable home-assistant@local`.

## Usage

- Open Extension Manager
- Configure extension:
  - MQTT URL
  - MQTT Username
  - MQTT Password
  - MQTT topics ( _for 1st button_)
  - Webhook URL (_for 2nd button_)
  - Slider topic
  - MQTT button label
  - Webhook button label
- Enable/Re-enable extension.
- Open Quick Settings to see new buttons and slider.

![Screenshot of Home Assistant GNOME Extension in Quick Settings](/icons/settings.webp)


## Development

- The entry point is `extension.js`.
- Make edits and reload GNOME Shell to see changes.
- For troubleshooting, see logs with:
  ```bash
  journalctl /usr/bin/gnome-shell -f -o cat
  ```

## License

MIT

---

Questions, suggestions, or contributions welcome!
[Open an issue](https://github.com/aprilborn/ha-quick-settings/issues) or submit a PR.
