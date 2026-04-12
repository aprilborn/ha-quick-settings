import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export function httpPublish(url) {
    let cmd = `/usr/bin/curl -X POST "${url}"`;
    GLib.spawn_command_line_async(cmd);
}