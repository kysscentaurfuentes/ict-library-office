// backend/src/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from '../src/utils/logger.js'

dotenv.config({
  path:
    process.env.DOCKER_ENV === "true"
      ? ".env.docker"
      : ".env.local",
});

logger.server(
  `NEON DATABASE: ${process.env.DATABASE_URL_NEON}`
);

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