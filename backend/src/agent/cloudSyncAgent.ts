// backend/src/agent/cloudSyncAgent.ts

import { localPool, neonPool } from '../db.js';

async function processSyncQueue() {

  try {

    const pending = await localPool.query(`
      SELECT *
      FROM sync_queue
      WHERE
  synced = false
  AND retry_count < 20
      ORDER BY created_at ASC
      LIMIT 20
    `);

    for (const item of pending.rows) {

      try {

        const payload = item.payload;

        // =====================================================
        // HELPERS
        // =====================================================

        const columns = Object.keys(payload).map(
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

        // =====================================================
        // USERS INSERT
        // =====================================================

        if (
          item.table_name === 'users' &&
          item.operation === 'insert'
        ) {

          await neonPool.query(
            `
            INSERT INTO users (
              ${columns.join(',')}
            )
            VALUES (
              ${placeholders.join(',')}
            )
            ON CONFLICT (email)
            DO NOTHING
            `,
            values
          );
        }

        // =====================================================
        // USERS UPDATE
        // =====================================================

        if (
          item.table_name === 'users' &&
          item.operation === 'update'
        ) {

          const updateColumns =
            Object.keys(payload)
              .filter(
                key => key !== 'id'
              );

          const updateValues =
            updateColumns.map(
              col => payload[col]
            );

          const setClause =
            updateColumns.map(
              (col, i) =>
                `${
                  col === 'StudentId'
                    ? `"StudentId"`
                    : col
                } = $${i + 1}`
            );

          await neonPool.query(
            `
            UPDATE users
            SET
              ${setClause.join(',')}
            WHERE id = $${updateColumns.length + 1}
            `,
            [
              ...updateValues,
              payload.id
            ]
          );
        }

        // =====================================================
        // SIGNUP_PENDING INSERT
        // =====================================================

        if (
          item.table_name === 'signup_pending' &&
          item.operation === 'insert'
        ) {

          await neonPool.query(
            `
            INSERT INTO signup_pending (
              ${columns.join(',')}
            )
            VALUES (
              ${placeholders.join(',')}
            )
            ON CONFLICT (email)
            DO NOTHING
            `,
            values
          );
        }

        // =====================================================
        // SIGNUP_PENDING UPDATE
        // =====================================================

        if (
          item.table_name === 'signup_pending' &&
          item.operation === 'update'
        ) {

          const updateColumns =
            Object.keys(payload)
              .filter(
                key => key !== 'id'
              );

          const updateValues =
            updateColumns.map(
              col => payload[col]
            );

          const setClause =
            updateColumns.map(
              (col, i) =>
                `${
                  col === 'StudentId'
                    ? `"StudentId"`
                    : col
                } = $${i + 1}`
            );

          await neonPool.query(
            `
            UPDATE signup_pending
            SET
              ${setClause.join(',')}
            WHERE id = $${updateColumns.length + 1}
            `,
            [
              ...updateValues,
              payload.id
            ]
          );
        }

        // =====================================================
        // SIGNUP_PENDING DELETE
        // =====================================================

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

        // =====================================================
        // USER_PROFILE INSERT
        // =====================================================

        if (
          item.table_name === 'user_profile' &&
          item.operation === 'insert'
        ) {

          await neonPool.query(
            `
            INSERT INTO user_profile (
              ${columns.join(',')}
            )
            VALUES (
              ${placeholders.join(',')}
            )
            ON CONFLICT (user_id)
            DO NOTHING
            `,
            values
          );
        }

        // =====================================================
        // USER_PROFILE UPDATE
        // =====================================================

        if (
          item.table_name === 'user_profile' &&
          item.operation === 'update'
        ) {

          const updateColumns =
            Object.keys(payload)
              .filter(
                key => key !== 'id'
              );

          const updateValues =
            updateColumns.map(
              col => payload[col]
            );

          const setClause =
            updateColumns.map(
              (col, i) =>
                `${col} = $${i + 1}`
            );

          await neonPool.query(
            `
            UPDATE user_profile
            SET
              ${setClause.join(',')}
            WHERE id = $${updateColumns.length + 1}
            `,
            [
              ...updateValues,
              payload.id
            ]
          );
        }

        // =====================================================
        // USER_PREFERENCES INSERT
        // =====================================================

        if (
          item.table_name === 'user_preferences' &&
          item.operation === 'insert'
        ) {

          await neonPool.query(
            `
            INSERT INTO user_preferences (
              ${columns.join(',')}
            )
            VALUES (
              ${placeholders.join(',')}
            )
            ON CONFLICT (user_id)
            DO NOTHING
            `,
            values
          );
        }

        // =====================================================
        // USER_PREFERENCES UPDATE
        // =====================================================

        if (
          item.table_name === 'user_preferences' &&
          item.operation === 'update'
        ) {

          const updateColumns =
            Object.keys(payload)
              .filter(
                key => key !== 'id'
              );

          const updateValues =
            updateColumns.map(
              col => payload[col]
            );

          const setClause =
            updateColumns.map(
              (col, i) =>
                `${col} = $${i + 1}`
            );

          await neonPool.query(
            `
            UPDATE user_preferences
            SET
              ${setClause.join(',')}
            WHERE id = $${updateColumns.length + 1}
            `,
            [
              ...updateValues,
              payload.id
            ]
          );
        }

        // =====================================================
        // USER_SECURITY INSERT
        // =====================================================

        if (
          item.table_name === 'user_security' &&
          item.operation === 'insert'
        ) {

          await neonPool.query(
            `
            INSERT INTO user_security (
              ${columns.join(',')}
            )
            VALUES (
              ${placeholders.join(',')}
            )
            ON CONFLICT (user_id)
            DO NOTHING
            `,
            values
          );
        }

        // =====================================================
        // USER_SECURITY UPDATE
        // =====================================================

        if (
          item.table_name === 'user_security' &&
          item.operation === 'update'
        ) {

          const updateColumns =
            Object.keys(payload)
              .filter(
                key => key !== 'id'
              );

          const updateValues =
            updateColumns.map(
              col => payload[col]
            );

          const setClause =
            updateColumns.map(
              (col, i) =>
                `${col} = $${i + 1}`
            );

          await neonPool.query(
            `
            UPDATE user_security
            SET
              ${setClause.join(',')}
            WHERE id = $${updateColumns.length + 1}
            `,
            [
              ...updateValues,
              payload.id
            ]
          );
        }

        // =====================================================
        // USER_2FA INSERT
        // =====================================================

        if (
          item.table_name === 'user_2fa' &&
          item.operation === 'insert'
        ) {

          await neonPool.query(
            `
            INSERT INTO user_2fa (
              ${columns.join(',')}
            )
            VALUES (
              ${placeholders.join(',')}
            )
            ON CONFLICT (user_id)
            DO NOTHING
            `,
            values
          );
        }

        // =====================================================
        // USER_2FA UPDATE
        // =====================================================

        if (
          item.table_name === 'user_2fa' &&
          item.operation === 'update'
        ) {

          const updateColumns =
            Object.keys(payload)
              .filter(
                key => key !== 'id'
              );

          const updateValues =
            updateColumns.map(
              col => payload[col]
            );

          const setClause =
            updateColumns.map(
              (col, i) =>
                `${col} = $${i + 1}`
            );

          await neonPool.query(
            `
            UPDATE user_2fa
            SET
              ${setClause.join(',')}
            WHERE id = $${updateColumns.length + 1}
            `,
            [
              ...updateValues,
              payload.id
            ]
          );
        }

        // =====================================================
        // PASSWORD_RESETS INSERT
        // =====================================================

        if (
          item.table_name === 'password_resets' &&
          item.operation === 'insert'
        ) {

          await neonPool.query(
            `
            INSERT INTO password_resets (
              ${columns.join(',')}
            )
            VALUES (
              ${placeholders.join(',')}
            )
            `,
            values
          );
        }

        // =====================================================
// PASSWORD_RESETS UPDATE
// =====================================================

if (
  item.table_name === 'password_resets' &&
  item.operation === 'update'
) {

  const updateColumns =
    Object.keys(payload)
      .filter(
        key => key !== 'id'
      );

  const updateValues =
    updateColumns.map(
      col => payload[col]
    );

  const setClause =
    updateColumns.map(
      (col, i) =>
        `${col} = $${i + 1}`
    );

  await neonPool.query(
    `
    UPDATE password_resets
    SET
      ${setClause.join(',')}
    WHERE id = $${updateColumns.length + 1}
    `,
    [
      ...updateValues,
      payload.id
    ]
  );
}

// =====================================================
// PASSWORD_RESETS DELETE
// =====================================================

if (
  item.table_name === 'password_resets' &&
  item.operation === 'delete'
) {

  await neonPool.query(
    `
    DELETE FROM password_resets
    WHERE id = $1
    `,
    [payload.id]
  );
}

        // =====================================================
        // FORGOT_PASSWORD_SECURITY INSERT
        // =====================================================

        if (
          item.table_name === 'forgot_password_security' &&
          item.operation === 'insert'
        ) {

          await neonPool.query(
            `
            INSERT INTO forgot_password_security (
              ${columns.join(',')}
            )
            VALUES (
              ${placeholders.join(',')}
            )
            ON CONFLICT (identifier)
            DO NOTHING
            `,
            values
          );
        }

        // =====================================================
        // FORGOT_PASSWORD_SECURITY UPDATE
        // =====================================================

        if (
          item.table_name === 'forgot_password_security' &&
          item.operation === 'update'
        ) {

          const updateColumns =
            Object.keys(payload)
              .filter(
                key => key !== 'id'
              );

          const updateValues =
            updateColumns.map(
              col => payload[col]
            );

          const setClause =
            updateColumns.map(
              (col, i) =>
                `${col} = $${i + 1}`
            );

          await neonPool.query(
            `
            UPDATE forgot_password_security
            SET
              ${setClause.join(',')}
            WHERE id = $${updateColumns.length + 1}
            `,
            [
              ...updateValues,
              payload.id
            ]
          );
        }

        // =====================================================
// POLICY_ACCEPTANCE_HISTORY INSERT
// =====================================================

if (
  item.table_name === 'policy_acceptance_history' &&
  item.operation === 'insert'
) {

  await neonPool.query(
    `
    INSERT INTO policy_acceptance_history (
      ${columns.join(',')}
    )
    VALUES (
      ${placeholders.join(',')}
    )
    ON CONFLICT DO NOTHING
    `,
    values
  );
}

        // =====================================================
        // MARK AS SYNCED
        // =====================================================

     await localPool.query(
  `
  UPDATE sync_queue
  SET
    synced = true,
    synced_at = NOW(),
    failed = false,
    last_error = NULL
  WHERE id = $1
  `,
  [item.id]
);

        console.log(
          `☁️ Synced queue #${item.id}`
        );

      } catch (err: any) {

        console.error(
          `❌ Failed sync queue #${item.id}`,
          err
        );

        await localPool.query(
  `
  UPDATE sync_queue
  SET
    retry_count = retry_count + 1,
    failed = true,
    last_error = $2
  WHERE id = $1
  `,
  [
    item.id,
    String(err.message || err)
  ]
);
      }
    }

  } catch (err) {

    console.error(
      '❌ Cloud sync agent error:',
      err
    );
  }
}

// =====================================================
// RUN EVERY 5 SECONDS
// =====================================================

setInterval(
  processSyncQueue,
  5000
);

// =====================================================
// RUN IMMEDIATELY
// =====================================================

processSyncQueue();