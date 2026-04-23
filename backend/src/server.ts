// backend/src/server.ts
// import mime-types from 'mime-types';
// import {createHandler} from 'graphql-http/lib/use/express';
// import { schema }
// import { startHlsTranscoder}
// import { connectDb }
// import { createContext }
// import {GraphQLContext}
// import {ParsedQs} from 'qs'
// import type {ParamsDictionary} from 'express-serve-static-core'
// import type {OperationContext} from 'graphql-http'
// backend/src/server.ts
import express from "express";
import type { Request, Response } from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { spawn } from "child_process";
import type { ChildProcessWithoutNullStreams } from "child_process";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";
import { fileURLToPath } from "url";
import { pool } from "./db.js"; // 🔥 IMPORTANT


dotenv.config();

// ==========================
// 🎨 LOG COLORS
// ==========================
const LOG = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

// ==========================
// 🔐 ENV
// ==========================
const PORT = Number(process.env.PORT || 4000);
const SECRET = process.env.JWT_SECRET || "dev_secret";
const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
const RTSP_URL = process.env.RTSP_URL || "";

// ==========================
// 🧠 FORMAT HELPERS
// ==========================
const normalizeID = (id: string): string => id.replace(/-/g, "");

const formatID = (id: string): string => {
  const clean = normalizeID(id);

  if (clean.length === 8) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }

  return id; // fallback
};
// ==========================
// 📁 PATH
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const HLS_DIR = path.join(ROOT_DIR, "public", "hls");
const HLS_OUTPUT = path.join(HLS_DIR, "stream.m3u8");

// ==========================
// 🧠 STATE
// ==========================
let ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
let restarting = false;
// ==========================
// ⏱️ DEVICE RATE LIMIT
// ==========================
const deviceCooldown: Record<string, number> = {};
const ONE_HOUR = 60 * 60 * 1000;
// ==========================
// 📁 ENSURE DIR
// ==========================
if (!fs.existsSync(HLS_DIR)) {
  fs.mkdirSync(HLS_DIR, { recursive: true });
}

// ==========================
// 🧹 CLEAN HLS
// ==========================
function cleanHLS() {
  if (!fs.existsSync(HLS_DIR)) return;

  for (const file of fs.readdirSync(HLS_DIR)) {
    if (file.endsWith(".ts") || file.endsWith(".m3u8")) {
      try {
        fs.unlinkSync(path.join(HLS_DIR, file));
      } catch {}
    }
  }
}

// ==========================
// 🎥 START FFMPEG
// ==========================
function startFFmpeg() {
  if (!RTSP_URL) return;

  console.log("🎥 Starting FFmpeg...");
  cleanHLS();

  ffmpegProcess = spawn(FFMPEG_PATH, [
    "-loglevel", "error",
    "-nostats",
    "-rtsp_transport", "tcp",
    "-fflags", "+genpts",
    "-use_wallclock_as_timestamps", "1",
    "-i", RTSP_URL,

    "-c:v", "libx264",
    "-preset", "veryfast",
    "-tune", "zerolatency",
    "-pix_fmt", "yuv420p",
    "-profile:v", "baseline",
    "-level", "3.0",

    "-c:a", "aac",
    "-ar", "44100",
    "-b:a", "128k",

    "-f", "hls",
    "-hls_time", "2",
    "-hls_list_size", "3",
    "-hls_flags", "delete_segments+append_list+independent_segments",

    HLS_OUTPUT
  ]);

  ffmpegProcess.stderr.on("data", (data) => {
    const msg = data.toString();
    if (msg.toLowerCase().includes("error")) {
      console.log("FFmpeg ERROR:", msg);
    }
  });

  ffmpegProcess.on("close", (code) => {
    console.log(`❌ FFmpeg stopped (${code})`);

    if (!restarting) {
      restarting = true;
      setTimeout(() => {
        restarting = false;
        startFFmpeg();
      }, 2000);
    }
  });
}

// ==========================
// 🔐 AUTH
// ==========================
async function getUser(token?: string) {
  try {
    if (!token) return null;
    return jwt.verify(token.replace("Bearer ", ""), SECRET) as any;
  } catch {
    return null;
  }
}

// ==========================
// 🚀 START SERVER
// ==========================
async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors());
  app.use(bodyParser.json());

  // ==========================
  // 🔥 SCAN API
  // ==========================
  app.post("/api/scan", async (req: Request, res: Response) => {
let attendanceSaved = false;
let finalStatus = "fail";
    const rawID = String(req.body.student_id || "");
    const deviceID = String(req.headers["x-device-id"] || "UNKNOWN");
    const now = Date.now();

    const time = new Date().toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
    });

    const cleanID = normalizeID(rawID); // ginagamit lang for compare
    const displayID = rawID; // 🔥 IMPORTANT: KEEP DASH FORMAT

    console.log(`${LOG.cyan}[${time}] SCAN:${LOG.reset} ${displayID}`);

    try {
      const result = await pool.query(
        `SELECT username, "StudentId" 
         FROM users 
         WHERE "StudentId" = $1`,
        [displayID] // 🔥 EXACT MATCH NA (may dash)
      );

      // ❌ NOT FOUND
      if (result.rows.length === 0) {
        await pool.query(
  `INSERT INTO scan_logs (student_id, device_id, status, flag, risk_score)
   VALUES ($1, $2, $3, $4, $5)`,
  [displayID, deviceID, "fail", "not_found", 0]
);

        return res.status(404).json({
          status: "fail",
          student_id: displayID,
          message: "Student not found",
        });
      }

      const user = result.rows[0];

      // ==========================
      // 🧠 DEVICE ANOMALY DETECTION
      // ==========================
let flags: string[] = [];
let riskScore = 0;

// 🔍 Check last device used by this student
const devicesResult = await pool.query(
  `SELECT DISTINCT device_id 
   FROM scan_logs 
   WHERE student_id = $1`,
  [displayID]
);

const knownDevices = devicesResult.rows.map(r => r.device_id);

if (knownDevices.length > 0 && !knownDevices.includes(deviceID)) {
  flags.push("new_device");
  riskScore += 1;
}

// 🔍 Check if this device is used by other students
const otherUsersOnDevice = await pool.query(
  `SELECT DISTINCT student_id 
   FROM scan_logs 
   WHERE device_id = $1 AND student_id != $2`,
  [deviceID, displayID]
);

if (otherUsersOnDevice.rows.length > 0) {
  flags.push("multi_account_device");
  riskScore += 1;
}

if (riskScore >= 2) {
  flags.push("high_risk");
}

      // 🔍 LAST SCAN (PER STUDENT)
      const lastScan = await pool.query(
        `SELECT created_at 
         FROM scan_logs
         WHERE student_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [displayID]
      );

      if (lastScan.rows.length > 0) {
        const lastTime = new Date(lastScan.rows[0].created_at).getTime();
        const diffMinutes = (now - lastTime) / (1000 * 60);

       if (diffMinutes < 60) {
  await pool.query(
    `INSERT INTO scan_logs (student_id, device_id, status, flag, risk_score)
     VALUES ($1, $2, $3, $4, $5)`,
    [displayID, deviceID, "blocked", "cooldown_violation", riskScore]
  );

  return res.status(429).json({ status: "blocked" });
}
      }

      // ✅ SUCCESS
      console.log(
        `${LOG.green}[${time}] SUCCESS:${LOG.reset} ${displayID} - ${user.username}`
      );

      // 🕒 OFFICE HOURS CHECK + ATTENDANCE SAVE
const nowPH = new Date();
const hour = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  hour: "numeric",
  hour12: false,
}).format(nowPH);

const hourNum = Number(hour);

console.log("HOUR:", hourNum);

// ✅ CHECK OFFICE HOURS
if (true) {
  try {
    await pool.query(
      `INSERT INTO attendance (student_id, check_in)
       VALUES ($1, $2)`,
      [displayID, nowPH]
    );

    attendanceSaved = true;
    finalStatus = "success";

  } catch (err: any) {
    if (err.code === "23505") {
      // already exists (same day)
      attendanceSaved = true;
      finalStatus = "success";
    } else {
      throw err;
    }
  }

} else {
  finalStatus = "closed";
}

await pool.query(
  `INSERT INTO scan_logs (student_id, device_id, status, flag, risk_score) 
   VALUES ($1, $2, $3, $4, $5)`,
  [
    displayID,
    deviceID,
    finalStatus,
  flags.length ? flags.join(",") : null,
  riskScore
]
);

      return res.json({
        status: finalStatus,
        student_id: displayID,
        name: user.username,
        course: user.course || "N/A",
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
      });

    } catch (err) {
      console.log(`${LOG.red}ERROR:${LOG.reset}`, err);

      return res.status(500).json({
        status: "fail",
        message: "Server error",
      });
    }
  });

  // ==========================
// 📊 ATTENDANCE API
// ==========================
app.get("/api/attendance/:studentId", async (req, res) => {
  const { studentId } = req.params;

  const result = await pool.query(
    `SELECT * FROM attendance
     WHERE student_id = $1
     ORDER BY check_in ASC`,
    [studentId]
  );

  res.json(result.rows);
});

  // ==========================
  // 📡 HLS
  // ==========================
  app.use("/hls", express.static(HLS_DIR));

  // ==========================
  // 🧪 HEALTH
  // ==========================
  app.get("/health", (_: Request, res: Response) => {
    res.json({
      status: "ok",
      ffmpeg: !!ffmpegProcess,
    });
  });

  // ==========================
  // 🔥 GRAPHQL
  // ==========================
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apollo.start();

  app.use(
    "/graphql",
    expressMiddleware(apollo, {
      context: async ({ req }) => ({
        authUser: await getUser(req.headers.authorization),
      }),
    })
  );

  // ==========================
  // ▶ START
  // ==========================
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Scan API: http://localhost:${PORT}/api/scan`);

  startFFmpeg();
}

// ==========================
// ▶ RUN
// ==========================
startServer();