// backend/src/agent.ts
import { execRouterCommand } from './router.js';
import { pool } from './db.js';

function normalizeMac(mac: string) {
  return mac.toLowerCase().replace(/-/g, ':');
}

function isValidMac(mac: string) {
  return /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(mac);
}

const lastSeenMap: Record<string, number> = {};
const vendorCache: Record<string, string> = {};

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

async function scanDevices() {
  try {
    console.log("🔄 Scanning router...");

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

    // 🔥 6. PARSE ARP DEVICES
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

    // 🔥 7. PROCESS DEVICES (NO SSH INSIDE LOOP 🚀)
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
          if (!vendorCache[device.mac]) {
            vendorCache[device.mac] = await getVendor(device.mac) ?? "Unknown";
          }
          name = vendorCache[device.mac];
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
        const OFFLINE_THRESHOLD = 5000 + Math.random() * 5000;

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

    // 🔥 8. SAVE TO DATABASE (with all fields)
    await Promise.allSettled(
      devices.map(d =>
        pool.query(
          `
          INSERT INTO devices (device_id, custom_name, last_seen, is_alive, is_blocked)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (device_id)
          DO UPDATE SET
            custom_name = COALESCE(devices.custom_name, EXCLUDED.custom_name),
            last_seen = EXCLUDED.last_seen,
            is_alive = EXCLUDED.is_alive,
            is_blocked = EXCLUDED.is_blocked
          `,
          [d.mac, d.name, d.lastSeen, d.isAlive, d.isBlocked]
        )
      )
    );

    // 🔥 9. SYNC BLOCKED STATUS FROM DB TO ROUTER (kung may nagbago)
    const dbBlockedResult = await pool.query(
      `SELECT device_id FROM devices WHERE is_blocked = true`
    );
    
    for (const dbDevice of dbBlockedResult.rows) {
      if (!blockedSet.has(dbDevice.device_id)) {
        // DB says blocked but router doesn't - sync to router
        try {
          await execRouterCommand(`ipset add GL_MAC_BLOCK ${dbDevice.device_id} -exist`);
          console.log(`✅ Synced block: ${dbDevice.device_id}`);
        } catch (err) {
          console.error(`❌ Failed to sync block for ${dbDevice.device_id}:`, err);
        }
      }
    }

    // Also check for devices that should be unblocked
    for (const routerMac of blockedSet) {
      const dbCheck = await pool.query(
        `SELECT is_blocked FROM devices WHERE device_id = $1`,
        [routerMac]
      );
      
      if (dbCheck.rows.length === 0 || dbCheck.rows[0].is_blocked === false) {
        // Router says blocked but DB says not blocked - sync to router
        try {
          await execRouterCommand(`ipset del GL_MAC_BLOCK ${routerMac}`);
          console.log(`✅ Synced unblock: ${routerMac}`);
        } catch (err) {
          console.error(`❌ Failed to sync unblock for ${routerMac}:`, err);
        }
      }
    }

    console.log(`✅ Scan complete - Found ${devices.length} devices`);

  } catch (err) {
    console.error("❌ Agent error:", err);
  }
}

async function processCommands() {
  try {
    const res = await pool.query(
      `SELECT * FROM commands WHERE processed = false ORDER BY created_at ASC`
    );

    for (const cmd of res.rows) {
      const mac = cmd.mac;

      if (!isValidMac(mac)) continue;

      try {
        if (cmd.type === "block") {
          await execRouterCommand(`ipset add GL_MAC_BLOCK ${mac} -exist`);
          console.log(`🚫 Blocked ${mac}`);
        }

        if (cmd.type === "unblock") {
          await execRouterCommand(`ipset del GL_MAC_BLOCK ${mac}`);
          console.log(`✅ Unblocked ${mac}`);
        }

        await pool.query(
          `UPDATE commands SET processed = true WHERE id = $1`,
          [cmd.id]
        );

      } catch (err) {
        console.error(`❌ Failed command for ${mac}:`, err);
      }
    }
  } catch (err) {
    console.error("❌ Command processor error:", err);
  }
}

// 🔁 loop every 5 seconds
setInterval(scanDevices, 5000);

setInterval(processCommands, 2000);

// run immediately
scanDevices();
processCommands();