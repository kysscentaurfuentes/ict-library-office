// backend/src/services/network/ping.service.ts

import ping from "ping";
import fs from "fs";
import path from "path";

import { devices } from "./devices.js";
import { deviceStatuses } from "./deviceState.js";

const previousStates = new Map<string, boolean>();

const logFilePath = path.join(
  process.cwd(),
  "logs",
  "network.log"
);

export async function monitorDevices() {
  for (const device of devices) {
    const result = await ping.promise.probe(
      device.ip
    );

    const currentStatus = result.alive;

    // ================================
    // UPDATE SHARED DEVICE STATE
    // ================================
    deviceStatuses.set(device.id, {
      id: device.id,
      ip: device.ip,
      online: currentStatus,
      latency: result.time,
      lastSeen: new Date().toISOString(),
    });

    const previousStatus =
      previousStates.get(device.id);

    // ================================
    // LOG ONLY WHEN STATE CHANGES
    // ================================
    if (previousStatus !== currentStatus) {
      const logMessage =
        `[NETWORK] ${new Date().toISOString()} | ` +
        `${device.id} (${device.ip}) is now ` +
        `${currentStatus ? "ONLINE" : "OFFLINE"} | ` +
        `Latency: ${result.time}ms\n`;

      // WRITE TO LOKI/PROMTAIL LOG FILE
      fs.appendFileSync(
        logFilePath,
        logMessage
      );

      // CLEAN TERMINAL MESSAGE
      console.log(
        `[NETWORK] ${device.id} changed state`
      );

      // SAVE CURRENT STATE
      previousStates.set(
        device.id,
        currentStatus
      );
    }
  }
}