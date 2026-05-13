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
function assertUser(user) {
    if (!user)
        throw new Error('User not found');
}
function requireAuth(context) {
    if (!context.authUser) {
        throw new Error('Not authenticated');
    }
    return context.authUser;
}
function requireAdmin(context) {
    const user = requireAuth(context);
    if (user.role !== 'admin') {
        throw new Error('Unauthorized: Admin only');
    }
    return user;
}
function normalizeMac(mac) {
    return mac.toLowerCase().replace(/-/g, ':');
}
function isValidMac(mac) {
    return /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(mac);
}
function normalizeIdentifier(identifier) {
    return identifier.trim().toLowerCase();
}
function normalizeStudentId(id) {
    const clean = id.replace(/-/g, '');
    if (clean.length === 7) {
        return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    }
    return id;
}
function isStudentId(value) {
    return /^\d{3}-?\d+$/.test(value);
}
function buildEmail(identifier) {
    const clean = normalizeIdentifier(identifier);
    if (clean.includes('@')) {
        return clean;
    }
    return `${clean}@carsu.edu.ph`;
}
export const resolvers = {
    Query: {
        hello: () => "Backend is working with Router 🚀",
        me: async (_, __, context) => {
            const auth = requireAuth(context);
            const res = await pool.query(`
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
age,
gender,
nationality,
user_classification,
student_type,
college_department,
program,
year_level,
profile_picture
FROM users
WHERE id = $1
        `, [auth.userId]);
            const user = res.rows[0];
            assertUser(user);
            return user;
        },
        routerDevices: async (_, __, context) => {
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
        login: async (_, { identifier, password }) => {
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
            }
            else {
                query = `
      SELECT * FROM users
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
    `;
                value = buildEmail(cleanIdentifier);
            }
            console.log("LOGIN VALUE:", value);
            const res = await pool.query(query, [value]);
            console.log("LOGIN RESULT:", res.rows);
            const user = res.rows[0];
            assertUser(user);
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Invalid credentials');
            }
            const token = jwt.sign({
                userId: user.id,
                role: user.role,
            }, SECRET, {
                expiresIn: '1d',
            });
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
                }
            };
        },
        signup: async (_, { first_name, middle_name, last_name, email, password, StudentId, course, school_id_image }) => {
            if (!/^\d{3}-\d{5}$/.test(StudentId)) {
                throw new Error("Invalid Student ID format");
            }
            const normalizedEmail = email.trim().toLowerCase();
            const existing = await pool.query(`
    SELECT * FROM users
    WHERE LOWER(email) = LOWER($1)
OR "StudentId" = $2
    `, [normalizedEmail, StudentId]);
            if (existing.rows.length > 0) {
                throw new Error("Account already exists");
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await pool.query(`
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
    `, [
                first_name,
                middle_name,
                last_name,
                normalizedEmail,
                hashedPassword,
                StudentId,
                course,
                school_id_image,
                "student"
            ]);
            const user = result.rows[0];
            const token = jwt.sign({
                userId: user.id,
                role: user.role,
            }, SECRET, {
                expiresIn: "1d",
            });
            return {
                token,
                user
            };
        },
        updateProfilePicture: async (_, { profile_picture }, context) => {
            const auth = requireAuth(context);
            const updated = await pool.query(`
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
      role
    `, [profile_picture, auth.userId]);
            return updated.rows[0];
        },
        updateUserInformation: async (_, { phone_number, suffix, birthdate, age, gender, nationality, user_classification, student_type, college_department, program, year_level }, context) => {
            const auth = requireAuth(context);
            // get current user
            const existingUser = await pool.query(`
    SELECT *
    FROM users
    WHERE id = $1
    `, [auth.userId]);
            const user = existingUser.rows[0];
            assertUser(user);
            // prevent editing suffix again
            let finalSuffix = user.suffix;
            let finalLocked = user.suffix_locked;
            if (!user.suffix_locked && suffix) {
                finalSuffix = suffix;
                finalLocked = true;
            }
            const updated = await pool.query(`
    UPDATE users
SET
  phone_number = $1,
  suffix = $2,
  suffix_locked = $3,

  birthdate = $4,
  age = $5,
  gender = $6,
  nationality = $7,
  user_classification = $8,
  student_type = $9,
  college_department = $10,
  program = $11,
  year_level = $12

WHERE id = $13
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
      age,
      gender,
      nationality,
      user_classification,
      student_type,
      college_department,
      program,
      year_level
    `, [
                phone_number,
                finalSuffix,
                finalLocked,
                birthdate,
                age,
                gender,
                nationality,
                user_classification,
                student_type,
                college_department,
                program,
                year_level,
                auth.userId
            ]);
            return updated.rows[0];
        },
        renameDevice: async (_, { mac, name }, context) => {
            requireAuth(context);
            const normalizedMac = normalizeMac(mac);
            await pool.query(`
        INSERT INTO devices (
          device_id,
          custom_name
        )
        VALUES ($1, $2)

        ON CONFLICT (device_id)

        DO UPDATE SET
        custom_name = EXCLUDED.custom_name
        `, [normalizedMac, name]);
            return {
                success: true
            };
        },
        blockDevice: async (_, { mac }, context) => {
            requireAdmin(context);
            const normalizedMac = normalizeMac(mac);
            if (!isValidMac(normalizedMac)) {
                throw new Error('Invalid MAC address');
            }
            await pool.query(`
        INSERT INTO commands (
          type,
          mac,
          created_at
        )
        VALUES ($1, $2, NOW())

        ON CONFLICT (mac, type)
        DO NOTHING
        `, ['block', normalizedMac]);
            return true;
        },
        unblockDevice: async (_, { mac }, context) => {
            requireAdmin(context);
            const normalizedMac = normalizeMac(mac);
            if (!isValidMac(normalizedMac)) {
                throw new Error('Invalid MAC address');
            }
            await pool.query(`
        INSERT INTO commands (
          type,
          mac,
          created_at
        )
        VALUES ($1, $2, NOW())

        ON CONFLICT (mac, type)
        DO NOTHING
        `, ['unblock', normalizedMac]);
            return true;
        },
    },
};
//# sourceMappingURL=resolvers.js.map