// backend/src/resolvers.ts
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { sendOTP } from "./utils/mailer.js";
import crypto from "crypto";
import { GraphQLError } from "graphql";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import fetch from 'node-fetch';
dotenv.config();
import { CURRENT_POLICY_VERSION } from "./constants/policy.js";
import { logAuditEvent }
from "./utils/auditLogger.js";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const ROOT_DIR =
  path.resolve(__dirname, "..");

const TEMP_SCHOOL_IDS_DIR =
  path.join(
    ROOT_DIR,
    "uploads",
    "temporary school-ids"
  );

const SCHOOL_IDS_DIR =
  path.join(
    ROOT_DIR,
    "uploads",
    "school-ids"
  );

const SECRET = process.env.JWT_SECRET as string;

interface UserRow {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  password: string;
  StudentId: string;
  course: string;
  school_id_image?: string;
  role: string;

  suffix?: string;
  suffix_locked?: boolean;
  phone_number?: string;

  birthdate?: string | null;
  birthdate_locked?: boolean;

  age?: number;

  gender?: string;
  gender_locked?: boolean;

  nationality?: string;
  nationality_locked?: boolean;

  user_classification?: string;

  student_type?: string;
  college_department?: string;

  program?: string;
  year_level?: string;

  profile_picture?: string;
  vibration_enabled?: boolean;
  dark_mode?: boolean;

  two_factor_enabled?: boolean;
  two_factor_otp?: string | null;
  two_factor_otp_expires_at?: string | null;

  two_factor_secret?: string | null;
two_factor_temp_secret?: string | null;
two_factor_confirmed?: boolean;
two_factor_backup_codes?: string[] | null;

  failed_login_attempts?: number;
  login_locked_until?: string | null;

  failed_otp_attempts?: number;
  otp_locked_until?: string | null;

  last_otp_sent_at?: string | null;

  account_status?: string;

  policy_accepted?: boolean;
policy_version?: string;
policy_accepted_at?: string | null;

failed_forgot_attempts?: number;

forgot_locked_until?: string | null;

forgot_request_count?: number;

forgot_request_locked_until?: string | null;

forgot_request_last_sent_at?: string | null;

forgot_request_last_ip?: string | null;

failed_change_password_attempts?: number;

change_password_locked_until?: string | null;

}
interface SignupPendingRow {
  id: number;

  first_name: string;
  middle_name: string | null;
  last_name: string;

  email: string;
  password: string;

  StudentId: string;

  course: string;
  school_id_image: string;

  signup_otp: string;
  signup_otp_expires_at: string;

  failed_signup_attempts?: number;
  signup_locked_until?: string | null;
  email_verified?: boolean;
account_status?: string;
}

type Context = {
  authUser?: {
    userId: number;
    role: string;
  } | null;

  ip?: string;

  userAgent?: string;
};

function assertUser(user: UserRow | undefined): asserts user is UserRow {
  if (!user) throw new Error('Invalid credentials');
}

function requireAuth(context: Context) {
  if (!context.authUser) {
    throw new Error('Not authenticated');
  }

  return context.authUser;
}

function requireAdmin(context: Context) {
  const user = requireAuth(context);

  if (user.role !== 'Admin') {
    throw new Error('Unauthorized: Admin only');
  }

  return user;
}

function normalizeMac(mac: string) {
  return mac.toLowerCase().replace(/-/g, ':');
}

function isValidMac(mac: string) {
  return /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(mac);
}

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

function normalizeStudentId(id: string) {
  const clean = id.replace(/-/g, '');

  if (clean.length === 7) {
    return `${clean.slice(0,3)}-${clean.slice(3)}`;
  }

  return id;
}

function isStudentId(value: string) {
  return /^\d{3}-?\d+$/.test(value);
}

function buildEmail(identifier: string) {
  const clean = normalizeIdentifier(identifier);

  if (clean.includes('@')) {
    return clean;
  }

  return `${clean}@carsu.edu.ph`;
}

export const resolvers = {
  Query: { // QUERY START OF QUERY

    hello: () => "Backend is working with Router 🚀",

    checkOtpStatus: async (
      _: any,
      { identifier }: any
    ) => {

      const clean =
        normalizeIdentifier(identifier);

      const result =
        await pool.query<UserRow>(
          `
  SELECT
  s.failed_otp_attempts,
  s.otp_locked_until

FROM users u

LEFT JOIN user_security s
ON s.user_id = u.id

WHERE LOWER(u.email) = LOWER($1)
   OR u."StudentId" = $2
          `,
          [buildEmail(clean), clean]
        );

      const user = result.rows[0];

      assertUser(user);
      console.log("CHECK OTP STATUS USER:", {
  email: user.email,
  failed_otp_attempts: user.failed_otp_attempts,
  otp_locked_until: user.otp_locked_until,
  serverNow: new Date().toISOString()
});

      return {
        failedAttempts:
          user.failed_otp_attempts || 0,

        lockedUntil:
          user.otp_locked_until
      };
    },
    // ME QUERY
    me: async (
      _: any,
      __: any,
      context: Context
    ) => {

      const auth =
        requireAuth(context);

      const res =
        await pool.query<UserRow>(
          `
         SELECT
  u.id,

  u.first_name,
  u.middle_name,
  u.last_name,

  u.email,

  u."StudentId",

  u.course,

  u.school_id_image,

  u.role,

  p.suffix,
  p.suffix_locked,

  p.phone_number,

  p.birthdate,
  p.birthdate_locked,

  p.age,

  p.gender,
  p.gender_locked,

  p.nationality,
  p.nationality_locked,

  p.user_classification,

  p.student_type,

  p.college_department,

  p.program,

  p.year_level,

  u.profile_picture,

  pref.vibration_enabled,

  pref.dark_mode,

  t.enabled AS two_factor_enabled,

  u.account_status,

  u.policy_version,
u.policy_accepted,
u.policy_accepted_at

FROM users u

LEFT JOIN user_profile p
ON p.user_id = u.id

LEFT JOIN user_preferences pref
ON pref.user_id = u.id

LEFT JOIN user_2fa t
ON t.user_id = u.id

WHERE u.id = $1
          `,
          [auth.userId]
        );

      const user =
        res.rows[0];

      assertUser(user);

      return user;
    },
    // END OF ME QUERY

    // ROUTER DEVICES QUERY
    routerDevices: async (_: unknown, __: unknown, context: Context) => {
      requireAuth(context);

      const res = await pool.query(`
        SELECT 
          device_id as mac,
          custom_name as name,
          is_alive as "isAlive",
          last_seen as "lastSeen",
          is_blocked as "isBlocked"
        FROM devices
        ORDER BY last_seen DESC NULLS LAST
      `);

      return res.rows;
    },
    // END ROUTER DEVICES QUERY

    // START OF AUDIT LOGS QUERY
    auditLogs: async (
  _: any,
  __: any,
  context: Context
) => {

  requireAdmin(context);

  const result =
    await pool.query(
      `
      SELECT *
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100
      `
    );

  return result.rows.map((row) => ({
    ...row,

    metadata:
      row.metadata
        ? JSON.stringify(
            row.metadata,
            null,
            2
          )
        : null,
  }));
},
// END OF AUDIT LOGS QUERY

    // PENDING USERS QUERY
    pendingUsers: async (
  _: any,
  __: any,
  context: Context
) => {

  requireAdmin(context);

const result = await pool.query(
  `
  SELECT
    id,
    first_name,
    middle_name,
    last_name,
    email,
    "StudentId",
    course,
    school_id_image,
    account_status
  FROM signup_pending
  WHERE
  email_verified = true
AND
  account_status = 'PENDING'
  ORDER BY id DESC
  `
);

  return result.rows;
},
 // END OF PENDING USERS QUERY

 // CHECK SIGNUP AVAILABILITY QUERY
checkSignupAvailability: async (
  _: any,
  {
    email,
    StudentId
  }: {
    email?: string;
    StudentId?: string;
  }
) => {

  if (email) {

    const existingEmail =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        `,
        [email.trim().toLowerCase()]
      );

    return {
      available:
        existingEmail.rows.length === 0,
      field: "email"
    };
  }

  if (StudentId) {

    const existingStudentId =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE "StudentId" = $1
        `,
        [normalizeStudentId(StudentId)]
      );

    return {
      available:
        existingStudentId.rows.length === 0,
      field: "StudentId"
    };
  }

  throw new Error("Missing input");
},
 // END OF CHECK SIGNUP AVAILABILITY QUERY
 checkSignupOtpStatus: async (
  _: any,
  { email }: any
) => {

  const normalizedEmail =
    email.trim().toLowerCase();

  const result =
    await pool.query(
      `
      SELECT
        failed_signup_attempts,
        signup_locked_until
      FROM signup_pending
      WHERE LOWER(email) = LOWER($1)
      `,
      [normalizedEmail]
    );

  const pending =
    result.rows[0];

  if (!pending) {

    return {
      failedAttempts: 0,
      lockedUntil: null
    };
  }

 return {
  failedAttempts:
    pending.failed_signup_attempts || 0,

  lockedUntil:
    pending.signup_locked_until
      ? new Date(
          pending.signup_locked_until
        ).getTime()
      : null
};
},
checkChangePasswordStatus: async (
  _: any,
  __: any,
  context: Context
) => {

  const auth =
    requireAuth(context);

const result =
  await pool.query(
    `
    SELECT
      s.failed_change_password_attempts
        AS "failedAttempts",

      s.change_password_locked_until
        AS "lockedUntil"

    FROM user_security s

    WHERE s.user_id = $1
    `,
    [auth.userId]
  );

  const row =
    result.rows[0];

  return {
  failedAttempts:
    row?.failedAttempts || 0,

  lockedUntil:
    row?.lockedUntil
      ? new Date(
          row.lockedUntil
        ).toISOString()
      : null,
};
},
checkForgotPasswordLock: async (
  _: any,
  {
  identifier,
  captchaToken
}: any,
  context: Context
) => {

  const ip =
    context.ip || "unknown";

  const result =
    await pool.query(
      `
      SELECT
        request_count,
        locked_until
      FROM forgot_password_security
      WHERE ip_address = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [ip]
    );

  const security =
    result.rows[0];

  if (!security) {

    return {
      locked: false,
      attempts: 0,
      remainingSeconds: 0,
    };
  }

  const lockedUntil =
    security.locked_until
      ? new Date(
          security.locked_until
        ).getTime()
      : 0;

  const remainingSeconds =
    Math.max(
      0,
      Math.floor(
        (lockedUntil - Date.now()) / 1000
      )
    );

  return {
    locked:
      remainingSeconds > 0,

    attempts:
      security.request_count || 0,

    remainingSeconds,
  };
},

checkForgotPasswordOtpStatus: async (
  _: any,
  { identifier }: any
) => {

  const clean =
    normalizeIdentifier(identifier);

  const result =
    await pool.query(
      `
      SELECT
        s.failed_forgot_attempts,
        s.forgot_locked_until,

        p.otp_expires_at

      FROM users u

      LEFT JOIN user_security s
      ON s.user_id = u.id

      LEFT JOIN password_resets p
      ON p.user_id = u.id

      WHERE LOWER(u.email) = LOWER($1)
         OR u."StudentId" = $2
      `,
      [
        buildEmail(clean),
        clean
      ]
    );

  const row =
    result.rows[0];

  if (!row) {

    return {
      failedAttempts: 0,
      locked: false,
      remainingSeconds: 0,
      expiresInSeconds: 0,
    };
  }

  const lockedUntil =
    row.forgot_locked_until
      ? new Date(
          row.forgot_locked_until
        ).getTime()
      : 0;

  const otpExpires =
    row.otp_expires_at
      ? new Date(
          row.otp_expires_at
        ).getTime()
      : 0;

  const remainingSeconds =
    Math.max(
      0,
      Math.floor(
        (lockedUntil - Date.now()) / 1000
      )
    );

  const expiresInSeconds =
    Math.max(
      0,
      Math.floor(
        (otpExpires - Date.now()) / 1000
      )
    );

  return {
    failedAttempts:
      row.failed_forgot_attempts || 0,

    locked:
      remainingSeconds > 0,

    remainingSeconds,

    expiresInSeconds,
  };
},

scanLogs: async () => {

  const result =
    await pool.query(`
      SELECT *
      FROM scan_logs
      ORDER BY created_at DESC
    `);

  return result.rows;
},
  }, // END OF QUERY
  
  // START OF MUTATION
   Mutation: {
    // =====================================
    // REQUEST FORGOT PASSWORD OTP
    // =====================================
    requestForgotPasswordOTP: async (
  _: any,
  {
  identifier,
  captchaToken
}: any,
  context: Context
) => {
const ip =
  context.ip || "unknown";

const userAgent =
  context.userAgent || "unknown";

const clean =
  normalizeIdentifier(identifier);

// =========================
// IP RATE LIMIT CHECK
// =========================
const securityResult =
  await pool.query(
    `
    SELECT *
    FROM forgot_password_security
    WHERE ip_address = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [ip]
  );

const security =
  securityResult.rows[0];

  const currentCount =
  security?.request_count || 0;

const nextCount =
  currentCount + 1;

const captchaRequired =
  nextCount >= 3;

  // =========================
// CLOUDFLARE TURNSTILE
// CAPTCHA VERIFICATION
// =========================

if (captchaRequired) {

  if (!captchaToken) {

    await logAuditEvent({

  action:
    "PASSWORD_RESET_BLOCKED",

  metadata: {
    identifier: clean,
    reason:
      "CAPTCHA_REQUIRED"
  },

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});

  return {
  success: false,
  message:
    'CAPTCHA verification required.',

  otpSent: false,

  locked: false,

  attempts: nextCount,

  maxAttempts: 5,

  remainingSeconds: 0,

  captchaRequired: true,
};
  }

  const verifyResponse =
    await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({

          secret:
            process.env
              .TURNSTILE_SECRET_KEY,

          response:
            captchaToken,
        }),
      }
    );

  const verifyData: any =
    await verifyResponse.json();

  console.log(
    'TURNSTILE VERIFY:',
    verifyData
  );

  if (!verifyData.success) {

    await logAuditEvent({

  action:
    "PASSWORD_RESET_BLOCKED",

  metadata: {
    identifier: clean,
    reason:
      "CAPTCHA_FAILED"
  },

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});

    throw new Error(
      'CAPTCHA verification failed.'
    );
  }
}

// RESET EXPIRED LOCK
if (
  security?.locked_until &&
  new Date(
    security.locked_until
  ).getTime() < Date.now()
) {

  await pool.query(
    `
    UPDATE forgot_password_security
    SET
      locked_until = NULL
    WHERE id = $1
    `,
    [security.id]
  );
}

// ACTIVE LOCK
if (
  security?.locked_until &&
  new Date(
    security.locked_until
  ).getTime() > Date.now()
) {

 const remainingSeconds =
  Math.max(
    0,
    Math.floor(
      (
        new Date(
          security.locked_until
        ).getTime() -
        Date.now()
      ) / 1000
    )
  );

return {
  success: true,
  message:
    "Too many requests. Try again later.",

  otpSent: false,

  locked: true,

  attempts:
    security.request_count || 5,

  maxAttempts: 5,

  remainingSeconds,
  captchaRequired,
};
}

let requestCount = 1;
// =========================
// TRACK IP REQUESTS
// =========================
if (!security) {

  await pool.query(
    `
    INSERT INTO forgot_password_security (
      ip_address,
      identifier,
      request_count,
      last_request_at,
      user_agent
    )

    VALUES (
      $1,
      $2,
      1,
      NOW(),
      $3
    )
    `,
    [
      ip,
      clean,
      userAgent
    ]
  );

} else {

requestCount =
  (security.request_count || 0) + 1;

let lockUntil = null;

// =========================
// EXPONENTIAL LOCK
// DEBUG VALUES (SECONDS)
// =========================

if (requestCount >= 5) {

  let lockSeconds = 10;

  // DEBUG:
  // 5th request  = 10 sec
  // 6th request  = 15 sec
  // 7th request  = 20 sec
  // 8th request  = 25 sec

  // PRODUCTION:
  // 5th request  = 1 min
  // 6th request  = 5 mins
  // 7th request  = 15 mins
  // 8th request  = 1 hour

  switch (requestCount) {

    case 5:
      lockSeconds = 10;
      // PRODUCTION = 60
      break;

    case 6:
      lockSeconds = 15;
      // PRODUCTION = 300
      break;

    case 7:
      lockSeconds = 20;
      // PRODUCTION = 900
      break;

    default:
      lockSeconds = 25;
      // PRODUCTION = 3600
      break;
  }

  lockUntil =
    new Date(
      Date.now() +
      lockSeconds * 1000
    );
}

  await pool.query(
    `
    UPDATE forgot_password_security
    SET
      request_count = $1,

      last_request_at = NOW(),

      locked_until = $2,

      identifier = $3,

      user_agent = $4

    WHERE id = $5
    `,
    [
      requestCount,
      lockUntil,
      clean,
      userAgent,
      security.id
    ]
  );
  if (lockUntil) {

  return {
    success: true,
    message:
      "Too many requests. Try again later.",

    otpSent: false,

    locked: true,

    attempts: requestCount,

    maxAttempts: 5,

    remainingSeconds:
      Math.max(
        0,
        Math.floor(
          (
            lockUntil.getTime() -
            Date.now()
          ) / 1000
        )
      ),

    captchaRequired: true,
  };
}
}

const result =
  await pool.query<UserRow>(
      `
      SELECT *
      FROM users
      WHERE LOWER(email) = LOWER($1)
         OR "StudentId" = $2
      `,
      [
        buildEmail(clean),
        clean
      ]
    );

  const user =
    result.rows[0];

if (!user) {


return {
  success: true,
  message:
    "If the account exists, an OTP has been sent.",

  otpSent: false,

  locked: false,

  attempts:
    requestCount,

  maxAttempts: 5,

  remainingSeconds: 0,
  captchaRequired:
  requestCount >= 3,
};
}

  // =========================
  // CHECK LOCK
  // =========================
  const lockCheck =
    await pool.query(
      `
     SELECT
  NOW() < s.forgot_locked_until
  AS locked
FROM user_security s
WHERE s.user_id = $1
      `,
      [user.id]
    );

  if (lockCheck.rows[0]?.locked) {
    throw new Error(
      "Too many attempts. Try again later."
    );
  }

  // =========================
  // GENERATE OTP
  // =========================
  const code =
    Math.floor(
      100000 +
      Math.random() * 900000
    ).toString();

  const hashedOTP =
    crypto
      .createHmac(
        "sha256",
        process.env.JWT_SECRET!
      )
      .update(code)
      .digest("hex");

  // =========================
// SAVE OTP
// =========================
const resetInsert =
  await pool.query(
    `
    INSERT INTO password_resets (
      user_id,
      otp_hash,
      otp_expires_at
    )

    VALUES (
      $1,
      $2,
      NOW() + INTERVAL '5 minutes'
    )

    ON CONFLICT (user_id)

    DO UPDATE SET
      otp_hash = EXCLUDED.otp_hash,

      otp_expires_at =
        EXCLUDED.otp_expires_at,

      updated_at = NOW()

    RETURNING *
    `,
    [
      user.id,
      hashedOTP
    ]
  );

const resetRow =
  resetInsert.rows[0];

// =========================
// SYNC PASSWORD RESET
// =========================
await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "password_resets",
    "insert",
    JSON.stringify(resetRow)
  ]
);

  // =========================
  // SEND EMAIL
  // =========================
  await sendOTP(
    user.email,
    code
  );

  await logAuditEvent({

  action:
    "PASSWORD_RESET_REQUESTED",

  metadata: {
    identifier: clean
  },

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});


return {
  success: true,
  message:
    "OTP sent successfully.",

  otpSent: true,

  locked: false,

  attempts:
    requestCount,

  maxAttempts: 5,

  remainingSeconds: 0,
  captchaRequired:
  requestCount >= 3,
};
},
// =====================================
// VERIFY FORGOT PASSWORD OTP
// =====================================
verifyForgotPasswordOTP: async (
  _: any,
  {
    identifier,
    code
  }: any
) => {

  const clean =
    normalizeIdentifier(identifier);

 const result =
  await pool.query<UserRow>(
    `
    SELECT

      u.*,

      s.failed_forgot_attempts,
      s.forgot_locked_until

    FROM users u

    LEFT JOIN user_security s
    ON s.user_id = u.id

    WHERE LOWER(u.email) = LOWER($1)
       OR u."StudentId" = $2
    `,
      [
        buildEmail(clean),
        clean
      ]
    );

  const user =
    result.rows[0];

  assertUser(user);

  // =========================
  // CHECK LOCK
  // =========================
  const lockCheck =
    await pool.query(
      `
     SELECT
  NOW() < s.forgot_locked_until
  AS locked
FROM user_security s
WHERE s.user_id = $1
      `,
      [user.id]
    );

  if (lockCheck.rows[0]?.locked) {
    throw new Error(
      "Forgot password temporarily locked."
    );
  }

  // =========================
  // CHECK OTP EXISTS
  // =========================
  const resetResult =
  await pool.query(
    `
    SELECT
      otp_hash,
      otp_expires_at
    FROM password_resets
    WHERE user_id = $1
    `,
    [user.id]
  );

const reset =
  resetResult.rows[0];

if (
  !reset?.otp_hash ||
  !reset?.otp_expires_at
) {
    throw new Error(
      "No reset request found"
    );
  }

  // =========================
  // CHECK EXPIRATION
  // =========================
 const expiryCheck =
  await pool.query(
    `
    SELECT
      NOW() < otp_expires_at
      AS valid
    FROM password_resets
    WHERE user_id = $1
    `,
    [user.id]
  );

 if (!expiryCheck.rows[0]?.valid) {

  await pool.query(
    `
    DELETE FROM password_resets
    WHERE user_id = $1
    `,
    [user.id]
  );

  throw new Error(
    "OTP expired"
  );
}

  // =========================
  // HASH INPUT
  // =========================
  const hashedInput =
    crypto
      .createHmac(
        "sha256",
        process.env.JWT_SECRET!
      )
      .update(code)
      .digest("hex");

  // =========================
  // INVALID OTP VERIFY FORGOT PASSWORD
  // =========================
  if (
  reset.otp_hash !==
  hashedInput
) {

    const attempts =
      (user.failed_forgot_attempts || 0) + 1;

    let lockUntil =
      null;

    if (attempts >= 5) {
      lockUntil =
        new Date(
          Date.now() +
          1 * 60 * 1000
        );
    }

    await pool.query(
      `
 UPDATE user_security
SET
  failed_forgot_attempts = $1,
  forgot_locked_until = $2,
  updated_at = NOW()
WHERE user_id = $3
      `,
      [
        attempts,
        lockUntil,
        user.id
      ]
    );

    await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_security",
    "update",
    JSON.stringify({
      user_id: user.id,
      failed_forgot_attempts: attempts,
      forgot_locked_until: lockUntil,
      updated_at: new Date().toISOString()
    })
  ]
);

    throw new Error(
      "Invalid OTP"
    );
  }

  // =========================
  // RESET FAILED ATTEMPTS
  // =========================
  await pool.query(
  `
  UPDATE user_security
  SET
  failed_forgot_attempts = 0,
  forgot_locked_until = NULL,
  updated_at = NOW()
   WHERE user_id = $1
  `,
  [user.id]
  );

  await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_security",
    "update",
    JSON.stringify({
      user_id: user.id,
      failed_forgot_attempts: 0,
      forgot_locked_until: null,
      updated_at: new Date().toISOString()
    })
  ]
);

  return true;
},

resetForgotPassword: async (
  _: any,
  {
    identifier,
    code,
    newPassword
  }: any,
  context: Context
)=> {

  const clean =
    normalizeIdentifier(identifier);

  const result =
    await pool.query<UserRow>(
      `
      SELECT *
      FROM users
      WHERE LOWER(email) = LOWER($1)
         OR "StudentId" = $2
      `,
      [
        buildEmail(clean),
        clean
      ]
    );

  const user =
    result.rows[0];

  assertUser(user);

  // =========================
  // VERIFY OTP AGAIN
  // =========================
  const hashedInput =
    crypto
      .createHmac(
        "sha256",
        process.env.JWT_SECRET!
      )
      .update(code)
      .digest("hex");

      const resetResult =
  await pool.query(
    `
    SELECT
      otp_hash,
      otp_expires_at
    FROM password_resets
    WHERE user_id = $1
    `,
    [user.id]
  );

const reset =
  resetResult.rows[0];

  if (
  reset.otp_hash !==
  hashedInput
) {
    throw new Error(
      "Invalid reset session"
    );
  }

  // =========================
  // CHECK PASSWORD LENGTH
  // =========================
  if (
    newPassword.length < 8
  ) {
    throw new Error(
      "Password must be at least 8 characters"
    );
  }

  // =========================
  // PREVENT SAME PASSWORD
  // =========================
  const isSame =
    await bcrypt.compare(
      newPassword,
      user.password
    );

  if (isSame) {
    throw new Error(
      "New password must be different"
    );
  }

  // =========================
  // HASH PASSWORD
  // =========================
  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10
    );

  // =========================
  // UPDATE PASSWORD
  // =========================
  await pool.query(
  `
  UPDATE users
  SET password = $1
  WHERE id = $2
  `,
  [
    hashedPassword,
    user.id
  ]
);

// =========================
// SYNC USER PASSWORD UPDATE
// =========================
await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "users",
    "update",
    JSON.stringify({
      id: user.id,
      password: hashedPassword
    })
  ]
);

// =========================
// DELETE RESET SESSION
// =========================
  await pool.query(
    `
 DELETE FROM password_resets
WHERE user_id = $1
    `,
   [user.id]
  );

  await pool.query(
  `
  UPDATE user_security
  SET
  failed_forgot_attempts = 0,
  forgot_locked_until = NULL,
  updated_at = NOW()
   WHERE user_id = $1
  `,
  [user.id]
  );

// =========================
// SYNC DELETE RESET SESSION
// =========================
await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "password_resets",
    "delete",
    JSON.stringify({
      user_id: user.id
    })
  ]
);

// =========================
// SYNC RESET SECURITY
// =========================
await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_security",
    "update",
    JSON.stringify({
      user_id: user.id,
      failed_forgot_attempts: 0,
      forgot_locked_until: null,
      updated_at: new Date().toISOString()
    })
  ]
);

await logAuditEvent({

  userId:
    user.id,

  action:
    "PASSWORD_RESET_COMPLETED",

  targetTable:
    "users",

  targetId:
    String(user.id),

  metadata: {
    identifier: clean
  },

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});

  return true;
},
    requestSignupOTP: async (
  _: any,
{
  first_name,
  middle_name,
  last_name,
  email,
  password,
  StudentId,
  course,
  school_id_image,

  policyAccepted,
  policyVersion
}: any
) => {

  if (!/^\d{3}-\d{5}$/.test(StudentId)) {
    throw new Error(
      "Invalid Student ID format"
    );
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  const normalizedStudentId =
    normalizeStudentId(StudentId);

    // =========================
// POLICY ENFORCEMENT
// =========================
if (!policyAccepted) {

  throw new GraphQLError(
    "Policy acknowledgement required.",
    {
      extensions: {
        code:
          "POLICY_NOT_ACCEPTED",
      },
    }
  );
}

if (
  policyVersion !==
  CURRENT_POLICY_VERSION
) {

  throw new GraphQLError(
    "Outdated policy version.",
    {
      extensions: {
        code:
          "INVALID_POLICY_VERSION",
      },
    }
  );
}

  // =========================
  // VALIDATE DOMAIN
  // =========================
  if (
    !normalizedEmail.endsWith(
      "@carsu.edu.ph"
    )
  ) {
    throw new GraphQLError(
      "Only CARSU email is allowed.",
      {
        extensions: {
          code:
            "INVALID_EMAIL_DOMAIN",
        },
      }
    );
  }

  // =========================
  // CHECK REAL USERS
  // =========================
  const existingUser =
    await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER($1)
         OR "StudentId" = $2
      `,
      [
        normalizedEmail,
        normalizedStudentId
      ]
    );

  if (existingUser.rows.length > 0) {
    throw new Error(
      "Account already exists"
    );
  }

  // =========================
  // REMOVE OLD PENDING
  // =========================
  await pool.query(
    `
    DELETE FROM signup_pending
    WHERE LOWER(email) = LOWER($1)
       OR "StudentId" = $2
    `,
    [
      normalizedEmail,
      normalizedStudentId
    ]
  );

  // =========================
  // HASH PASSWORD
  // =========================
  const hashedPassword =
    await bcrypt.hash(password, 10);

  // =========================
  // GENERATE OTP
  // =========================
  const code =
    Math.floor(
      100000 +
      Math.random() * 900000
    ).toString();

  const hashedOTP = crypto
    .createHmac(
      "sha256",
      process.env.JWT_SECRET!
    )
    .update(code)
    .digest("hex");

 // =========================
// SAVE TEMP SIGNUP
// =========================
const pendingResult =
  await pool.query(
    `
    INSERT INTO signup_pending (
      first_name,
      middle_name,
      last_name,
      email,
      password,
      "StudentId",
      course,
      school_id_image,
      signup_otp,
      signup_otp_expires_at,
      policy_accepted,
policy_version,
policy_accepted_at
    )

    VALUES (
  $1,$2,$3,$4,$5,
  $6,$7,$8,$9,
  NOW() + INTERVAL '5 minutes',

  $10,
  $11,
  NOW()
)

    RETURNING *
    `
    ,
    [
      first_name,
      middle_name,
      last_name,
      normalizedEmail,
      hashedPassword,
      normalizedStudentId,
      course,
      school_id_image,
      hashedOTP,

      policyAccepted,
      policyVersion
    ]
  );

const pending =
  pendingResult.rows[0];

// =========================
// SYNC PENDING SIGNUP
// =========================
await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "signup_pending",
    "insert",
    JSON.stringify(pending)
  ]
);

  // =========================
  // SEND EMAIL OTP
  // =========================
  await sendOTP(
    normalizedEmail,
    code
  );

  return true;
},

   login: async (
  _: any,
  { identifier, password }: any,
  context: Context
) => {

    console.log("RAW IDENTIFIER:", identifier);

    const cleanIdentifier = normalizeIdentifier(identifier);

    console.log("CLEAN IDENTIFIER:", cleanIdentifier);

   console.log("IS STUDENT ID:", isStudentId(cleanIdentifier));

   let query = '';
   let value = '';

   if (isStudentId(cleanIdentifier)) {

   query = `
  SELECT
    u.id,
    password,
    "StudentId",
    role,
    course,
    email,
    first_name,
    middle_name,
    last_name,
    school_id_image,
    profile_picture,
    account_status,

    u.policy_version,
    u.policy_accepted,
    u.policy_accepted_at,

    s.failed_login_attempts,
    s.login_locked_until,

    s.failed_otp_attempts,
    s.otp_locked_until,

    t.enabled AS two_factor_enabled,

t.secret AS two_factor_secret,

t.temp_secret AS two_factor_temp_secret,

t.confirmed AS two_factor_confirmed,

t.backup_codes AS two_factor_backup_codes

FROM users u

LEFT JOIN user_security s
ON s.user_id = u.id

LEFT JOIN user_2fa t
ON t.user_id = u.id

WHERE TRIM(u."StudentId") = TRIM($1)
`;

    value = cleanIdentifier;

    } else {

    query = `
  SELECT

    u.id,

    password,

    "StudentId",

    role,

    course,

    email,

    first_name,
    middle_name,
    last_name,

    school_id_image,

    profile_picture,

    account_status,

    u.policy_version,
    u.policy_accepted,
    u.policy_accepted_at,

    s.failed_login_attempts,
    s.login_locked_until,

    s.failed_otp_attempts,
    s.otp_locked_until,

t.enabled AS two_factor_enabled,

t.secret AS two_factor_secret,

t.temp_secret AS two_factor_temp_secret,

t.confirmed AS two_factor_confirmed,

t.backup_codes AS two_factor_backup_codes

FROM users u

LEFT JOIN user_security s
ON s.user_id = u.id

LEFT JOIN user_2fa t
ON t.user_id = u.id

WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
`;

    value = buildEmail(cleanIdentifier);
    }

    console.log("LOGIN VALUE:", value);

const res =
  await pool.query<UserRow>(
    query,
    [value]
  );

console.log(
  "LOGIN RESULT:",
  res.rows
);

// =========================
// CHECK PENDING ACCOUNT
// =========================
const pendingRes =
  await pool.query(
    `
    SELECT *
    FROM signup_pending
    WHERE LOWER(email) = LOWER($1)
       OR "StudentId" = $2
    `,
    [
      buildEmail(cleanIdentifier),
      cleanIdentifier
    ]
  );

const pendingUser =
  pendingRes.rows[0];

// =========================
// PENDING / REJECTED
// =========================
if (
  pendingUser?.email_verified
) {

  if (
    pendingUser.account_status ===
    "PENDING"
  ) {

    throw new GraphQLError(
      "Your account is pending by Admin approval.",
      {
        extensions: {
          code:
            "ACCOUNT_PENDING",

          studentId:
            pendingUser.StudentId,

          email:
            pendingUser.email,
        },
      }
    );
  }

  if (
    pendingUser.account_status ===
    "REJECTED"
  ) {

    throw new GraphQLError(
  "Your account has been rejected by Admin.",
  {
    extensions: {
      code:
        "ACCOUNT_REJECTED",

      studentId:
        pendingUser.StudentId,

      email:
        pendingUser.email,

      reason:
        pendingUser.rejected_reason,

      rejectedAt:
        pendingUser.rejected_at,
    },
  }
);
  }
}

// =========================
// REAL USER
// =========================
const user =
  res.rows[0];

assertUser(user);
   if (user.account_status === "PENDING") {

  throw new GraphQLError(
    "Your account is pending by Admin approval.",
    {
      extensions: {
        code: "ACCOUNT_PENDING",

        studentId:
          user.StudentId,

        email:
          user.email,
      },
    }
  );
}

if (user.account_status === "REJECTED") {

  throw new GraphQLError(
    "Your account has been rejected by Admin.",
    {
      extensions: {
        code: "ACCOUNT_REJECTED",

        studentId:
          user.StudentId,

        email:
          user.email,
      },
    }
  );
}
    // 🚫 Check if account is locked using database time
const lockCheck = await pool.query(
  `
  SELECT
  NOW() < s.login_locked_until
  AS locked
FROM user_security s
WHERE s.user_id = $1
  `,
  [user.id]
);
// 1ST. CHECK LOCK LOGIN
if (lockCheck.rows[0]?.locked) {
  throw new Error(
    "Too many login attempts. Try again later."
  );
}

      const isValid = await bcrypt.compare(
        password,
        user.password
      );

      if (!isValid) {

  const attempts =
    (user.failed_login_attempts || 0) + 1;

    // =========================
// BRUTE FORCE DETECTION
// =========================
if (attempts >= 5) {

  await logAuditEvent({

    action: "BRUTE_FORCE_DETECTED",

    metadata: {
      identifier,
      attempts,
      reason: "MULTIPLE_FAILED_LOGINS"
    },

    ipAddress: context.ip,

    userAgent: context.userAgent,

    severity: "CRITICAL",
  });
}

      // TIME TEMPORARY '30 SECONDS'
await pool.query(
  `
  UPDATE user_security
  SET
    failed_login_attempts = $1,

    login_locked_until = CASE
      WHEN $1 >= 5
      THEN NOW() + INTERVAL '30 seconds'
      ELSE NULL
    END,

    updated_at = NOW()

  WHERE user_id = $2
  `,
  [
    attempts,
    user.id
  ]
);

await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_security",
    "update",
   JSON.stringify({
  user_id: user.id,
  failed_login_attempts: attempts,

  login_locked_until:
    attempts >= 5
      ? new Date(
          Date.now() +
          30 * 1000
        ).toISOString()
      : null,

  updated_at:
    new Date().toISOString()
})
  ]
);

await logAuditEvent({

  action: "FAILED_LOGIN",

  metadata: {
    identifier,
    reason: "INVALID_PASSWORD"
  },

  ipAddress: context.ip,

  userAgent: context.userAgent,
});

  throw new Error("Invalid credentials");
}


await pool.query(
  `
  UPDATE user_security
  SET
    failed_login_attempts = 0,
    login_locked_until = NULL,
    updated_at = NOW()
  WHERE user_id = $1
  `,
  [user.id]
);

await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_security",
    "update",
    JSON.stringify({
      user_id: user.id,
      failed_login_attempts: 0,
      login_locked_until: null,
      updated_at: new Date().toISOString()
    })
  ]
);
// 👇 DITO ILALAGAY ANG 2FA LOGIC
if (
  user.two_factor_enabled &&
  user.two_factor_secret
) {

  return {
    token: null,

    requires2FA: true,

    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      StudentId: user.StudentId,
      role: user.role,
      profile_picture:
        user.profile_picture,

      vibration_enabled:
        user.vibration_enabled,

      dark_mode:
        user.dark_mode,

      two_factor_enabled: true
    }
  };
}// =========================
// POLICY VERSION CHECK
// =========================
if (
  user.policy_version !==
  CURRENT_POLICY_VERSION
) {

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    SECRET,
    {
      expiresIn: '1d',
    }
  );

  await logAuditEvent({

  userId: user.id,

  action:
    "SUCCESSFUL_LOGIN",

  targetTable:
    "users",

  targetId:
    String(user.id),

  metadata: {
    email: user.email,
    requiresPolicyUpdate: true
  },

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});

  return {
    token,
    requires2FA: false,
    requiresPolicyUpdate: true,
    user
  };
}

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        SECRET,
        {
          expiresIn: '1d',
        }
      );

      await logAuditEvent({

  userId: user.id,

  action:
    "SUCCESSFUL_LOGIN",

  targetTable:
    "users",

  targetId:
    String(user.id),

  metadata: {
    email: user.email,
    requiresPolicyUpdate: false
  },

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});

     return {
  token,
  requires2FA: false,
  requiresPolicyUpdate: false,
  user: {
    id: user.id,
    first_name: user.first_name,
    middle_name: user.middle_name,
    last_name: user.last_name,
    email: user.email,
    StudentId: user.StudentId,
    course: user.course,
    school_id_image: user.school_id_image,
    role: user.role,
    profile_picture: user.profile_picture,
    vibration_enabled: user.vibration_enabled,
    dark_mode: user.dark_mode
  }
};
    },

    resendSignupOTP: async (
  _: any,
  { email }: any
) => {

  const normalizedEmail =
    email.trim().toLowerCase();

      console.log(
  "RESEND EMAIL:",
  normalizedEmail
);

  const result =
    await pool.query<SignupPendingRow>(
      `
      SELECT *
      FROM signup_pending
      WHERE LOWER(email) = LOWER($1)
      `,
      [normalizedEmail]
    );

  const pending =
    result.rows[0];

      console.log(
  "PENDING SIGNUP:",
  pending
);

  if (!pending) {
    throw new Error(
      "No pending signup found"
    );
  }

  // =========================
  // GENERATE NEW OTP
  // =========================
  const code =
    Math.floor(
      100000 +
      Math.random() * 900000
    ).toString();

  const hashedOTP = crypto
    .createHmac(
      "sha256",
      process.env.JWT_SECRET!
    )
    .update(code)
    .digest("hex");

  // =========================
  // UPDATE OTP + RESET TIMER
  // =========================
  await pool.query(
    `
    UPDATE signup_pending
    SET
      signup_otp = $1,
      signup_otp_expires_at =
        NOW() + INTERVAL '5 minutes'
    WHERE id = $2
    `,
    [
      hashedOTP,
      pending.id
    ]
  );

  // =========================
  // SEND NEW OTP
  // =========================
  await sendOTP(
    normalizedEmail,
    code
  );

  return true;
},

    verifySignupOTP: async (
  _: any,
  {
    email,
    code
  }: any
) => {

  const normalizedEmail =
    email.trim().toLowerCase();

  // =========================
  // GET PENDING SIGNUP
  // =========================
  const result =
    await pool.query<SignupPendingRow>(
      `
      SELECT *
      FROM signup_pending
      WHERE LOWER(email) = LOWER($1)
      `,
      [normalizedEmail]
    );

  const pending =
    result.rows[0];

      console.log(
  "PENDING SIGNUP:",
  pending
);

  if (!pending) {
    throw new Error(
      "No pending signup found"
    );
  }

  // =========================
  // CHECK LOCK
  // =========================
  const lockCheck =
    await pool.query(
      `
      SELECT
        NOW() < signup_locked_until
        as locked
      FROM signup_pending
      WHERE id = $1
      `,
      [pending.id]
    );

  if (lockCheck.rows[0]?.locked) {

    const unlockTime =
      await pool.query(
        `
        SELECT
        EXTRACT(
          EPOCH FROM (
            signup_locked_until - NOW()
          )
        )::int as remaining_seconds

        FROM signup_pending
        WHERE id = $1
        `,
        [pending.id]
      );

    const remainingSeconds =
      unlockTime.rows?.[0]
        ?.remaining_seconds || 0;

    throw Object.assign(
      new Error("SIGNUP_OTP_LOCKED"),
      {
        extensions: {
          code:
            "SIGNUP_OTP_LOCKED",
          remainingSeconds,
        },
      }
    );
  }

  // =========================
  // CHECK OTP EXISTS
  // =========================
  if (
    !pending.signup_otp ||
    !pending.signup_otp_expires_at
  ) {
    throw new Error(
      "No signup OTP found"
    );
  }

  // =========================
  // CHECK EXPIRATION
  // =========================
  const expiryCheck =
    await pool.query(
      `
      SELECT
        NOW() <
        signup_otp_expires_at
        as valid

      FROM signup_pending
      WHERE id = $1
      `,
      [pending.id]
    );

  if (!expiryCheck.rows[0]?.valid) {
    throw new Error(
      "Signup OTP expired"
    );
  }

  // =========================
  // HASH INPUT OTP
  // =========================
  const hashedInput = crypto
    .createHmac(
      "sha256",
      process.env.JWT_SECRET!
    )
    .update(code)
    .digest("hex");

  // =========================
  // INVALID OTP VERIFY SIGNUP OTP
  // =========================
  if (
    pending.signup_otp !==
    hashedInput
  ) {

    const attempts =
      (pending.failed_signup_attempts || 0) + 1;

    let lockUntil: Date | null =
      null;

    if (attempts >= 5) {
      lockUntil =
        new Date(
          Date.now() +
          15 * 60 * 1000
        );
    }

    await pool.query(
      `
      UPDATE signup_pending
      SET
        failed_signup_attempts = $1,
        signup_locked_until = $2
      WHERE id = $3
      `,
      [
        attempts,
        lockUntil,
        pending.id
      ]
    );

    throw Object.assign(
      new Error("INVALID_SIGNUP_OTP"),
      {
        extensions: {
          code:
            "INVALID_SIGNUP_OTP",

          attemptsLeft:
            Math.max(
              0,
              5 - attempts
            ),
        },
      }
    );
  }

 // =========================
// RESET OTP FAILURES
// =========================
await pool.query(
  `
  UPDATE signup_pending
  SET
    failed_signup_attempts = 0,
    signup_locked_until = NULL,
    email_verified = true,
    account_status = 'PENDING'
  WHERE id = $1
  `,
  [pending.id]
);

// =========================
// MOVE TEMP FILE
// =========================
let finalImagePath =
  pending.school_id_image;

try {

  const imageName =
    path.basename(
      pending.school_id_image
    );

  const oldPath =
    path.join(
      TEMP_SCHOOL_IDS_DIR,
      imageName
    );

  const cleanedName =
    imageName.replace(
      "-temporary-school-id",
      "-school-id"
    );

  const newPath =
    path.join(
      SCHOOL_IDS_DIR,
      cleanedName
    );

  if (fs.existsSync(oldPath)) {

    fs.renameSync(
      oldPath,
      newPath
    );

    const BASE_URL =
      process.env.PUBLIC_URL;

    finalImagePath =
`${BASE_URL}/uploads/school-ids/${cleanedName}`;

    await pool.query(
      `
      UPDATE signup_pending
      SET school_id_image = $1
      WHERE id = $2
      `,
      [
        finalImagePath,
        pending.id
      ]
    );
  }

} catch (err) {

  console.error(
    "FAILED TO MOVE SCHOOL ID:",
    err
  );

  throw new Error(
    "Failed to finalize school ID"
  );
}

// =========================
// SYNC PENDING USER
// =========================
await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "signup_pending",
    "update",
    JSON.stringify({
      id: pending.id,
      email_verified: true,
      account_status: "PENDING",
      school_id_image: finalImagePath
    })
  ]
);

return true;
},
    
    verifyTwoFactor: async (_: any, { identifier, code }: any) => {
  const clean = normalizeIdentifier(identifier);

  const value = isStudentId(clean)
    ? clean
    : buildEmail(clean);

  const res = await pool.query<UserRow>(
  `
  SELECT
  u.*,

  s.failed_otp_attempts,
  s.otp_locked_until,

  t.secret
    AS two_factor_secret,

  t.enabled
    AS two_factor_enabled

FROM users u

LEFT JOIN user_security s
ON s.user_id = u.id

LEFT JOIN user_2fa t
ON t.user_id = u.id

WHERE LOWER(u.email) = LOWER($1)
   OR u."StudentId" = $2
  `,
  [buildEmail(clean), clean]
);
  // 3rd. constant user (Mutation verifyTwoFactor)
  const user = res.rows[0];   // ✅ MOVE THIS UP
  // 2nd assertUser
  assertUser(user);

  // 🚫 NOW SAFE to use user.id
  const lockCheck = await pool.query(
    `
   SELECT
  NOW() < s.otp_locked_until
  AS locked
FROM user_security s
WHERE s.user_id = $1
    `,
    [user.id]
  );
  // 2nd CHECK LOCK (OTP)
if (lockCheck.rows[0]?.locked) {
  const unlockTime = await pool.query(
    `
   SELECT
  EXTRACT(
    EPOCH FROM (
      s.otp_locked_until - NOW()
    )
  )::int AS remaining_seconds
FROM user_security s
WHERE s.user_id = $1
    `,
    [user.id]
  );

  const seconds = Math.max(0, unlockTime.rows[0]?.remaining_seconds || 0);

  const remainingSeconds =
  unlockTime.rows?.[0]?.remaining_seconds ?? 0;

throw Object.assign(new Error("OTP_LOCKED"), {
  extensions: {
    code: "OTP_LOCKED",
    remainingSeconds,
    attemptsLeft: Math.max(
  0,
  5 - (user.failed_otp_attempts || 0)
),
  },
});
}
  // 3rd.Mutation verifyTwoFactor

 // check OTP existence
if (
  !user.two_factor_secret
) {
  throw new Error(
    "2FA not configured"
  );
}

const verified =
  speakeasy.totp.verify({
    secret:
      user.two_factor_secret,

    encoding: "base32",

    token: code,

    window: 1,
  });

if (!verified) {

  const attempts =
    (user.failed_otp_attempts || 0) + 1;

  let lockUntil: Date | null =
    null;

  if (attempts >= 5) {

    lockUntil =
      new Date(
        Date.now() +
        8 * 60 * 60 * 1000
      );
  }

  await pool.query(
    `
    UPDATE user_security
SET
  failed_otp_attempts = $1,
  otp_locked_until = $2,
  updated_at = NOW()
WHERE user_id = $3
    `,
    [
      attempts,
      lockUntil,
      user.id
    ]
  );

  await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_security",
    "update",
    JSON.stringify({
      user_id: user.id,
      failed_otp_attempts: attempts,
      otp_locked_until: lockUntil,
      updated_at: new Date().toISOString()
    })
  ]
);

  throw Object.assign(
    new Error(
      "Invalid authenticator code"
    ),
    {
      extensions: {
        code:
          "INVALID_AUTHENTICATOR_CODE",

        attemptsLeft:
          Math.max(
            0,
            5 - attempts
          ),
      },
    }
  );
}

// RESET FAILED ATTEMPTS
await pool.query(
  `
  UPDATE user_security
SET
  failed_otp_attempts = 0,
  otp_locked_until = NULL,
  updated_at = NOW()
WHERE user_id = $1
  `,
  [user.id]
);

await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_security",
    "update",
    JSON.stringify({
      user_id: user.id,
      failed_otp_attempts: 0,
      otp_locked_until: null,
      updated_at: new Date().toISOString()
    })
  ]
);

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user
  };
},

updateProfilePicture: async (
  _: any,
  { profile_picture }: { profile_picture: string },
  context: Context
) => {

  const auth = requireAuth(context);

  const updated = await pool.query<UserRow>(
    `
    UPDATE users
    SET profile_picture = $1
    WHERE id = $2
    RETURNING
      id,
      first_name,
      middle_name,
      last_name,
      email,
      "StudentId",
      course,
      school_id_image,
      profile_picture,
      role,
      vibration_enabled,
      dark_mode
    `,
    [profile_picture, auth.userId]
  );

  await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "users",
    "update",
    JSON.stringify({
      id: auth.userId,
      profile_picture
    })
  ]
);

  return updated.rows[0];
},

updateUserInformation: async (
  _: any,
  {
    phone_number,
    suffix,
    birthdate,
    age,
    gender,
    nationality,
    user_classification,
    student_type,
    college_department,
    program,
    year_level,
    vibration_enabled,
    dark_mode,
    two_factor_enabled
  }: {
    phone_number: string;
    suffix?: string;
    birthdate?: string | null;
    age?: number;
    gender?: string;
    nationality?: string;
    user_classification?: string;
    student_type?: string;
    college_department?: string;
    program?: string;
    year_level?: string;
    vibration_enabled?: boolean;
    dark_mode?: boolean;
    two_factor_enabled?: boolean;
  },
  context: Context
) => {

  const auth = requireAuth(context);

  // get current user
  const existingUser = await pool.query<UserRow>(
    `
    SELECT *
    FROM users
    WHERE id = $1
    `,
    [auth.userId]
  );

  const user = existingUser.rows[0];
  // 4th assertUser
  assertUser(user);

// =========================
// LOCKED FIELDS
// =========================
  let finalSuffix = user.suffix;
  let finalLocked = user.suffix_locked;

  if (!user.suffix_locked && suffix) {
    finalSuffix = suffix;
    finalLocked = true;
  }

let finalBirthdate = user.birthdate;
let finalBirthdateLocked =
  user.birthdate_locked;

if (!user.birthdate_locked) {
  if (birthdate && birthdate.trim() !== '') {
    finalBirthdate = birthdate ? String(birthdate).slice(0, 10) : null;
    finalBirthdateLocked = true;
  }
}

let finalGender = user.gender;
let finalGenderLocked =
  user.gender_locked;

if (
  !user.gender_locked &&
  gender
) {
  finalGender = gender;
  finalGenderLocked = true;
}

let finalNationality =
  user.nationality;

let finalNationalityLocked =
  user.nationality_locked;

if (
  !user.nationality_locked &&
  nationality
) {
  finalNationality = nationality;
  finalNationalityLocked = true;
}

 await pool.query(
  `
  UPDATE user_profile
  SET
    phone_number = $1,

    suffix = $2,
    suffix_locked = $3,

    birthdate = $4,
    birthdate_locked = $5,

    age = $6,

    gender = $7,
    gender_locked = $8,

    nationality = $9,
    nationality_locked = $10,

    user_classification = $11,

    student_type = $12,

    college_department = $13,

    program = $14,

    year_level = $15,

    updated_at = NOW()

  WHERE user_id = $16
  `,
  [
    phone_number,

    finalSuffix,
    finalLocked,

    finalBirthdate,
    finalBirthdateLocked,

    age,

    finalGender,
    finalGenderLocked,

    finalNationality,
    finalNationalityLocked,

    user_classification,

    student_type,

    college_department,

    program,

    year_level,

    auth.userId
  ]
);

await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_profile",
    "update",
    JSON.stringify({
      user_id: auth.userId,
      phone_number,

      suffix: finalSuffix,
      suffix_locked: finalLocked,

      birthdate: finalBirthdate,
      birthdate_locked:
        finalBirthdateLocked,

      age,

      gender: finalGender,
      gender_locked:
        finalGenderLocked,

      nationality:
        finalNationality,

      nationality_locked:
        finalNationalityLocked,

      user_classification,

      student_type,

      college_department,

      program,

      year_level,

      updated_at:
        new Date().toISOString()
    })
  ]
);

await pool.query(
  `
  UPDATE user_preferences
  SET
    vibration_enabled = $1,

    dark_mode = $2,

    updated_at = NOW()

  WHERE user_id = $3
  `,
  [
    vibration_enabled
      ?? user.vibration_enabled,

    dark_mode
      ?? user.dark_mode,

    auth.userId
  ]
);

await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_preferences",
    "update",
    JSON.stringify({
      user_id: auth.userId,

      vibration_enabled:
        vibration_enabled ??
        user.vibration_enabled,

      dark_mode:
        dark_mode ??
        user.dark_mode,

      updated_at:
        new Date().toISOString()
    })
  ]
);

const refreshed =
  await pool.query<UserRow>(
    `
    SELECT

      u.id,

      u.first_name,
      u.middle_name,
      u.last_name,

      u.email,

      u."StudentId",

      u.course,

      u.school_id_image,

      u.role,

      p.phone_number,

      p.suffix,
      p.suffix_locked,

      p.birthdate,
      p.birthdate_locked,

      p.age,

      p.gender,
      p.gender_locked,

      p.nationality,
      p.nationality_locked,

      p.user_classification,

      p.student_type,

      p.college_department,

      p.program,

      p.year_level,

      u.profile_picture,

      pref.vibration_enabled,

      pref.dark_mode,

      t.enabled
        AS two_factor_enabled,

      u.account_status

    FROM users u

    LEFT JOIN user_profile p
    ON p.user_id = u.id

    LEFT JOIN user_preferences pref
    ON pref.user_id = u.id

    LEFT JOIN user_2fa t
    ON t.user_id = u.id

    WHERE u.id = $1
    `,
    [auth.userId]
  );

return refreshed.rows[0];
},

    renameDevice: async (
      _: any,
      { mac, name }: any,
      context: Context
    ) => {

      requireAuth(context);

      const normalizedMac = normalizeMac(mac);

      await pool.query(
        `
        INSERT INTO devices (
          device_id,
          custom_name
        )
        VALUES ($1, $2)

        ON CONFLICT (device_id)

        DO UPDATE SET
        custom_name = EXCLUDED.custom_name
        `,
        [normalizedMac, name]
      );

      return {
        success: true
      };
    },

    blockDevice: async (
      _: any,
      { mac }: { mac: string },
      context: Context
    ) => {

      requireAdmin(context);

      const normalizedMac = normalizeMac(mac);

      if (!isValidMac(normalizedMac)) {
        throw new Error('Invalid MAC address');
      }

      await pool.query(
        `
        INSERT INTO commands (
          type,
          mac,
          created_at
        )
        VALUES ($1, $2, NOW())

        ON CONFLICT (mac, type)
        DO NOTHING
        `,
        ['block', normalizedMac]
      );

      return true;
    },

    unblockDevice: async (
      _: any,
      { mac }: { mac: string },
      context: Context
    ) => {

      requireAdmin(context);

      const normalizedMac = normalizeMac(mac);

      if (!isValidMac(normalizedMac)) {
        throw new Error('Invalid MAC address');
      }

      await pool.query(
        `
        INSERT INTO commands (
          type,
          mac,
          created_at
        )
        VALUES ($1, $2, NOW())

        ON CONFLICT (mac, type)
        DO NOTHING
        `,
        ['unblock', normalizedMac]
      );

      return true;
    },

    setupTwoFactor: async (
  _: any,
  __: any,
  context: Context
) => {

  const auth =
    requireAuth(context);

  const result =
    await pool.query<UserRow>(
      `
      SELECT *
      FROM users
      WHERE id = $1
      `,
      [auth.userId]
    );

  const user =
    result.rows[0];

  assertUser(user);

 // =========================
 // CHECK EXISTING 2FA
 // =========================
 const existing2FA =
  await pool.query(
    `
    SELECT
      secret,
      enabled,
      confirmed
    FROM user_2fa
    WHERE user_id = $1
    `,
    [user.id]
  );

 const existing =
  existing2FA.rows[0];

 // =========================
 // ALREADY HAS SECRET
 // =========================
if (
  existing?.enabled &&
  existing?.confirmed &&
  existing?.secret
) {

  return {
    alreadySetup: true,
    qrCode: "",
    secret: "",
  };
}

 // =========================
 // GENERATE NEW SECRET
 // =========================
 const secret =
  speakeasy.generateSecret({
    name:
      `ICT Library Office (${user.email})`,
  });

  // =========================
  // SAVE TEMP SECRET
  // =========================

  await pool.query(
  `
  INSERT INTO user_2fa (
    user_id,
    temp_secret,
    updated_at
  )
  VALUES ($1, $2, NOW())

  ON CONFLICT (user_id)
  DO UPDATE SET
    temp_secret = EXCLUDED.temp_secret,
    updated_at = NOW()
  `,
  [
    user.id,
    secret.base32
  ]
 );

  // =========================
  // GENERATE QR
  // =========================
  const qrCode =
    await QRCode.toDataURL(
      secret.otpauth_url || ""
    );

  return {
    secret:
      secret.base32,

    qrCode,
  };
 },

 confirmTwoFactor: async (
  _: any,
  { code }: any,
  context: Context
 ) => {

  const auth =
    requireAuth(context);

  const result =
    await pool.query<UserRow>(
      `
      SELECT

  u.*,

  t.temp_secret
    AS two_factor_temp_secret

FROM users u

LEFT JOIN user_2fa t
ON t.user_id = u.id

WHERE u.id = $1
      `,
      [auth.userId]
    );

  const user =
    result.rows[0];

  assertUser(user);

  if (
    !user.two_factor_temp_secret
  ) {
    throw new Error(
      "No pending 2FA setup found"
    );
  }

  // =========================
  // VERIFY TOTP
  // =========================
  const verified =
    speakeasy.totp.verify({
      secret:
        user.two_factor_temp_secret,

      encoding: "base32",

      token: code,

      window: 1,
    });

  if (!verified) {
    throw new Error(
      "Invalid authenticator code"
    );
  }

  // =========================
  // GENERATE BACKUP CODES
  // =========================
  const backupCodes =
    Array.from(
      { length: 5 },
      () =>
        crypto
          .randomBytes(4)
          .toString("hex")
    );

  // =========================
  // ACTIVATE REAL 2FA
  // =========================
  await pool.query(
  `
  UPDATE user_2fa
SET
  enabled = true,
  confirmed = true,
  secret = $1,
  temp_secret = NULL,
  backup_codes = $2,
  updated_at = NOW()
WHERE user_id = $3
  `,
 [
  user.two_factor_temp_secret,
  backupCodes,
  user.id
]
);

await logAuditEvent({

  userId:
    auth.userId,

  action:
    "TWO_FACTOR_ENABLED",

  targetTable:
    "user_2fa",

  targetId:
    String(auth.userId),

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});

  return true;
},

disableTwoFactor: async (
  _: any,
  { password }: any,
  context: Context
) => {

  const auth =
    requireAuth(context);

  const result =
    await pool.query<UserRow>(
      `
      SELECT *
      FROM users
      WHERE id = $1
      `,
      [auth.userId]
    );

  const user =
    result.rows[0];

  assertUser(user);

  const validPassword =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!validPassword) {
    throw new Error(
      "Invalid password"
    );
  }

  await pool.query(
  `
  UPDATE user_2fa
  SET
    enabled = false,
    confirmed = false,
    secret = NULL,
    temp_secret = NULL,
    backup_codes = NULL,
    updated_at = NOW()
  WHERE user_id = $1
  `,
  [user.id]
);

await logAuditEvent({

  userId:
    auth.userId,

  action:
    "TWO_FACTOR_DISABLED",

  targetTable:
    "user_2fa",

  targetId:
    String(auth.userId),

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});

  return true;
},

 approveUser: async (
  _: any,
  { userId }: { userId: number },
  context: Context
) => {

  requireAdmin(context);

  // =========================
  // GET PENDING USER
  // =========================
  const pendingResult =
    await pool.query(
      `
      SELECT *
      FROM signup_pending
      WHERE id = $1
      `,
      [userId]
    );

  const pending =
    pendingResult.rows[0];

  if (!pending) {
    throw new Error(
      "Pending user not found"
    );
  }

  // =========================
  // INSERT INTO REAL USERS
  // =========================
  const userInsertResult =
    await pool.query(
      `
      INSERT INTO users (
        first_name,
        middle_name,
        last_name,
        email,
        password,
        "StudentId",
        course,
        school_id_image,
        role,
        account_status,
        policy_accepted,
policy_version,
policy_accepted_at
      )

      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,$11,$12,$13
      )

      RETURNING *
      `,
      [
  pending.first_name,
  pending.middle_name,
  pending.last_name,
  pending.email,
  pending.password,
  pending.StudentId,
  pending.course,
  pending.school_id_image,

  "Student",
  "APPROVED",

  pending.policy_accepted,
  pending.policy_version,
  pending.policy_accepted_at
]
    );

  const createdUser =
    userInsertResult.rows[0];

    // =========================
// CREATE USER PROFILE
// =========================
await pool.query(
  `
  INSERT INTO user_profile (
    user_id
  )
  VALUES ($1)
  `,
  [createdUser.id]
);

await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_profile",
    "insert",
    JSON.stringify({
      user_id: createdUser.id
    })
  ]
);

// =========================
// CREATE USER PREFERENCES
// =========================
await pool.query(
  `
  INSERT INTO user_preferences (
    user_id,
    vibration_enabled,
    dark_mode
  )
  VALUES ($1, $2, $3)
  `,
  [
    createdUser.id,
    true,
    false
  ]
);

await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_preferences",
    "insert",
    JSON.stringify({
      user_id: createdUser.id,
      vibration_enabled: true,
      dark_mode: false
    })
  ]
);

// =========================
// CREATE USER SECURITY
// =========================
await pool.query(
  `
  INSERT INTO user_security (
    user_id
  )
  VALUES ($1)
  `,
  [createdUser.id]
);

await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_security",
    "insert",
    JSON.stringify({
  user_id: createdUser.id,

  failed_login_attempts: 0,
  login_locked_until: null,

  failed_otp_attempts: 0,
  otp_locked_until: null,

  failed_forgot_attempts: 0,
  forgot_locked_until: null,

  forgot_request_count: 0,
  forgot_request_last_sent_at: null,
  forgot_request_locked_until: null,
  forgot_request_last_ip: null,

  failed_change_password_attempts: 0,
  change_password_locked_until: null
})
  ]
);

// =========================
// CREATE USER 2FA
// =========================
await pool.query(
  `
  INSERT INTO user_2fa (
    user_id,
    enabled,
    confirmed
  )
  VALUES ($1, false, false)
  `,
  [createdUser.id]
);

await pool.query(
  `
  INSERT INTO sync_queue (
    table_name,
    operation,
    payload
  )
  VALUES ($1,$2,$3)
  `,
  [
    "user_2fa",
    "insert",
    JSON.stringify({
      user_id: createdUser.id,
      enabled: false,
      confirmed: false
    })
  ]
);

  // =========================
  // SYNC REAL USER
  // =========================
  await pool.query(
    `
    INSERT INTO sync_queue (
      table_name,
      operation,
      payload
    )
    VALUES ($1,$2,$3)
    `,
    [
      "users",
      "insert",
      JSON.stringify(createdUser)
    ]
  );

  // =========================
  // DELETE PENDING
  // =========================
  await pool.query(
    `
    DELETE FROM signup_pending
    WHERE id = $1
    `,
    [userId]
  );

  // =========================
  // SYNC DELETE
  // =========================
  await pool.query(
    `
    INSERT INTO sync_queue (
      table_name,
      operation,
      payload
    )
    VALUES ($1,$2,$3)
    `,
    [
      "signup_pending",
      "delete",
      JSON.stringify({
        id: userId
      })
    ]
  );

  await logAuditEvent({

  userId:
    context.authUser?.userId,

  action:
    "ADMIN_APPROVED_USER",

  targetTable:
    "users",

  targetId:
    String(createdUser.id),

  metadata: {
    approvedUserId:
      createdUser.id
  },

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});

  return true;
},
// ================================
// REJECTED USER
// ================================
rejectUser: async (
  _: any,
  {
    userId,
    reason
  }: {
    userId: number;
    reason: string;
  },
  context: Context
) => {

  requireAdmin(context);

  await pool.query(
    `
UPDATE signup_pending
SET
  account_status = 'REJECTED',
  rejected_reason = $2,
  rejected_at = NOW(),
  rejected_by = $3
WHERE id = $1
    `,
    [
  userId,
  reason,
  context.authUser?.userId
]
  );

  await pool.query(
    `
    INSERT INTO sync_queue (
      table_name,
      operation,
      payload
    )
    VALUES ($1,$2,$3)
    `,
    [
      "signup_pending",
      "update",
      JSON.stringify({
  id: userId,
  account_status: 
    "REJECTED",
  rejected_reason: 
    reason,
  rejected_at:
    new Date().toISOString(),
  rejected_by:
    context.authUser?.userId
})
    ]
  );

  await logAuditEvent({

  userId:
    context.authUser?.userId,

  action:
    "ADMIN_REJECTED_USER",

  targetTable:
    "signup_pending",

  targetId:
    String(userId),

metadata: {
  rejectedUserId:
    userId,

  rejectedReason:
    reason,

  rejectedBy:
    context.authUser?.userId
},

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});

  return true;
},
// =====================================
// CHANGE PASSWORD
// =====================================
changePassword: async (
  _: any,
  {
    currentPassword,
    newPassword
  }: {
    currentPassword: string;
    newPassword: string;
  },
  context: Context
) => {

  // =========================
  // REQUIRE LOGIN
  // =========================
  const auth =
    requireAuth(context);

  // =========================
  // GET USER
  // =========================
  const result =
  await pool.query<UserRow>(
    `
    SELECT

      u.*,

      s.failed_change_password_attempts,
      s.change_password_locked_until

    FROM users u

    LEFT JOIN user_security s
    ON s.user_id = u.id

    WHERE u.id = $1
    `,
      [auth.userId]
    );

  const user =
    result.rows[0];

  assertUser(user);
  // =========================
// CHECK LOCK
// =========================
const lockCheck =
  await pool.query(
    `
    SELECT
  NOW() <
  s.change_password_locked_until
  AS locked
FROM user_security s
WHERE s.user_id = $1
    `,
    [user.id]
  );

if (lockCheck.rows[0]?.locked) {

  throw new Error(
    "Too many incorrect current password attempts. Try again later."
  );
}

  // =========================
  // VERIFY CURRENT PASSWORD
  // =========================
  const isValid =
    await bcrypt.compare(
      currentPassword,
      user.password
    );

if (!isValid) {

  const attempts =
    (user.failed_change_password_attempts || 0) + 1;

  let lockUntil = null;

  if (attempts >= 5) {
    lockUntil =
      new Date(
        Date.now() +
        15 * 60 * 1000
      );
  }

  await pool.query(
    `
    UPDATE user_security
SET
  failed_change_password_attempts = $1,
  change_password_locked_until = $2,
  updated_at = NOW()
WHERE user_id = $3
    `,
    [
      attempts,
      lockUntil,
      user.id
    ]
  );

  if (attempts >= 5) {
    throw new Error(
      "Too many incorrect current password attempts. Try again later."
    );
  }

  throw new Error(
    "Current password is incorrect"
  );
}

  // =========================
  // PREVENT SAME PASSWORD
  // =========================
  const isSamePassword =
    await bcrypt.compare(
      newPassword,
      user.password
    );

  if (isSamePassword) {
    throw new Error(
      "New password must be different"
    );
  }

  // =========================
  // MIN LENGTH
  // =========================
  if (newPassword.length < 8) {
    throw new Error(
      "Password must be at least 8 characters"
    );
  }
  // =========================
// RESET FAILED ATTEMPTS
// =========================
await pool.query(
  `
  UPDATE user_security
SET
  failed_change_password_attempts = 0,
  change_password_locked_until = NULL,
  updated_at = NOW()
WHERE user_id = $1
  `,
  [user.id]
);

  // =========================
  // HASH NEW PASSWORD
  // =========================
  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10
    );

  // =========================
// UPDATE PASSWORD
// =========================
await pool.query(
  `
  UPDATE users
  SET password = $1
  WHERE id = $2
  `,
  [
    hashedPassword,
    user.id
  ]
);

await logAuditEvent({

  userId:
    auth.userId,

  action:
    "PASSWORD_CHANGED",

  targetTable:
    "users",

  targetId:
    String(auth.userId),

  metadata: {
    changeType:
      "authenticated_change"
  },

  ipAddress:
    context.ip,

  userAgent:
    context.userAgent,
});

return true;
},


// =====================================
// ACCEPT POLICY UPDATE
// =====================================
acceptPolicyUpdate: async (
  _: any,
  {
    policyVersion
  }: {
    policyVersion: string;
  },
  context: Context
) => {

  const auth =
    requireAuth(context);

  const ip =
    context.ip || null;

  const userAgent =
    context.userAgent || null;

  // =========================
  // VALIDATE POLICY VERSION
  // =========================
  if (
    policyVersion !==
    CURRENT_POLICY_VERSION
  ) {
    throw new Error(
      "Invalid policy version"
    );
  }

  // =========================
  // PREVENT DUPLICATE ACCEPT
  // =========================
  const existing =
    await pool.query(
      `
      SELECT id
      FROM policy_acceptance_history
      WHERE
        user_id = $1
        AND policy_version = $2
      LIMIT 1
      `,
      [
        auth.userId,
        policyVersion
      ]
    );

  if (existing.rows.length > 0) {
    return true;
  }

  // =========================
  // GENERATE EVIDENCE HASH
  // =========================
  const acceptedAt =
    new Date().toISOString();

  const evidenceRaw =
    JSON.stringify({
      userId:
        auth.userId,

      policyVersion,

      acceptedAt,

      ip,

      userAgent,
    });

  const evidenceHash =
    crypto
      .createHash("sha256")
      .update(evidenceRaw)
      .digest("hex");

  // =========================
  // UPDATE USERS TABLE
  // =========================
  await pool.query(
    `
    UPDATE users
    SET
      policy_version = $1,
      policy_accepted = true,
      policy_accepted_at = NOW()
    WHERE id = $2
    `,
    [
      policyVersion,
      auth.userId
    ]
  );

  // =========================
  // INSERT IMMUTABLE HISTORY
  // =========================
  const historyResult =
    await pool.query(
      `
      INSERT INTO policy_acceptance_history (
        user_id,
        policy_version,
        accepted_at,
        ip_address,
        user_agent,
        evidence_hash
      )

      VALUES (
        $1,
        $2,
        NOW(),
        $3,
        $4,
        $5
      )

      RETURNING *
      `,
      [
        auth.userId,
        policyVersion,
        ip,
        userAgent,
        evidenceHash
      ]
    );

    await logAuditEvent({
  userId: auth.userId,

  action:
    "USER_ACCEPTED_POLICY",

  targetTable:
    "policy_acceptance_history",

  targetId:
    String(
      historyResult.rows[0].id
    ),

  metadata: {
    policyVersion,
    evidenceHash,
  },

  ipAddress: ip,

  userAgent,
});

  // =========================
  // CLOUD REPLICATION QUEUE
  // =========================
  await pool.query(
    `
    INSERT INTO sync_queue (
      table_name,
      operation,
      payload
    )
    VALUES ($1,$2,$3)
    `,
    [
      "policy_acceptance_history",
      "insert",
      JSON.stringify(
        historyResult.rows[0]
      )
    ]
  );

  return true;
},

  }, // END OF MUTATION
}; // END OF EXPORT CONST RESOLVERS