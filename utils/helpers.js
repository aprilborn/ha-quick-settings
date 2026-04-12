import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

// --- MQTT helpers ---
export function startMQTTListener(onMessage, MQTT_USER, MQTT_PASS, MQTT_HOST, topicSlider, topicButton) {
  let proc = Gio.Subprocess.new(
      [
          '/usr/bin/mosquitto_sub',
          '-v',
          '-h', MQTT_HOST,
          '-u', MQTT_USER,
          '-P', MQTT_PASS,
          '-t', topicSlider,
          '-t', topicButton,
      ],
      Gio.SubprocessFlags.STDOUT_PIPE
  );

  let stream = proc.get_stdout_pipe();
  let dataStream = new Gio.DataInputStream({ base_stream: stream });

  function readLine() {
      dataStream.read_line_async(GLib.PRIORITY_DEFAULT, null, (stream, res) => {
          try {
              let [line] = stream.read_line_finish(res);
              if (line) {
                  let msg = imports.byteArray.toString(line);
                  onMessage(msg);
                  readLine();
              }
          } catch (e) {
              logError(e);
          }
      });
  }

  readLine();
  return proc;
}