// backend/src/utils/logger.ts

import { rotateLogIfNeeded }from "./logRotation.js";
import fs from "fs";
import {
  scanEventsTotal,
  attendanceEventsTotal,
  authEventsTotal,
  networkEventsTotal,
  streamingEventsTotal,
  socketEventsTotal,
  uploadEventsTotal,
  graphqlEventsTotal,
  errorEventsTotal,
} from "./metrics.js";

// ==========================
// 🎨 LOG COLORS
// ==========================
const COLORS = {
  reset: "\x1b[0m",

  server: "\x1b[34m",
  scan: "\x1b[36m",
  attendance: "\x1b[32m",
  network: "\x1b[33m",
  streaming: "\x1b[35m",
  auth: "\x1b[94m",
  socket: "\x1b[96m",
  upload: "\x1b[92m",
  graphql: "\x1b[95m",
  error: "\x1b[31m",
  general: "\x1b[37m",
};


function write(
  category: string,
  color: string,
  message: string,
  writeToFile = true
) {
  const timestamp =
    new Date().toISOString();

  const plainLog =
    `[${timestamp}] [${category}] ${message}`;

  console.log(
  `${color}[${category}]${COLORS.reset} ${message}`
);

  if (writeToFile) {

const backendLogPath =
  "logs/backend-logs/backend.log";

rotateLogIfNeeded(
  backendLogPath,
  50, // 50 MB Max
  10  // 10 Files Generated
);

fs.appendFileSync(
  backendLogPath,
  plainLog + "\n"
);
}
}

export const logger = {
  server: (msg: string) =>
    write("SERVER", COLORS.server, msg),

  scan: (msg: string) => {
    scanEventsTotal.inc();
    write("SCAN", COLORS.scan, msg);
  },

  attendance: (msg: string) => {
    attendanceEventsTotal.inc();
    write("ATTENDANCE", COLORS.attendance, msg);
  },

  network: (msg: string) => {
    networkEventsTotal.inc();
    write("NETWORK", COLORS.network, msg);
  },

  streaming: (msg: string) => {
    streamingEventsTotal.inc();
    write("STREAMING", COLORS.streaming, msg);
  },

  auth: (msg: string) => {
    authEventsTotal.inc();
    write("AUTH", COLORS.auth, msg);
  },

  socket: (msg: string) => {
    socketEventsTotal.inc();
    write("SOCKET", COLORS.socket, msg);
  },

  upload: (msg: string) => {
    uploadEventsTotal.inc();
    write("UPLOAD", COLORS.upload, msg);
  },

  graphql: (msg: string) => {
    graphqlEventsTotal.inc();
    write("GRAPHQL", COLORS.graphql, msg);
  },

  error: (msg: string) => {
    errorEventsTotal.inc();
    write("ERROR", COLORS.error, msg);
  },
};

// backward compatibility
export const writeLog = (message: string) => {
  write(
    "GENERAL",
    COLORS.general,
    message
  );
};

