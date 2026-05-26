// backend/src/utils/logger.ts
import fs from "fs";

export const writeLog = (message: string) => {
  const timestamp = new Date().toISOString();

  const log = `[${timestamp}] ${message}\n`;

  fs.appendFileSync("logs/backend.log", log);
};