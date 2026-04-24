// backend/src/routes/shareRoutes.ts
import { Router } from 'express';
import type { Request, Response } from 'express';
import { pool } from '../db.js'; // 🔥 import mo DB connection
import crypto from "crypto";

const router = Router();

// ✅ CREATE SHARE TOKEN
router.post('/share', async (req: Request, res: Response) => {
  try {
    const studentId = req.body?.studentId;

    if (!studentId) {
      return res.status(400).json({ message: 'Missing studentId' });
    }

    const token = crypto.randomBytes(24).toString("hex");

    await pool.query(
      "INSERT INTO share_tokens (token, student_id) VALUES ($1, $2)",
      [token, studentId]
    );

    return res.json({ token });
  } catch (error) {
    console.error('Share error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;