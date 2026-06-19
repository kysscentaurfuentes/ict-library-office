// backend/src/utils/logger.ts

import fs from "fs";

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
    fs.appendFileSync(
      "logs/backend.log",
      plainLog + "\n"
    );
  }
}

export const logger = {
  server: (msg: string) =>
    write("SERVER", COLORS.server, msg),

  scan: (msg: string) =>
    write("SCAN", COLORS.scan, msg),

  attendance: (msg: string) =>
    write("ATTENDANCE", COLORS.attendance, msg),

  network: (msg: string) =>
    write("NETWORK", COLORS.network, msg),

  streaming: (msg: string) =>
    write("STREAMING", COLORS.streaming, msg),

  auth: (msg: string) =>
    write("AUTH", COLORS.auth, msg),

  socket: (msg: string) =>
    write("SOCKET", COLORS.socket, msg),

  upload: (msg: string) =>
    write("UPLOAD", COLORS.upload, msg),

  graphql: (msg: string) =>
    write("GRAPHQL", COLORS.graphql, msg),

  error: (msg: string) =>
    write("ERROR", COLORS.error, msg),
};

// backward compatibility
export const writeLog = (message: string) => {
  write(
    "GENERAL",
    COLORS.general,
    message
  );
};