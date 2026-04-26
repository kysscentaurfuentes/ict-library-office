"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const resolvers_js_1 = require("./resolvers.js");
const schema_js_1 = require("./schema.js");
const db_js_1 = require("./db.js");
const shareRoutes_js_1 = __importDefault(require("./routes/shareRoutes.js"));
const helmet_1 = __importDefault(require("helmet"));
const os_1 = __importDefault(require("os"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 30,
});
app.use(limiter);
const LOG = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    blue: "\x1b[34m",
};
const PORT = Number(process.env.PORT || 4000);
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
const SECRET = process.env.JWT_SECRET;
function getLocalIP() {
    const interfaces = os_1.default.networkInterfaces();
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
const normalizeID = (id) => id.replace(/-/g, "");
const formatID = (id) => {
    const clean = normalizeID(id);
    if (clean.length === 8) {
        return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    }
    return id;
};
const ROOT_DIR = path_1.default.resolve(__dirname, "..");
const HLS_DIR = path_1.default.join(ROOT_DIR, "public", "hls");
const deviceCooldown = {};
const ONE_HOUR = 60 * 60 * 1000;
if (!fs_1.default.existsSync(HLS_DIR)) {
    fs_1.default.mkdirSync(HLS_DIR, { recursive: true });
    console.log(`${LOG.cyan}📁 Created HLS directory: ${HLS_DIR}${LOG.reset}`);
}
async function getUser(token) {
    try {
        if (!token)
            return null;
        return jsonwebtoken_1.default.verify(token.replace("Bearer ", ""), SECRET);
    }
    catch {
        return null;
    }
}
async function startServer() {
    const httpServer = http_1.default.createServer(app);
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use("/api", shareRoutes_js_1.default);
    app.use("/api/scan", (0, express_rate_limit_1.default)({
        windowMs: 60 * 1000,
        max: 10,
    }));
    app.post("/api/scan", async (req, res) => {
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
            const result = await db_js_1.pool.query(`SELECT username, "StudentId" 
         FROM users 
         WHERE "StudentId" = $1`, [displayID]);
            if (result.rows.length === 0) {
                await db_js_1.pool.query(`INSERT INTO scan_logs (student_id, device_id, status, flag, risk_score)
           VALUES ($1, $2, $3, $4, $5)`, [displayID, deviceID, "fail", "not_found", 0]);
                return res.status(404).json({
                    status: "fail",
                    student_id: displayID,
                    message: "Student not found",
                });
            }
            const user = result.rows[0];
            let flags = [];
            let riskScore = 0;
            const devicesResult = await db_js_1.pool.query(`SELECT DISTINCT device_id 
         FROM scan_logs 
         WHERE student_id = $1`, [displayID]);
            const knownDevices = devicesResult.rows.map(r => r.device_id);
            if (knownDevices.length > 0 && !knownDevices.includes(deviceID)) {
                flags.push("new_device");
                riskScore += 1;
            }
            const otherUsersOnDevice = await db_js_1.pool.query(`SELECT DISTINCT student_id 
         FROM scan_logs 
         WHERE device_id = $1 AND student_id != $2`, [deviceID, displayID]);
            if (otherUsersOnDevice.rows.length > 0) {
                flags.push("multi_account_device");
                riskScore += 1;
            }
            if (riskScore >= 2) {
                flags.push("high_risk");
            }
            const lastScan = await db_js_1.pool.query(`SELECT created_at 
         FROM scan_logs
         WHERE student_id = $1
         ORDER BY created_at DESC
         LIMIT 1`, [displayID]);
            if (lastScan.rows.length > 0) {
                const lastTime = new Date(lastScan.rows[0].created_at).getTime();
                const diffMinutes = (now - lastTime) / (1000 * 60);
                if (diffMinutes < 60) {
                    await db_js_1.pool.query(`INSERT INTO scan_logs (student_id, device_id, status, flag, risk_score)
             VALUES ($1, $2, $3, $4, $5)`, [displayID, deviceID, "blocked", "cooldown_violation", riskScore]);
                    return res.status(429).json({ status: "blocked" });
                }
            }
            console.log(`${LOG.green}[${time}] SUCCESS:${LOG.reset} ${displayID} - ${user.username}`);
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
                    await db_js_1.pool.query(`INSERT INTO attendance (student_id, check_in)
             VALUES ($1, $2)`, [displayID, nowPH]);
                    attendanceSaved = true;
                    finalStatus = "success";
                }
                catch (err) {
                    if (err.code === "23505") {
                        attendanceSaved = true;
                        finalStatus = "success";
                    }
                    else {
                        throw err;
                    }
                }
            }
            else {
                finalStatus = "closed";
            }
            await db_js_1.pool.query(`INSERT INTO scan_logs (student_id, device_id, status, flag, risk_score) 
         VALUES ($1, $2, $3, $4, $5)`, [
                displayID,
                deviceID,
                finalStatus,
                flags.length ? flags.join(",") : null,
                riskScore
            ]);
            return res.json({
                status: finalStatus,
                student_id: displayID,
                name: user.username,
                course: user.course || "N/A",
                time: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString(),
            });
        }
        catch (err) {
            console.log(`${LOG.red}ERROR:${LOG.reset}`, err);
            return res.status(500).json({
                status: "fail",
                message: "Server error",
            });
        }
    });
    app.get("/api/attendance/me", async (req, res) => {
        try {
            const studentId = String(req.headers["x-student-id"] || "");
            if (!studentId) {
                return res.status(400).json({ message: "Missing student ID" });
            }
            const result = await db_js_1.pool.query(`SELECT * FROM attendance WHERE student_id = $1 ORDER BY check_in ASC`, [studentId]);
            res.json(result.rows);
        }
        catch {
            res.status(500).json({ message: "Server error" });
        }
    });
    app.get("/api/attendance/:studentId", async (req, res) => {
        const { studentId } = req.params;
        const result = await db_js_1.pool.query(`SELECT * FROM attendance WHERE student_id = $1 ORDER BY check_in ASC`, [studentId]);
        res.json(result.rows);
    });
    app.get("/api/share/:token", async (req, res) => {
        const { token } = req.params;
        console.log("TOKEN:", token);
        const result = await db_js_1.pool.query("SELECT student_id FROM share_tokens WHERE token = $1", [token]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Invalid token" });
        }
        const studentId = result.rows[0].student_id;
        console.log("FOUND STUDENT:", studentId);
        const attendance = await db_js_1.pool.query("SELECT * FROM attendance WHERE student_id = $1 ORDER BY check_in ASC", [studentId]);
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
            const result = await db_js_1.pool.query(`INSERT INTO attendance (student_id, check_in) VALUES ($1, $2) RETURNING *`, [studentId, now]);
            res.json(result.rows[0]);
        }
        catch (err) {
            console.error("CREATE ATTENDANCE ERROR:", err);
            res.status(500).json({ message: "Server error" });
        }
    });
    app.delete("/api/attendance/:id", async (req, res) => {
        try {
            const { id } = req.params;
            await db_js_1.pool.query(`DELETE FROM attendance WHERE id = $1`, [id]);
            res.json({ success: true });
        }
        catch (err) {
            console.error("DELETE ERROR:", err);
            res.status(500).json({ message: "Server error" });
        }
    });
    app.use("/hls", express_1.default.static(HLS_DIR, {
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
    app.get("/health", (_, res) => {
        const hlsExists = fs_1.default.existsSync(path_1.default.join(HLS_DIR, "stream.m3u8"));
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
    app.get("/api/stream-status", async (_, res) => {
        const hlsPath = path_1.default.join(HLS_DIR, "stream.m3u8");
        const exists = fs_1.default.existsSync(hlsPath);
        const stats = exists ? fs_1.default.statSync(hlsPath) : null;
        res.json({
            python_stream_active: exists,
            last_updated: stats ? stats.mtime : null,
            node_server: process.env.PUBLIC_URL,
            python_server: `${process.env.PUBLIC_URL}:5000`,
            hls_url_via_node: `process.env.PUBLIC_URL/hls/stream.m3u8`,
            hls_url_direct_python: `process.env.PUBLIC_URL:5000/hls/stream.m3u8`
        });
    });
    const apollo = new server_1.ApolloServer({
        typeDefs: schema_js_1.typeDefs,
        resolvers: resolvers_js_1.resolvers,
        introspection: process.env.NODE_ENV !== "production",
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    });
    await apollo.start();
    app.use("/graphql", express_1.default.json(), (0, express4_1.expressMiddleware)(apollo, {
        context: async ({ req }) => {
            const user = await getUser(req.headers.authorization);
            return { authUser: user };
        },
    }));
    await new Promise((resolve) => httpServer.listen({ port: PORT, host: '0.0.0.0' }, resolve));
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
startServer().catch(console.error);
//# sourceMappingURL=server.js.map