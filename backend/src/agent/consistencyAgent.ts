// ICT-LIBRARY-OFFICE/backend/src/agent/consistencyAgent.ts

import { localPool, neonPool } from "../db.js";
import { logger } from "../utils/logger.js";

import {
  orphanRecordsTotal,
  missingChildRecordsTotal,
} from "../utils/metrics.js";

// =====================================
// USERS CONSISTENCY
// =====================================
async function checkUsersConsistency() {
  try {

    const localCountResult =
      await localPool.query(
        `SELECT COUNT(*)::int AS count FROM users`
      );

    const cloudCountResult =
      await neonPool.query(
        `SELECT COUNT(*)::int AS count FROM users`
      );

    const localCount =
      localCountResult.rows[0].count;

    const cloudCount =
      cloudCountResult.rows[0].count;

    // =====================================
    // STUDENT ID COMPARISON
    // =====================================

    const localStudentsResult =
      await localPool.query(`
        SELECT "StudentId"
        FROM users
        ORDER BY "StudentId"
      `);

    const cloudStudentsResult =
      await neonPool.query(`
        SELECT "StudentId"
        FROM users
        ORDER BY "StudentId"
      `);

    const localStudents =
      new Set(
        localStudentsResult.rows.map(
          (r) => r.StudentId
        )
      );

    const cloudStudents =
      new Set(
        cloudStudentsResult.rows.map(
          (r) => r.StudentId
        )
      );

    const missingInCloud =
      [...localStudents].filter(
        studentId =>
          !cloudStudents.has(studentId)
      );

    const extraInCloud =
      [...cloudStudents].filter(
        studentId =>
          !localStudents.has(studentId)
      );

    if (
      missingInCloud.length > 0 ||
      extraInCloud.length > 0
    ) {

      logger.consistencyMismatch(`
Missing StudentIds In Cloud:
${missingInCloud.join(", ") || "None"}

Extra Users Found In Cloud:
${extraInCloud.join(", ") || "None"}
`);

    }

    // =====================================
    // COUNT COMPARISON
    // =====================================

    if (localCount !== cloudCount) {

      logger.consistencyMismatch(
        `USERS COUNT MISMATCH | Local=${localCount} Cloud=${cloudCount}`
      );

    } else {

      logger.consistency(
        `USERS OK | Count=${localCount}`
      );

    }

  } catch (err) {

    logger.error(
      `[CONSISTENCY] ${String(err)}`
    );

  }
}

// =====================================
// ORPHAN RECORD CHECKS
// =====================================
async function checkOrphanRecords() {

  try {

    const orphanChecks = [

      {
        name: "user_profile",
        query: `
          SELECT up.user_id
          FROM user_profile up
          LEFT JOIN users u
            ON up.user_id = u.id
          WHERE u.id IS NULL
        `
      },

      {
        name: "user_security",
        query: `
          SELECT us.user_id
          FROM user_security us
          LEFT JOIN users u
            ON us.user_id = u.id
          WHERE u.id IS NULL
        `
      },

      {
        name: "user_preferences",
        query: `
          SELECT up.user_id
          FROM user_preferences up
          LEFT JOIN users u
            ON up.user_id = u.id
          WHERE u.id IS NULL
        `
      },

      {
        name: "user_2fa",
        query: `
          SELECT uf.user_id
          FROM user_2fa uf
          LEFT JOIN users u
            ON uf.user_id = u.id
          WHERE u.id IS NULL
        `
      }

    ];

    for (const check of orphanChecks) {

      const result =
        await localPool.query(
          check.query
        );

      if (result.rows.length > 0) {

  orphanRecordsTotal.inc(
    result.rows.length
  );

  logger.consistencyMismatch(
    `[ORPHAN] ${check.name}: ${
      result.rows
        .map(r => r.user_id)
        .join(", ")
    }`
  );

}

    }

  } catch (err) {

    logger.error(
      `[ORPHAN_CHECK] ${String(err)}`
    );

  }
}

// =====================================
// MISSING CHILD RECORDS
// =====================================
async function checkMissingChildRecords() {

  try {

    const checks = [

      {
        name: "MISSING_PROFILE",
        query: `
          SELECT u.id
          FROM users u
          LEFT JOIN user_profile up
            ON u.id = up.user_id
          WHERE up.user_id IS NULL
        `
      },

      {
        name: "MISSING_SECURITY",
        query: `
          SELECT u.id
          FROM users u
          LEFT JOIN user_security us
            ON u.id = us.user_id
          WHERE us.user_id IS NULL
        `
      },

      {
        name: "MISSING_PREFERENCES",
        query: `
          SELECT u.id
          FROM users u
          LEFT JOIN user_preferences up
            ON u.id = up.user_id
          WHERE up.user_id IS NULL
        `
      },

      {
        name: "MISSING_2FA",
        query: `
          SELECT u.id
          FROM users u
          LEFT JOIN user_2fa uf
            ON u.id = uf.user_id
          WHERE uf.user_id IS NULL
        `
      }

    ];

    for (const check of checks) {

      const result =
        await localPool.query(
          check.query
        );

     if (result.rows.length > 0) {

  missingChildRecordsTotal.inc(
    result.rows.length
  );

  logger.consistencyMismatch(
    `[${check.name}] ${
      result.rows
        .map(r => r.id)
        .join(", ")
    }`
  );

}

    }

  } catch (err) {

    logger.error(
      `[MISSING_CHILD_CHECK] ${String(err)}`
    );

  }
}

// =====================================
// MAIN RUNNER
// =====================================
async function runConsistencyChecks() {

  await checkUsersConsistency();

  await checkOrphanRecords();

  await checkMissingChildRecords();

}

// =====================================
// START
// =====================================

setInterval(
  runConsistencyChecks,
  5 * 60 * 1000
);

runConsistencyChecks();