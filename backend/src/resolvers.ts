// backend/src/resolvers.ts

import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { execRouterCommand } from './router.js';
import ping from 'ping';

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

// ✅ REAL vendor lookup (API, no lib issues)
async function getVendor(mac: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.macvendors.com/${mac}`);
    if (!res.ok) return null;
    const text = await res.text();
    return text || null;
  } catch {
    return null;
  }
}

export const resolvers = {
  Query: {
    hello: () => "Backend is working with Router + Ping 🚀",

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
        const arpResult = await execRouterCommand("cat /proc/net/arp");
        const dhcpResult = await execRouterCommand("cat /tmp/dhcp.leases");

        // 🔥 DHCP → hostname map
        const dhcpMap: Record<string, string> = {};

        dhcpResult.split('\n').forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 4) {
            const mac = normalizeMac(parts[1] || "");
            const hostname = parts[3];

            if (mac && hostname && hostname !== "*") {
              dhcpMap[mac] = hostname;
            }
          }
        });

        // 🔥 ARP → all devices
        const rawDevices = arpResult
          .split('\n')
          .slice(1)
          .map(line => line.trim().split(/\s+/))
          .filter(parts => parts.length >= 4)
          .map(parts => ({
            ip: parts[0] || "",
            mac: normalizeMac(parts[3] || "")
          }))
          .filter(d => d.ip && d.mac && d.mac !== "00:00:00:00:00:00");

        const devices = await Promise.all(
  rawDevices.map(async (device) => {
    // 🔥 1. DB override (manual rename)
    const dbRes = await pool.query(
      "SELECT custom_name FROM devices WHERE mac_address = $1",
      [device.mac]
    );

    let name = dbRes.rows[0]?.custom_name || null;

    // 🔥 2. DHCP hostname
    if (!name) {
      name = dhcpMap[device.mac] || null;
    }

    // 🔥 3. Vendor fallback
    let vendor: string | null = null;
    if (!name) {
      vendor = await getVendor(device.mac);
      if (vendor) name = vendor;
    }

    // 🔥 4. Final fallback
    if (!name) {
      name = `Unknown (${device.ip})`;
    }

    // 🔥 Ping status
    let isAlive = false;
    let lastSeen: string | null = null;

    try {
      const res = await ping.promise.probe(device.ip, { timeout: 2 });
      isAlive = res.alive;
      lastSeen = res.alive ? null : new Date().toISOString();
    } catch {
      isAlive = false;
      lastSeen = new Date().toISOString();
    }

    return {
      ip: device.ip,
      mac: device.mac,
      name,
      isAlive,
      lastSeen,
    };
  })
);

// ✅ AUTO SAVE TO DATABASE (ADD THIS PART)
await Promise.all(
  devices.map(async (d) => {
    try {
      await pool.query(
        `
        INSERT INTO devices (mac_address, custom_name)
        VALUES ($1, $2)
        ON CONFLICT (mac_address)
        DO UPDATE SET
          custom_name = COALESCE(devices.custom_name, EXCLUDED.custom_name)
        `,
        [d.mac, d.name]
      );
    } catch (err) {
      console.error('DB SAVE ERROR:', err);
    }
  })
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

    // 🔥 MANUAL RENAME (DB)
    renameDevice: async (_: any, { mac, name }: any) => {
      const normalizedMac = normalizeMac(mac);

      await pool.query(
        `
        INSERT INTO devices (mac_address, custom_name)
        VALUES ($1, $2)
        ON CONFLICT (mac_address)
        DO UPDATE SET custom_name = EXCLUDED.custom_name
        `,
        [normalizedMac, name]
      );

      return { success: true };
    },
  },
};