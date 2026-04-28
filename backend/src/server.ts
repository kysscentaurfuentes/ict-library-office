// backend/src/server.ts
// import mime-types from 'mime-types';
// import { createContext }
// import {GraphQLContext}
// import {ParsedQs} from 'qs'
import type { ParamsDictionary } from 'express-serve-static-core'
import express from "express";
import type { Request, Response } from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createRequire } from 'module'; // ✅ Standard import for ESM
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";
import { pool } from "./db.js";
import shareRoutes from "./routes/shareRoutes.js";
import helmet from 'helmet';
import os from 'os';
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

// Setup require for ESM
const require = createRequire(import.meta.url);
// ✅ Gagamitin natin ang 'expressMiddleware' na variable name dito
const { expressMiddleware } = require('@apollo/server/express4');

dotenv.config();
const app = express();
app.use(helmet());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 requests per minute
});

app.use(limiter);

// ==========================
// 🎨 LOG COLORS
// ==========================
const LOG = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
};

// ==========================
// 🔐 ENV
// ==========================
const PORT = Number(process.env.PORT || 4000);
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}
const SECRET = process.env.JWT_SECRET;

// ==========================
// 🌐 GET LOCAL IP ADDRESS
// ==========================
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  throw new Error("No network interface found");
}

const LOCAL_IP = getLocalIP();
console.log(`${LOG.blue}🌐 Detected IP: ${LOCAL_IP}${LOG.reset}`);

// ==========================
// 🧠 FORMAT HELPERS
// ==========================
const normalizeID = (id: string): string => id.replace(/-/g, "");

const formatID = (id: string): string => {
  const clean = normalizeID(id);
  if (clean.length === 8) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return id;
};

// ==========================
// 📁 PATH (COMMONJS SAFE)
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const HLS_DIR = path.join(ROOT_DIR, "public", "hls");

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
  console.log(`${LOG.cyan}📁 Created HLS directory: ${HLS_DIR}${LOG.reset}`);
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
  const httpServer = http.createServer(app);

  // CORS - allow all devices on network
  app.use(cors({
origin: process.env.CORS_ORIGIN,
credentials: true,
  }));
  app.use("/api", shareRoutes);
  app.use("/api/scan", rateLimit({
  windowMs: 60 * 1000,
  max: 10,
}));

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

    const cleanID = normalizeID(rawID);
    const displayID = rawID;

    console.log(`${LOG.cyan}[${time}] SCAN:${LOG.reset} ${displayID}`);

    try {
      const result = await pool.query(
        `SELECT username, "StudentId" 
         FROM users 
         WHERE "StudentId" = $1`,
        [displayID]
      );

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

      let flags: string[] = [];
      let riskScore = 0;

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

      console.log(
        `${LOG.green}[${time}] SUCCESS:${LOG.reset} ${displayID} - ${user.username}`
      );

      const nowPH = new Date();
      const hour = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        hour: "numeric",
        hour12: false,
      }).format(nowPH);

      const hourNum = Number(hour);
      console.log("HOUR:", hourNum);

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
  // ✅ ATTENDANCE APIs
  // ==========================
  app.get("/api/attendance/me", async (req, res) => {
    try {
      const studentId = String(req.headers["x-student-id"] || "");
      if (!studentId) {
        return res.status(400).json({ message: "Missing student ID" });
      }
      const result = await pool.query(
        `SELECT * FROM attendance WHERE student_id = $1 ORDER BY check_in ASC`,
        [studentId]
      );
      res.json(result.rows);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/attendance/:studentId", async (req: Request<ParamsDictionary>, res) => {
    const { studentId } = req.params;
    const result = await pool.query(
      `SELECT * FROM attendance WHERE student_id = $1 ORDER BY check_in ASC`,
      [studentId]
    );
    res.json(result.rows);
  });

  app.get("/api/share/:token", async (req, res) => {
    const { token } = req.params;
    console.log("TOKEN:", token);
    const result = await pool.query(
      "SELECT student_id FROM share_tokens WHERE token = $1",
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invalid token" });
    }
    const studentId = result.rows[0].student_id;
    console.log("FOUND STUDENT:", studentId);
    const attendance = await pool.query(
      "SELECT * FROM attendance WHERE student_id = $1 ORDER BY check_in ASC",
      [studentId]
    );
    console.log("ATTENDANCE:", attendance.rows);
    res.json(attendance.rows);
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const { studentId } = req.body;
      if (!studentId) {
        return res.status(400).json({ message: "Missing studentId" });
      }
      const now = new Date();
      const result = await pool.query(
        `INSERT INTO attendance (student_id, check_in) VALUES ($1, $2) RETURNING *`,
        [studentId, now]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error("CREATE ATTENDANCE ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/attendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(`DELETE FROM attendance WHERE id = $1`, [id]);
      res.json({ success: true });
    } catch (err) {
      console.error("DELETE ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ==========================
  // 📡 HLS STATIC SERVE (from Python processed stream)
  // ==========================
  app.use("/hls", express.static(HLS_DIR, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-cache");
      }
      if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
        res.setHeader("Cache-Control", "no-cache");
      }
    }
  }));

  // ==========================
  // 🧪 HEALTH CHECK
  // ==========================
  app.get("/health", (_: Request, res: Response) => {
    const hlsExists = fs.existsSync(path.join(HLS_DIR, "stream.m3u8"));
    res.json({
      status: "ok",
      server_ip: LOCAL_IP,
      port: PORT,
      hls_stream_available: hlsExists,
      hls_url: process.env.PUBLIC_HLS_URL,
python_stream_url: process.env.PUBLIC_PYTHON_URL,
      message: "Node.js backend running"
    });
  });

  // ==========================
  // 🔥 PROXY ENDPOINT para i-check ang Python status
  // ==========================
  app.get("/api/stream-status", async (_: Request, res: Response) => {
    const hlsPath = path.join(HLS_DIR, "stream.m3u8");
    const exists = fs.existsSync(hlsPath);
    const stats = exists ? fs.statSync(hlsPath) : null;
    
    res.json({
      python_stream_active: exists,
      last_updated: stats ? stats.mtime : null,
      node_server: process.env.PUBLIC_URL,
      python_server: `${process.env.PUBLIC_URL}:5000`,
      hls_url_via_node: `process.env.PUBLIC_URL/hls/stream.m3u8`,
      hls_url_direct_python: `process.env.PUBLIC_URL:5000/hls/stream.m3u8`
    });
  });

  // ==========================
  // 🔥 GRAPHQL
  // ==========================
 const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

  await apollo.start();

app.use(
  "/graphql",
  express.json(), // ✅ IMPORTANT: Kailangan ito bago ang middleware
  expressMiddleware(apollo, {
    context: async ({ req }: { req: Request }) => {
      // Kunin ang user base sa Authorization header
      const user = await getUser(req.headers.authorization);
      return { authUser: user };
    },
  })
);

  // ==========================
  // ▶ START SERVER (listen on all interfaces)
  // ==========================
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT, host: '0.0.0.0' }, resolve)
  );
const BASE_URL = process.env.PUBLIC_URL || `http://${LOCAL_IP}:${PORT}`;
  console.log("=".repeat(60));
  console.log(`${LOG.green}🚀 Node.js Backend Running${LOG.reset}`);
  console.log("=".repeat(60));
  console.log(`${LOG.blue}📡 Server IP:${LOG.reset} ${LOCAL_IP}`);
  console.log(`${LOG.blue}🔌 Port:${LOG.reset} ${PORT}`);
  console.log(`${LOG.blue}🔗 GraphQL:${LOG.reset} ${BASE_URL}/graphql`);
  console.log(`${LOG.blue}📸 Scan API:${LOG.reset} ${BASE_URL}/api/scan`);
  console.log(`${LOG.blue}📺 HLS Stream:${LOG.reset} ${BASE_URL}/hls/stream.m3u8`);
  console.log(`${LOG.blue}❤️  Health:${LOG.reset} ${BASE_URL}/health`);
  console.log("=".repeat(60));
  console.log(`${LOG.yellow}⚠️  IMPORTANT:${LOG.reset}`);
  console.log(`${LOG.yellow}   Python Flask (port 5000) MUST be running for HLS stream${LOG.reset}`);
  console.log(`${LOG.yellow}   Run: cd ai-service && python flask_stream.py${LOG.reset}`);
  console.log("=".repeat(60));
  console.log(`${LOG.cyan}📱 For Mobile App:${LOG.reset}`);
  console.log(`${LOG.cyan}   Stream URL: http://${LOCAL_IP}:5000/hls/stream.m3u8${LOG.reset}`);
  console.log(`${LOG.cyan}   API Base: http://${LOCAL_IP}:4000${LOG.reset}`);
  console.log("=".repeat(60));
}

// ==========================
// ▶ RUN
// ==========================
startServer().catch(console.error);