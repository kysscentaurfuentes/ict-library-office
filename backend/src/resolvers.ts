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

  forgot_password_otp?: string | null;

forgot_password_otp_expires_at?: string | null;

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
            failed_otp_attempts,
            otp_locked_until
          FROM users
          WHERE LOWER(email) = LOWER($1)
             OR "StudentId" = $2
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
            id,
            first_name,
            middle_name,
            last_name,
            email,
            "StudentId",
            course,
            school_id_image,
            role,
            suffix,
            suffix_locked,
            phone_number,
            birthdate,
            birthdate_locked,
            age,
            gender,
            gender_locked,
            nationality,
            nationality_locked,
            user_classification,
            student_type,
            college_department,
            program,
            year_level,
            profile_picture,
            vibration_enabled,
            dark_mode,
            two_factor_enabled
          FROM users
          WHERE id = $1
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
  WHERE email_verified = true
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
        failed_change_password_attempts,
        change_password_locked_until
      FROM users
      WHERE id = $1
      `,
      [auth.userId]
    );

  const row =
    result.rows[0];

  return {
    failedAttempts:
      row
        ?.failed_change_password_attempts || 0,

   lockedUntil:
  row?.change_password_locked_until
    ? new Date(
        row.change_password_locked_until
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
  }, // END OF QUERY
  
  // START OF MUTATION
   Mutation: {
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

  const captchaRequired =
  (security?.request_count || 0) >= 3;

  // =========================
// CLOUDFLARE TURNSTILE
// CAPTCHA VERIFICATION
// =========================

if (captchaRequired) {

  if (!captchaToken) {

    throw new Error(
      'CAPTCHA verification required.'
    );
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
        NOW() < forgot_locked_until
        AS locked
      FROM users
      WHERE id = $1
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
  await pool.query(
    `
    UPDATE users
    SET
      forgot_password_otp = $1,
      forgot_password_otp_expires_at =
        NOW() + INTERVAL '5 minutes'
    WHERE id = $2
    `,
    [
      hashedOTP,
      user.id
    ]
  );

  // =========================
  // SEND EMAIL
  // =========================
  await sendOTP(
    user.email,
    code
  );


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
  // CHECK LOCK
  // =========================
  const lockCheck =
    await pool.query(
      `
      SELECT
        NOW() < forgot_locked_until
        AS locked
      FROM users
      WHERE id = $1
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
  if (
    !user.forgot_password_otp ||
    !user.forgot_password_otp_expires_at
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
        NOW() <
        forgot_password_otp_expires_at
        AS valid
      FROM users
      WHERE id = $1
      `,
      [user.id]
    );

  if (!expiryCheck.rows[0]?.valid) {
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
  // INVALID OTP
  // =========================
  if (
    user.forgot_password_otp !==
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
      UPDATE users
      SET
        failed_forgot_attempts = $1,
        forgot_locked_until = $2
      WHERE id = $3
      `,
      [
        attempts,
        lockUntil,
        user.id
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
    UPDATE users
    SET
      failed_forgot_attempts = 0,
      forgot_locked_until = NULL
    WHERE id = $1
    `,
    [user.id]
  );

  return true;
},
resetForgotPassword: async (
  _: any,
  {
    identifier,
    code,
    newPassword
  }: any
) => {

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

  if (
    user.forgot_password_otp !==
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
SET
  password = $1,
  forgot_password_otp = NULL,
  forgot_password_otp_expires_at = NULL,

  failed_forgot_attempts = 0,
  forgot_locked_until = NULL

WHERE id = $2
    `,
    [
      hashedPassword,
      user.id
    ]
  );

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
    school_id_image
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
      signup_otp_expires_at
    )

    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,
      NOW() + INTERVAL '5 minutes'
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
      hashedOTP
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

    login: async (_: any, { identifier, password }: any) => {

    console.log("RAW IDENTIFIER:", identifier);

    const cleanIdentifier = normalizeIdentifier(identifier);

    console.log("CLEAN IDENTIFIER:", cleanIdentifier);

   console.log("IS STUDENT ID:", isStudentId(cleanIdentifier));

   let query = '';
   let value = '';

   if (isStudentId(cleanIdentifier)) {

    query = `
      SELECT * FROM users
      WHERE TRIM("StudentId") = TRIM($1)
    `;

    value = cleanIdentifier;

    } else {

    query = `
      SELECT * FROM users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
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
  SELECT NOW() < login_locked_until as locked
  FROM users
  WHERE id = $1
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

  const lockUntil =
    attempts >= 5
    // TIME TEMPORARY
      ? "NOW() + INTERVAL '30 seconds'"
      : "NULL";

      // TIME TEMPORARY '30 SECONDS'
  await pool.query(
  `
  UPDATE users
  SET
    failed_login_attempts = $1,
    login_locked_until = CASE
      WHEN $1 >= 5 THEN NOW() + INTERVAL '30 seconds'
      ELSE NULL
    END
  WHERE id = $2
  `,
  [attempts, user.id]
);

  throw new Error("Invalid credentials");
}

await pool.query(
  `
  UPDATE users
  SET
    failed_login_attempts = 0,
    login_locked_until = NULL
  WHERE id = $1
  `,
  [user.id]
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

     return {
  token,
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
  // INVALID OTP
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
  SELECT *
  FROM users
  WHERE LOWER(email) = LOWER($1)
     OR "StudentId" = $2
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
    SELECT NOW() < otp_locked_until as locked
    FROM users
    WHERE id = $1
    `,
    [user.id]
  );
  // 2nd CHECK LOCK (OTP)
if (lockCheck.rows[0]?.locked) {
  const unlockTime = await pool.query(
    `
    SELECT
      EXTRACT(EPOCH FROM (otp_locked_until - NOW()))::int as remaining_seconds
    FROM users
    WHERE id = $1
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
    UPDATE users
    SET
      failed_otp_attempts = $1,
      otp_locked_until = $2
    WHERE id = $3
    `,
    [
      attempts,
      lockUntil,
      user.id
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
  UPDATE users
  SET
    failed_otp_attempts = 0,
    otp_locked_until = NULL
  WHERE id = $1
  `,
  [user.id]
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

    signup: async (
  _: any,
  {
    first_name,
    middle_name,
    last_name,
    email,
    password,
    StudentId,
    course,
    school_id_image
  }: any
) => {
  if (!/^\d{3}-\d{5}$/.test(StudentId)) {
  throw new Error("Invalid Student ID format");
}

  const normalizedEmail =
  email.trim().toLowerCase();

const normalizedStudentId =
  normalizeStudentId(StudentId);

// =========================
// VALIDATE CARSU EMAIL
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
// CHECK EMAIL DUPLICATE
// =========================
const existingEmail =
  await pool.query(
    `
    SELECT id
    FROM users
    WHERE LOWER(email) = LOWER($1)
    `,
    [normalizedEmail]
  );

if (
  existingEmail.rows.length > 0
) {
  throw new GraphQLError(
  "CARSU email already registered.",
  {
    extensions: {
      code:
        "EMAIL_EXISTS",
    },
  }
);
}

// =========================
// CHECK STUDENT ID DUPLICATE
// =========================
const existingStudentId =
  await pool.query(
    `
    SELECT id
    FROM users
    WHERE "StudentId" = $1
    `,
    [normalizedStudentId]
  );

if (
  existingStudentId.rows.length > 0
) {
throw new GraphQLError(
  "Student ID already registered.",
  {
    extensions: {
      code:
        "STUDENT_ID_EXISTS",
    },
  }
);
}

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query<UserRow>(
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
      account_status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
    `,
    [
      first_name,
      middle_name,
      last_name,
      normalizedEmail,
      hashedPassword,
      normalizedStudentId,
      course,
      school_id_image,
      "Student",
      "PENDING"
    ]
  );

  const user = result.rows[0];

  return {
  token: null,
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

  const updated = await pool.query<UserRow>(
    `
    UPDATE users
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
  vibration_enabled = $16,
  dark_mode = $17,
  two_factor_enabled = $18

WHERE id = $19
    RETURNING
      id,
      first_name,
      middle_name,
      last_name,
      email,
      "StudentId",
      course,
      school_id_image,
      role,
      suffix,
      suffix_locked,
      phone_number,
      birthdate,
      birthdate_locked,
      age,
      gender,
      gender_locked,
      nationality,
      nationality_locked,
      user_classification,
      student_type,
      college_department,
      program,
      year_level,
      vibration_enabled,
      dark_mode,
      two_factor_enabled
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
  vibration_enabled ?? user.vibration_enabled,
  dark_mode ?? user.dark_mode,
  two_factor_enabled ?? user.two_factor_enabled,
  auth.userId
]
  );

  return updated.rows[0];
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
  // GENERATE SECRET
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
    UPDATE users
    SET
      two_factor_temp_secret = $1
    WHERE id = $2
    `,
    [
      secret.base32,
      user.id
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
      SELECT *
      FROM users
      WHERE id = $1
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
    UPDATE users
    SET
      two_factor_secret = $1,

      two_factor_temp_secret = NULL,

      two_factor_enabled = true,

      two_factor_confirmed = true,

      two_factor_backup_codes = $2

    WHERE id = $3
    `,
    [
      user.two_factor_temp_secret,
      backupCodes,
      user.id
    ]
  );

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
    UPDATE users
    SET
      two_factor_enabled = false,

      two_factor_secret = NULL,

      two_factor_temp_secret = NULL,

      two_factor_confirmed = false,

      two_factor_backup_codes = NULL

    WHERE id = $1
    `,
    [user.id]
  );

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
        account_status
      )

      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10
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
        "APPROVED"
      ]
    );

  const createdUser =
    userInsertResult.rows[0];

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

  return true;
},
rejectUser: async (
  _: any,
  { userId }: { userId: number },
  context: Context
) => {

  requireAdmin(context);

  await pool.query(
    `
    UPDATE signup_pending
    SET account_status = 'REJECTED'
    WHERE id = $1
    `,
    [userId]
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
        account_status: "REJECTED"
      })
    ]
  );

  return true;
},

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
// CHECK LOCK
// =========================
const lockCheck =
  await pool.query(
    `
    SELECT
      NOW() <
      change_password_locked_until
      AS locked
    FROM users
    WHERE id = $1
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
    UPDATE users
    SET
      failed_change_password_attempts = $1,
      change_password_locked_until = $2
    WHERE id = $3
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
  UPDATE users
  SET
    failed_change_password_attempts = 0,
    change_password_locked_until = NULL
  WHERE id = $1
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

  return true;
},

  }, // END OF MUTATION
}; // END OF EXPORT CONST RESOLVERS