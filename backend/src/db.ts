// backend/src/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ✅ LOCAL DATABASE (PRIMARY)
export const localPool = new Pool({
  connectionString: process.env.DATABASE_URL_LOCAL,
});

// ☁️ NEON DATABASE (CLOUD BACKUP)
export const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL_NEON,
  ssl: {
    rejectUnauthorized: false,
  },
});

// backward compatibility
export const pool = localPool;