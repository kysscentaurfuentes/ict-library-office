// backend/src/resolvers.ts
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { sendOTP } from "./utils/mailer.js";
import crypto from "crypto";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}

const SECRET = process.env.JWT_SECRET;

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

  failed_login_attempts?: number;
  login_locked_until?: string | null;

  failed_otp_attempts?: number;
  otp_locked_until?: string | null;

  last_otp_sent_at?: string | null;
}

type Context = {
  authUser?: {
    userId: number;
    role: string;
  } | null;
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

  if (user.role !== 'admin') {
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
  Query: {
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
  },

   Mutation: {
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

   const res = await pool.query<UserRow>(query, [value]);

    console.log("LOGIN RESULT:", res.rows);
    // 2nd. constant user (Mutation Login)
    const user = res.rows[0];
    // 2nd assertUser
    assertUser(user);
    
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
if (user.two_factor_enabled) {
 const code = Math.floor(100000 + Math.random() * 900000).toString();

const hashedCode = crypto
  .createHmac("sha256", process.env.JWT_SECRET!)
  .update(code)
  .digest("hex");

await pool.query(
  `
  UPDATE users
  SET two_factor_otp = $1,
      two_factor_otp_expires_at = NOW() + INTERVAL '5 minutes'
  WHERE id = $2
  `,
  [hashedCode, user.id]
);

  // 🔥 SEND EMAIL OTP
  await sendOTP(user.email, code);

  console.log("OTP generated for user:", user.id);

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
      profile_picture: user.profile_picture,
      vibration_enabled: user.vibration_enabled,
      dark_mode: user.dark_mode,
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
  // 3rd assertUser
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
if (!user.two_factor_otp || !user.two_factor_otp_expires_at) {
  throw new Error("No 2FA request found");
}

// check expiration
const expiryCheck = await pool.query(
  `
  SELECT NOW() < two_factor_otp_expires_at as valid
  FROM users
  WHERE id = $1
  `,
  [user.id]
);

if (!expiryCheck.rows[0].valid) {
  throw new Error("Code expired");
}

// hash input
const hashedInput = crypto
  .createHmac("sha256", process.env.JWT_SECRET!)
  .update(code)
  .digest("hex");

// compare OTP
if (user.two_factor_otp !== hashedInput) {
  const attempts =
    (user.failed_otp_attempts || 0) + 1;

  let lockUntil: Date | null = null;
  // TIME TEMPORARY
  const LOCK_DURATION_MS = 8 * 60 * 60 * 1000;
  if (attempts >= 5) {
    lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
  }

  await pool.query(
    `
    UPDATE users
    SET
      failed_otp_attempts = $1,
      otp_locked_until = $2
    WHERE id = $3
    `,
    [attempts, lockUntil, user.id]
  );

  // 🔥 Backend wins immediately
  if (lockUntil) {
    throw Object.assign(
      new Error("OTP_LOCKED"),
      {
        extensions: {
          code: "OTP_LOCKED",
          // TIME TEMPORARY
          remainingSeconds: Math.floor(
  (lockUntil.getTime() - Date.now()) / 1000
),
          attemptsUsed: attempts,
        },
      }
    );
  }

  throw Object.assign(
    new Error("INVALID CODE"),
    {
      extensions: {
        code: "INVALID CODE",
        attemptsUsed: attempts,
        attemptsLeft: Math.max(
          0,
          5 - attempts
        ),
      },
    }
  );
}

  // clear OTP + reset failed attempts after success
await pool.query(
  `
  UPDATE users
  SET
    two_factor_otp = NULL,
    two_factor_otp_expires_at = NULL,
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

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await pool.query(
    `
    SELECT * FROM users
    WHERE LOWER(email) = LOWER($1)
OR "StudentId" = $2
    `,
    [normalizedEmail, StudentId]
  );

  if (existing.rows.length > 0) {
    throw new Error("Account already exists");
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
      role
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
    `,
    [
      first_name,
      middle_name,
      last_name,
      normalizedEmail,
      hashedPassword,
      StudentId,
      course,
      school_id_image,
      "Student"
    ]
  );

  const user = result.rows[0];

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    SECRET,
    {
      expiresIn: "1d",
    }
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
  },
};