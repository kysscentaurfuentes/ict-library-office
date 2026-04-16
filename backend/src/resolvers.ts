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
  "StudentId": string; // ✅ Matches DB Column
  role: string;
}

function assertUser(user: UserRow | undefined): asserts user is UserRow {
  if (!user) throw new Error('User not found');
}

type Context = {
  authUser?: {
    userId: number;
    role: string;
  } | null;
};

function requireAuth(context: Context) {
  if (!context.authUser) throw new Error('Not authenticated');
  return context.authUser;
}

export const resolvers = {
  Query: {
    hello: () => "Backend is working with StudentId support!",
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
          StudentId: user.StudentId, // ✅ Return from DB
          role: user.role,
        },
      };
    },

    signup: async (_: any, { username, password, StudentId }: any) => {
      const existing = await pool.query(
        'SELECT * FROM users WHERE username = $1 OR "StudentId" = $2',
        [username, StudentId]
      );

      if (existing.rows.length > 0) {
        throw new Error('Username or Student ID already exists');
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
        },
      };
    },
  },
};