// backend/src/utils/auditLogger.ts
import { pool } from "../db.js";
import fs from "fs";

type AuditLogInput = {
  userId?: number | null;

  action: string;

  targetTable?: string | null;

  targetId?: string | null;

  metadata?: any;

  ipAddress?: string | null;

  userAgent?: string | null;

  severity?: string;

  source?: string;
};

export async function logAuditEvent({
  userId,
  action,
  targetTable,
  targetId,
  metadata,
  ipAddress,
  userAgent,
  severity = "INFO",
  source = "backend",
}: AuditLogInput) {

  try {

    await pool.query(
      `
      INSERT INTO audit_logs (
        user_id,
        action,
        target_table,
        target_id,
        metadata,
        ip_address,
        user_agent,
        severity,
        source
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      `,
      [
        userId || null,

        action,

        targetTable || null,

        targetId || null,

        metadata
          ? JSON.stringify(metadata)
          : null,

        ipAddress || null,

        userAgent || null,

        severity,

        source,
      ]
    );

  } catch (err) {

    console.error(
      "AUDIT LOG ERROR:",
      err
    );
  }
  fs.appendFileSync(
  "logs/security.log",
  `[${new Date().toISOString()}] ${action} | IP=${ipAddress}\n`
);
}