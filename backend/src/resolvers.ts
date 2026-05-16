// backend/src/resolvers.ts
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

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

  birthdate?: string;
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
}

type Context = {
  authUser?: {
    userId: number;
    role: string;
  } | null;
};

function assertUser(user: UserRow | undefined): asserts user is UserRow {
  if (!user) throw new Error('User not found');
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

    me: async (_: any, __: any, context: Context) => {
      const auth = requireAuth(context);

      const res = await pool.query<UserRow>(
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
dark_mode
FROM users
WHERE id = $1
        `,
        [auth.userId]
      );

      const user = res.rows[0];

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

  const user = res.rows[0];

  assertUser(user);

      const isValid = await bcrypt.compare(
        password,
        user.password
      );

      if (!isValid) {
        throw new Error('Invalid credentials');
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
    dark_mode
  }: {
    phone_number: string;
    suffix?: string;
    birthdate?: string;
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
    finalBirthdate = birthdate;
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
  dark_mode = $17

WHERE id = $18
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
      dark_mode
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
  vibration_enabled,
  dark_mode,
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