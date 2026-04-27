"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("./db.js");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const router_js_1 = require("./router.js");
dotenv_1.default.config();
const SECRET = process.env.JWT_SECRET;
function assertUser(user) {
    if (!user)
        throw new Error('User not found');
}
function requireAuth(context) {
    if (!context.authUser)
        throw new Error('Not authenticated');
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
const lastSeenMap = {};
async function getBlockedMacs() {
    try {
        const result = await (0, router_js_1.execRouterCommand)("ipset list GL_MAC_BLOCK");
        const macs = result
            .split('\n')
            .filter(line => line.match(/([0-9a-f]{2}:){5}[0-9a-f]{2}/i))
            .map(line => line.trim().toLowerCase());
        return new Set(macs);
    }
    catch {
        return new Set();
    }
}
async function getVendor(mac) {
    try {
        const res = await fetch(`https://api.macvendors.com/${mac}`);
        if (!res.ok)
            return null;
        return await res.text();
    }
    catch {
        return null;
    }
}
exports.resolvers = {
    Query: {
        hello: () => "Backend is working with Router 🚀",
        me: async (_, __, context) => {
            const auth = requireAuth(context);
            const res = await db_js_1.pool.query('SELECT id, username, "StudentId", role FROM users WHERE id = $1', [auth.userId]);
            const user = res.rows[0];
            assertUser(user);
            return user;
        },
        routerDevices: async () => {
            try {
                const [arpResult, dhcpResult] = await Promise.all([
                    (0, router_js_1.execRouterCommand)("cat /proc/net/arp"),
                    (0, router_js_1.execRouterCommand)("cat /tmp/dhcp.leases"),
                ]);
                await (0, router_js_1.execRouterCommand)("for ip in $(cat /proc/net/arp | awk 'NR>1 {print $1}'); do ping -c 1 -W 1 $ip >/dev/null 2>&1; done");
                const neighResult = await (0, router_js_1.execRouterCommand)("ip neigh");
                const blockedSet = await getBlockedMacs();
                const dhcpMap = {};
                dhcpResult.split('\n').forEach(line => {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 4) {
                        const mac = normalizeMac(parts[1] ?? "");
                        const hostname = parts[3];
                        if (mac && hostname && hostname !== "*") {
                            dhcpMap[mac] = hostname;
                        }
                    }
                });
                const rawDevices = arpResult
                    .split('\n')
                    .slice(1)
                    .map(line => line.trim().split(/\s+/))
                    .filter(parts => parts.length >= 4)
                    .map(parts => ({
                    ip: parts[0],
                    mac: normalizeMac(parts[3] ?? "")
                }))
                    .filter(d => d.ip && d.mac && d.mac !== "00:00:00:00:00:00");
                const devices = await Promise.all(rawDevices.map(async (device) => {
                    const dbRes = await db_js_1.pool.query("SELECT custom_name FROM devices WHERE device_id = $1", [device.mac]);
                    let name = dbRes.rows[0]?.custom_name ?? null;
                    if (!name)
                        name = dhcpMap[device.mac] ?? null;
                    if (!name) {
                        const vendor = await getVendor(device.mac);
                        if (vendor)
                            name = vendor;
                    }
                    if (!name)
                        name = `Unknown (${device.ip})`;
                    const now = Date.now();
                    let detectedNow = neighResult.includes(device.mac) &&
                        !neighResult.includes(`${device.mac} FAILED`);
                    if (!detectedNow) {
                        const ping = await (0, router_js_1.execRouterCommand)(`ping -c 1 -W 1 ${device.ip}`);
                        if (!ping.includes("100% packet loss")) {
                            detectedNow = true;
                        }
                    }
                    if (detectedNow) {
                        lastSeenMap[device.mac] = now;
                    }
                    const OFFLINE_THRESHOLD = 1000;
                    const lastSeenTs = lastSeenMap[device.mac] || 0;
                    const recentlySeen = now - lastSeenTs < OFFLINE_THRESHOLD;
                    const isAlive = recentlySeen;
                    const lastSeen = isAlive
                        ? null
                        : new Date(lastSeenTs).toISOString();
                    const blocked = blockedSet.has(device.mac);
                    return {
                        ip: device.ip,
                        mac: device.mac,
                        name,
                        isAlive,
                        lastSeen,
                        isBlocked: blocked,
                    };
                }));
                await Promise.allSettled(devices.map(d => db_js_1.pool.query(`
      INSERT INTO devices (device_id, custom_name)
      VALUES ($1, $2)
      ON CONFLICT (device_id)
      DO UPDATE SET
        custom_name = COALESCE(devices.custom_name, EXCLUDED.custom_name)
      `, [d.mac, d.name])));
                return devices;
            }
            catch (err) {
                console.error("❌ Router Error:", err);
                throw new Error("Failed to fetch router devices");
            }
        },
    },
    Mutation: {
        login: async (_, { username, password }) => {
            const res = await db_js_1.pool.query('SELECT * FROM users WHERE username = $1', [username]);
            const user = res.rows[0];
            assertUser(user);
            const isValid = await bcrypt_1.default.compare(password, user.password);
            if (!isValid)
                throw new Error('Invalid credentials');
            const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: '1d' });
            return { token, user: user };
        },
        signup: async (_, { username, password, StudentId }) => {
            const existing = await db_js_1.pool.query('SELECT * FROM users WHERE username = $1 OR "StudentId" = $2', [username, StudentId]);
            if (existing.rows.length > 0) {
                throw new Error('Already exists');
            }
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            const result = await db_js_1.pool.query('INSERT INTO users (username, password, "StudentId") VALUES ($1, $2, $3) RETURNING *', [username, hashedPassword, StudentId]);
            const user = result.rows[0];
            assertUser(user);
            const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: '1d' });
            return { token, user: user };
        },
        renameDevice: async (_, { mac, name }) => {
            const normalizedMac = normalizeMac(mac);
            await db_js_1.pool.query(`
    INSERT INTO devices (device_id, custom_name)
    VALUES ($1, $2)
    ON CONFLICT (device_id)
    DO UPDATE SET custom_name = EXCLUDED.custom_name
    `, [normalizedMac, name]);
            return { success: true };
        },
        blockDevice: async (_, { mac }, context) => {
            requireAdmin(context);
            const normalizedMac = normalizeMac(mac);
            await (0, router_js_1.execRouterCommand)(`ipset add GL_MAC_BLOCK ${normalizedMac} -exist`);
            return true;
        },
        unblockDevice: async (_, { mac }, context) => {
            requireAdmin(context);
            const normalizedMac = normalizeMac(mac);
            await (0, router_js_1.execRouterCommand)(`ipset del GL_MAC_BLOCK ${normalizedMac}`);
            return true;
        }
    },
};
//# sourceMappingURL=resolvers.js.map