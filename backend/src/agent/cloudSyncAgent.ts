// backend/src/agent/cloudSyncAgent.ts
import { localPool, neonPool } from '../db.js';

async function processSyncQueue() {
  try {
    const pending = await localPool.query(`
      SELECT *
      FROM sync_queue
      WHERE synced = false
      ORDER BY created_at ASC
      LIMIT 20
    `);

    for (const item of pending.rows) {
      try {
        const payload = item.payload;

        // =========================
// USERS INSERT
// =========================
if (
  item.table_name === 'users' &&
  item.operation === 'insert'
) {

const columns =
  Object.keys(payload).map(
    col =>
      col === 'StudentId'
        ? `"StudentId"`
        : col
  );

  const values =
    Object.values(payload);

  const placeholders =
    columns.map(
      (_, i) => `$${i + 1}`
    );

  await neonPool.query(
    `
    INSERT INTO users (
      ${columns.join(',')}
    )
    VALUES (
      ${placeholders.join(',')}
    )
    ON CONFLICT (id)
    DO NOTHING
    `,
    values
  );
}

// =========================
// SIGNUP_PENDING INSERT
// =========================
if (
  item.table_name === 'signup_pending' &&
  item.operation === 'insert'
) {

  const columns =
    Object.keys(payload).map(
      col =>
        col === 'StudentId'
          ? `"StudentId"`
          : col
    );

  const values =
    Object.values(payload);

  const placeholders =
    columns.map(
      (_, i) => `$${i + 1}`
    );

  await neonPool.query(
    `
    INSERT INTO signup_pending (
      ${columns.join(',')}
    )
    VALUES (
      ${placeholders.join(',')}
    )
    `,
    values
  );
}

// =========================
// SIGNUP_PENDING UPDATE
// =========================
if (
  item.table_name === 'signup_pending' &&
  item.operation === 'update'
) {

  const columns =
    Object.keys(payload)
      .filter(
        key => key !== 'id'
      );

  const values =
    columns.map(
      col => payload[col]
    );

  const setClause =
    columns.map(
      (col, i) =>
        `${col} = $${i + 1}`
    );

  await neonPool.query(
    `
    UPDATE signup_pending
    SET
      ${setClause.join(',')}
    WHERE id = $${columns.length + 1}
    `,
    [
      ...values,
      payload.id
    ]
  );
}

// =========================
// SIGNUP_PENDING DELETE
// =========================
if (
  item.table_name === 'signup_pending' &&
  item.operation === 'delete'
) {

  await neonPool.query(
    `
    DELETE FROM signup_pending
    WHERE id = $1
    `,
    [payload.id]
  );
}
        // ✅ MARK AS SYNCED
        await localPool.query(
          `
          UPDATE sync_queue
          SET synced = true
          WHERE id = $1
          `,
          [item.id]
        );

        console.log(`☁️ Synced queue #${item.id}`);

      } catch (err) {
        console.error(
          `❌ Failed sync queue #${item.id}`,
          err
        );

        await localPool.query(
          `
          UPDATE sync_queue
          SET retry_count = retry_count + 1
          WHERE id = $1
          `,
          [item.id]
        );
      }
    }

  } catch (err) {
    console.error('❌ Cloud sync agent error:', err);
  }
}

// 🔁 EVERY 5 SECONDS
setInterval(processSyncQueue, 5000);

// RUN IMMEDIATELY
processSyncQueue();