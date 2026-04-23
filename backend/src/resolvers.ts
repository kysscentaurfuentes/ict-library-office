// backend/src/resolvers.ts

import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { execRouterCommand } from './router.js';

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

function normalizeMac(mac: string) {
  return mac.toLowerCase().replace(/-/g, ':');
}
const lastSeenMap: Record<string, number> = {};

// 🔥 FAST: get ALL blocked MACs once
async function getBlockedMacs(): Promise<Set<string>> {
  try {
    const result = await execRouterCommand("ipset list GL_MAC_BLOCK");

    const macs = result
      .split('\n')
      .filter(line => line.match(/([0-9a-f]{2}:){5}[0-9a-f]{2}/i))
      .map(line => line.trim().toLowerCase());

    return new Set(macs);
  } catch {
    return new Set();
  }
}

// ✅ Vendor lookup
async function getVendor(mac: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.macvendors.com/${mac}`);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
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

    routerDevices: async () => {
  try {
    // 🔥 1. GET BASE DATA (parallel)
    const [arpResult, dhcpResult] = await Promise.all([
      execRouterCommand("cat /proc/net/arp"),
      execRouterCommand("cat /tmp/dhcp.leases"),
    ]);

    // 🔥 2. CLEAR OLD NEIGHBOR CACHE
    await execRouterCommand(
  "for ip in $(cat /proc/net/arp | awk 'NR>1 {print $1}'); do ping -c 1 -W 1 $ip >/dev/null 2>&1; done"
);

    // 🔥 3. READ FRESH NEIGHBOR STATE
    const neighResult = await execRouterCommand("ip neigh");

    // 🔥 4. GET BLOCKED ONCE
    const blockedSet = await getBlockedMacs();

    // 🔥 5. BUILD DHCP MAP
    const dhcpMap: Record<string, string> = {};
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

    // 🔥 7. PARSE ARP DEVICES
    const rawDevices = arpResult
      .split('\n')
      .slice(1)
      .map(line => line.trim().split(/\s+/))
      .filter(parts => parts.length >= 4)
      .map(parts => ({
        ip: parts[0] as string,
        mac: normalizeMac(parts[3] ?? "")
      }))
      .filter(d => d.ip && d.mac && d.mac !== "00:00:00:00:00:00");

    // 🔥 8. PROCESS DEVICES (NO SSH INSIDE LOOP 🚀)
    const devices = await Promise.all(
      rawDevices.map(async (device) => {

        // ✅ NAME: DB → DHCP → Vendor → fallback
        const dbRes = await pool.query(
  "SELECT custom_name FROM devices WHERE device_id = $1",
  [device.mac]
);

        let name = dbRes.rows[0]?.custom_name ?? null;

        if (!name) name = dhcpMap[device.mac] ?? null;

        if (!name) {
          const vendor = await getVendor(device.mac);
          if (vendor) name = vendor;
        }

        if (!name) name = `Unknown (${device.ip})`;

        // 🔥 FAST ONLINE CHECK (NO EXTRA SSH)
        const now = Date.now();

// detect via neigh (fast online trigger)
let detectedNow =
  neighResult.includes(device.mac) &&
  !neighResult.includes(`${device.mac} FAILED`);

// 🔥 IF NOT SURE → DO 1 FAST PING (ONLY WHEN NEEDED)
if (!detectedNow) {
  const ping = await execRouterCommand(`ping -c 1 -W 1 ${device.ip}`);
  if (!ping.includes("100% packet loss")) {
    detectedNow = true;
  }
}

// update last seen
if (detectedNow) {
  lastSeenMap[device.mac] = now;
}

// 🔥 CONFIG (tune this!)
const OFFLINE_THRESHOLD = 1000; // 1 second

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
      })
    );

// 🔥 9. SAVE (AUTO DETECT)
await Promise.allSettled(
  devices.map(d =>
    pool.query(
      `
      INSERT INTO devices (device_id, custom_name)
      VALUES ($1, $2)
      ON CONFLICT (device_id)
      DO UPDATE SET
        custom_name = COALESCE(devices.custom_name, EXCLUDED.custom_name)
      `,
      [d.mac, d.name]
    )
  )
);

    return devices;

  } catch (err) {
    console.error("❌ Router Error:", err);
    throw new Error("Failed to fetch router devices");
  }
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

      return { token, user: user! };
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

      return { token, user: user! };
    },

    renameDevice: async (_: any, { mac, name }: any) => {
  const normalizedMac = normalizeMac(mac);

  await pool.query(
    `
    INSERT INTO devices (device_id, custom_name)
    VALUES ($1, $2)
    ON CONFLICT (device_id)
    DO UPDATE SET custom_name = EXCLUDED.custom_name
    `,
    [normalizedMac, name]
  );

  return { success: true };
},

    blockDevice: async (_: any, { mac }: { mac: string }) => {
      const normalizedMac = normalizeMac(mac);
      await execRouterCommand(`ipset add GL_MAC_BLOCK ${normalizedMac} -exist`);
      return true;
    },

    unblockDevice: async (_: any, { mac }: { mac: string }) => {
      const normalizedMac = normalizeMac(mac);
      await execRouterCommand(`ipset del GL_MAC_BLOCK ${normalizedMac}`);
      return true;
    }
  },
};