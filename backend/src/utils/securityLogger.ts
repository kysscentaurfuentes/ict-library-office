// backend/src/utils/securityLogger.ts

import fs from "fs";
import path from "path";

const logsDir =
  path.join(process.cwd(), "logs");

if (!fs.existsSync(logsDir)) {

  fs.mkdirSync(
    logsDir,
    { recursive: true }
  );
}

const securityLogPath =
  path.join(
    logsDir,
    "security.log"
  );

type Severity =
  | "INFO"
  | "WARNING"
  | "CRITICAL";

export const securityLogger = (
  event: string,

  details: Record<string, any> = {},

  severity: Severity = "INFO"
) => {

  const logEntry = {

    timestamp:
      new Date().toISOString(),

    severity,

    event,

    ...details,
  };

  const formattedLog =
    JSON.stringify(logEntry);

  // Save to file
  fs.appendFileSync(
    securityLogPath,
    formattedLog + "\n"
  );

  // Output to console for Loki
console.warn(
  JSON.stringify({
    type: "SECURITY",
    ...logEntry
  })
);
};