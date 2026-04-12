import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

/** Bundled SVG from this extension's `icons/` directory. */
export function extensionIcon(extensionPath, fileName) {
    let full = GLib.build_filenamev([extensionPath, 'icons', fileName]);
    return new Gio.FileIcon({ file: Gio.File.new_for_path(full) });
}
