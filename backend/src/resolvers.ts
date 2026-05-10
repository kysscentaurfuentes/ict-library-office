// backend/src/resolvers.ts
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET as string;

interface UserRow {
  id: number;
  username: string;
  password: string;
  StudentId: string;
  role: string;
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
  if (!context.authUser) throw new Error('Not authenticated');
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

export const resolvers = {
  Query: {
    hello: () => "Backend is working with Router 🚀",

    me: async (_: any, __: any, context: Context) => {
      const auth = requireAuth(context);
      const res = await pool.query<UserRow>(
        'SELECT id, username, "StudentId", role FROM users WHERE id = $1',
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
    login: async (_: any, { username, password }: any) => {
      const res = await pool.query<UserRow>(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      const user = res.rows[0];
      assertUser(user);

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error('Invalid credentials');

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        SECRET,
        { expiresIn: '1d' }
      );

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          StudentId: user.StudentId,
          role: user.role,
        }
      };
    },

    signup: async (_: any, { username, password, StudentId }: any) => {
      const existing = await pool.query(
        'SELECT * FROM users WHERE username = $1 OR "StudentId" = $2',
        [username, StudentId]
      );

      if (existing.rows.length > 0) {
        throw new Error('Already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query<UserRow>(
        'INSERT INTO users (username, password, "StudentId") VALUES ($1, $2, $3) RETURNING *',
        [username, hashedPassword, StudentId]
      );

      const user = result.rows[0];
      assertUser(user);

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        SECRET,
        { expiresIn: '1d' }
      );

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          StudentId: user.StudentId,
          role: user.role,
        }
      };
    },

    renameDevice: async (_: any, { mac, name }: any, context: Context) => {
      requireAuth(context);
      
      const normalizedMac = normalizeMac(mac);

      await pool.query(
        `INSERT INTO devices (device_id, custom_name)
         VALUES ($1, $2)
         ON CONFLICT (device_id)
         DO UPDATE SET custom_name = EXCLUDED.custom_name`,
        [normalizedMac, name]
      );

      return { success: true };
    },

    blockDevice: async (_: any, { mac }: { mac: string }, context: Context) => {
      requireAdmin(context);

      const normalizedMac = normalizeMac(mac);

      if (!isValidMac(normalizedMac)) {
        throw new Error("Invalid MAC address");
      }

      // Insert command into commands table for agent to process
      await pool.query(
        `INSERT INTO commands (type, mac, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (mac, type) 
         DO NOTHING`,
        ["block", normalizedMac]
      );

      return true;
    },

    unblockDevice: async (_: any, { mac }: { mac: string }, context: Context) => {
      requireAdmin(context);

      const normalizedMac = normalizeMac(mac);

      if (!isValidMac(normalizedMac)) {
        throw new Error("Invalid MAC address");
      }

      // Insert command into commands table for agent to process
      await pool.query(
        `INSERT INTO commands (type, mac, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (mac, type) 
         DO NOTHING`,
        ["unblock", normalizedMac]
      );

      return true;
    },
  },
};