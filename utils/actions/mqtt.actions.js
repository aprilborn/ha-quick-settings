import GLib from 'gi://GLib';

export function mqttPublish(topic, message, MQTT_USER, MQTT_PASS, MQTT_HOST) {
  let cmd = `/usr/bin/mosquitto_pub -u ${MQTT_USER} -P ${MQTT_PASS} -h ${MQTT_HOST} -t "${topic}" -m '${message}'`;
  GLib.spawn_command_line_async(cmd);
}