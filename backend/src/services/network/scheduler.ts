// backend/src/services/network/scheduler.ts

import { monitorDevices } from "./ping.service.js";

setInterval(async () => {
  await monitorDevices();
}, 5000);