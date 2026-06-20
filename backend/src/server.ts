// backend/src/server.ts
// import mime-types from 'mime-types';
// import { createContext }
// import {GraphQLContext}
// import {ParsedQs} from 'qs'
// import bodyParser from "body-parser";
import type { ParamsDictionary } from 'express-serve-static-core'
import express from "express";
import client from 'prom-client';
import type { Request, Response } from "express";
import http from "http";
import cors from "cors";
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
import { upload } from "./upload.js";
import { initSocket } from "./socket.js";
import { userSockets } from "./socket.js";
import './agent/cloudSyncAgent.js';
import './redis.js';
import "./services/network/scheduler.js";
import networkRoutes from "./services/network/network.routes.js"
import { startHlsStream }
from "./services/hls/ffmpeg.js";
import { logger } from "../src/utils/logger.js";

setInterval(() => {
  logger.server(
    "Backend alive"
  );
}, 60000); // Every 1 minuete

// Setup require for ESM
const require = createRequire(import.meta.url);
// ✅ Gagamitin natin ang 'expressMiddleware' na variable name dito
import { expressMiddleware } from "@as-integrations/express4";

if (!process.env.DOCKER_ENV) {
  dotenv.config({ path: ".env.local" });
}
const app = express();

// ===============================
// PROMETHEUS METRICS
// ===============================

const collectDefaultMetrics =
  client.collectDefaultMetrics;

collectDefaultMetrics();

const httpRequestsTotal =
  new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP Requests',
  });

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.CORS_ORIGIN
      ?.split(',')
      .map(o => o.trim())
      .filter(Boolean) || [];

    const hostname = new URL(origin).hostname;

  const isAllowed =
    allowedOrigins.includes(origin) ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.");
      
    if (isAllowed) {
      return callback(null, true);
    }

    logger.error(
  `[CORS] BLOCKED ORIGIN | ${origin}`
);

    return callback(null, false); // SAFE BLOCK
  },
  credentials: true,
}));

app.options(
  "*",
  cors({
    origin: true,
    credentials: true,
  })
);
app.set('trust proxy', 1);
app.use(
  helmet({
  crossOriginResourcePolicy: {
    policy: "cross-origin",
  },
}));

app.use(express.json());
app.use((req, res, next) => {

  httpRequestsTotal.inc();

  next();
});
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000,

  max:
    process.env.NODE_ENV ===
    "production"
      ? 300
      : 5000,
});

app.use(limiter);

// ==========================
// 📁 STATIC UPLOADS (for profile pics, school IDs, etc.)
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");

const UPLOADS_DIR = path.join(ROOT_DIR, "uploads");
logger.server(`UPLOADS_DIR: ${UPLOADS_DIR}`);
logger.server(`__dirname: ${__dirname}`);
logger.server(`ROOT_DIR: ${ROOT_DIR}`);

app.use("/uploads", (req, res, next) => {

  res.header("Access-Control-Allow-Origin", "*");

  res.header(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "*"
  );

  res.header(
    "Cross-Origin-Resource-Policy",
    "cross-origin"
  );

  next();

});

app.use(
  "/uploads",
  express.static(UPLOADS_DIR)
);

app.post(
  "/api/upload-school-id",
  (req, res) => {
    logger.upload(
  "School ID upload request received"
);
    upload.single("image")(req, res, (err: any) => {
      logger.upload(
  `Request body received`
);
      if (err) {
        logger.error(
  `[UPLOAD] ${err}`
);
        return res.status(400).json({
          message: err.message || "Upload failed",
        });
      }

      const fileReq = req as Request & {
        file?: Express.Multer.File;
      };
      logger.upload(
  `File uploaded: ${fileReq.file?.filename}`
);
      if (!fileReq.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const BASE_URL =
        process.env.NODE_ENV === "production"
            ? process.env.PUBLIC_URL
    : `http://localhost:${PORT}`;
logger.upload(
  `BASE_URL: ${BASE_URL}`
);
      return res.json({
  imageUrl:
    `${BASE_URL}/uploads/temporary school-ids/${fileReq.file.filename}`,
});
    });
  }
);

app.post(
  "/api/upload-profile-picture",
  upload.single("image"),
  async (req, res) => {

    try {

      const fileReq = req as Request & {
        file?: Express.Multer.File;
      };

      if (!fileReq.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const studentId = req.body.studentId;

      if (!studentId) {
        return res.status(400).json({
          message: "Student ID required",
        });
      }

      const BASE_URL =
        process.env.NODE_ENV === "production"
            ? process.env.PUBLIC_URL
    : `http://localhost:${PORT}`;

      const imageUrl =
        `${BASE_URL}/uploads/profile-pictures/${fileReq.file.filename}`;

      // ==========================
      // 💾 SAVE TO DATABASE
      // ==========================
      await pool.query(
        `
        UPDATE users
        SET profile_picture = $1
        WHERE "StudentId" = $2
        `,
        [imageUrl, studentId]
      );

      logger.upload(
  `PROFILE PICTURE SAVED | ${imageUrl}`
);

      return res.json({
        success: true,
        imageUrl,
      });

    } catch (err) {

      logger.error(
  `[UPLOAD] ${String(err)}`
);

      return res.status(500).json({
        message:
          "Failed to upload profile picture",
      });
    }
  }
);


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
logger.server(
  `Detected IP: ${LOCAL_IP}`
);

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
 logger.server(
  `Created HLS directory: ${HLS_DIR}`
);
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
  const io = initSocket(httpServer);

  // CORS - allow all devices on network
const allowedOrigins = process.env.CORS_ORIGIN
  ?.split(',')
  .map(o => o.trim())
  .filter(Boolean) || [];

  app.use("/api", shareRoutes);
  app.use("/api/scan", rateLimit({
  windowMs: 60 * 1000,
  max: 10,
}));

app.use("/api/network", networkRoutes);

const qrScansTotal =
  new client.Counter({
    name: 'qr_scans_total',
    help: 'Total QR scans',
  });

  // ==========================
  // 🔥 SCAN API
  // ==========================
 app.post("/api/scan", async (req: Request, res: Response) => {
  qrScansTotal.inc();
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

    logger.scan(
  `QR RECEIVED | ${displayID}`
);

    try {
      const result = await pool.query(
        `SELECT
           first_name,
           middle_name,
           last_name,
           course,
           "StudentId"
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

        logger.scan(
    `FAILED | ${displayID} | STUDENT NOT FOUND`
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

          logger.scan(
  `BLOCKED | ${displayID} | COOLDOWN VIOLATION`
);

          return res.status(429).json({ status: "blocked" });
        }
      }

      logger.scan(
  `STUDENT FOUND | ${displayID} | ${user.first_name} ${user.last_name}`
);

      const nowPH = new Date();
      const hour = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        hour: "numeric",
        hour12: false,
      }).format(nowPH);

      const hourNum = Number(hour);
      logger.attendance(
  `CURRENT HOUR | ${hourNum}`
);

      if (true) {
        try {
          await pool.query(
            `INSERT INTO attendance (student_id, check_in)
             VALUES ($1, $2)`,
            [displayID, nowPH]
          );

          attendanceSaved = true;
          finalStatus = "success";
          
          logger.attendance(
  `CHECK-IN SAVED | ${displayID}`
);
        } catch (err: any) {
          if (err.code === "23505") {
            attendanceSaved = true;
            finalStatus = "success";

            logger.attendance(
  `CHECK-IN SAVED | ${displayID}`
);
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

      const socketId = userSockets.get(displayID);

logger.socket(
  `LOOKING FOR SOCKET | ${displayID}`
);
logger.socket(
  `FOUND SOCKET | ${socketId}`
);

if (socketId) {
  logger.socket(
  `EMIT scan-success | ${socketId}`
);

  io.to(socketId).emit("scan-success", {
    student_id: displayID,
    status: finalStatus,
    time: new Date().toLocaleTimeString(),
  });
}

      return res.json({
        status: finalStatus,
        student_id: displayID,
        name: `${user.first_name} ${user.last_name}`,
        course: user.course || "N/A",
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
      });

    } catch (err) {
      logger.error(
  `[SCAN] ${String(err)}`);
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
    logger.attendance(
  `SHARE TOKEN RECEIVED | ${token}`
);
    const result = await pool.query(
      "SELECT student_id FROM share_tokens WHERE token = $1",
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invalid token" });
    }
    const studentId = result.rows[0].student_id;
    logger.attendance(
  `FOUND STUDENT | ${studentId}`
);
    const attendance = await pool.query(
      "SELECT * FROM attendance WHERE student_id = $1 ORDER BY check_in ASC",
      [studentId]
    );
    logger.attendance(
  `ATTENDANCE RECORDS | ${attendance.rows.length}`
);
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
      logger.error(
  `[ATTENDANCE] CREATE ERROR | ${String(err)}`
);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/attendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(`DELETE FROM attendance WHERE id = $1`, [id]);
      res.json({ success: true });
    } catch (err) {
      logger.error(
  `[ATTENDANCE] DELETE ERROR | ${String(err)}`
);
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
// 📊 PROMETHEUS METRICS
// ==========================
app.get('/metrics', async (_req, res) => {

  res.set(
    'Content-Type',
    client.register.contentType
  );

  res.end(
    await client.register.metrics()
  );
});

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
      hls_url_via_node: `${process.env.PUBLIC_URL}/hls/stream.m3u8`,
hls_url_direct_python: `${process.env.PUBLIC_URL}:5000/hls/stream.m3u8`,
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
       const forwarded =
    req.headers["x-forwarded-for"];

  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : req.socket.remoteAddress || "unknown";

  const userAgent =
    req.headers["user-agent"] || "unknown";

  return {
    authUser: user,
    ip,
    userAgent,
  };
}
  })
);

  // ==========================
  // ▶ START SERVER (listen on all interfaces)
  // ==========================
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT, host: '0.0.0.0' }, resolve)
  );

  startHlsStream();
const BASE_URL = process.env.PUBLIC_URL!;
logger.server("============================================================");
logger.server("🚀 Node.js Backend Running");
logger.server("============================================================");
logger.server(`📡 Server IP: ${LOCAL_IP}`);
logger.server(`🔌 Port: ${PORT}`);
logger.server(`🔗 GraphQL: ${BASE_URL}/graphql`);
logger.server(`📸 Scan API: ${BASE_URL}/api/scan`);
logger.server(`📺 HLS Stream: ${BASE_URL}/hls/stream.m3u8`);
logger.server(`❤️ Health: ${BASE_URL}/health`);
logger.server("============================================================");
logger.server("⚠️ IMPORTANT");
logger.server("Python Flask (port 5000) MUST be running for HLS stream");
logger.server("Run: cd ai-service && python flask_stream.py");
logger.server("============================================================");
logger.server("📱 For Mobile App");
logger.server(`Stream URL: http://${LOCAL_IP}:5000/hls/stream.m3u8`);
logger.server(`API Base: http://${LOCAL_IP}:4000`);
logger.server("============================================================");
}

// ==========================
// 🧹 CLEANUP TEMP SIGNUPS
// ==========================
setInterval(async () => {

  try {

    logger.server(
  "Cleaning expired signup temp files..."
);

    const expired =
  await pool.query(
    `
    SELECT
      school_id_image
    FROM signup_pending
    WHERE created_at <
    NOW() - INTERVAL '24 hours'
    `
  );

    for (const row of expired.rows) {

      try {

        const imageUrl =
          row.school_id_image;

        if (!imageUrl) continue;

        const imageName =
          path.basename(imageUrl);

        const filePath =
          path.join(
            UPLOADS_DIR,
            "temporary school-ids",
            imageName
          );

        if (
          fs.existsSync(filePath)
        ) {

          fs.unlinkSync(filePath);

          logger.upload(
  `Deleted temp file | ${imageName}`
);
        }

      } catch (err) {

        logger.error(
  `[CLEANUP] TEMP FILE DELETE ERROR | ${String(err)}`
);
      }
    }

    // ==========================
    // DELETE EXPIRED ROWS
    // ==========================
    await pool.query(
  `
  DELETE FROM signup_pending
  WHERE created_at <
  NOW() - INTERVAL '24 hours'
  `
);

  } catch (err) {

    logger.error(
  `[CLEANUP] ${String(err)}`
);
  }

},
// DEVELOPMENT
5 * 60 * 1000
);

// ==========================
// ▶ RUN
// ==========================
startServer().catch(err => {
  logger.error(
    `[SERVER] STARTUP ERROR | ${String(err)}`
  );
});