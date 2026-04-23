// scanner-bridge/bridge.ts
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
interface ScanResult {
  status: "success" | "fail";
  student_id: string;
  name?: string;
  course?: string;
  time?: string;
  date?: string;
  message?: string;
}

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
const API_URL = process.env.API_URL || "http://192.168.8.236:4000/api/scan";

const DEVICE_FILE = path.join(process.cwd(), "device_id.txt");

let DEVICE_ID = "UNKNOWN_DEVICE";

if (fs.existsSync(DEVICE_FILE)) {
  DEVICE_ID = fs.readFileSync(DEVICE_FILE, "utf-8").trim();
} else {
  DEVICE_ID = randomUUID();
  fs.writeFileSync(DEVICE_FILE, DEVICE_ID);
}

const API_KEY = process.env.API_KEY || "";
const REQUEST_TIMEOUT = Number(process.env.REQUEST_TIMEOUT || 4000);

// ==========================
// 🧠 TYPE GUARD
// ==========================
function isScanResult(data: unknown): data is ScanResult {
  return (
    typeof data === "object" &&
    data !== null &&
    "status" in data &&
    "student_id" in data
  );
}

// ==========================
// 🧱 TIME
// ==========================
const nowTime = (): string => new Date().toLocaleString();

// ==========================
// 🧠 NORMALIZE ID (FOR DB)
// ==========================
const normalizeID = (id: string): string => {
  return id.replace(/-/g, "");
};

// ==========================
// 🎯 FORMAT ID (FOR DISPLAY)
// ==========================
const formatID = (id: string): string => {
  const clean = normalizeID(id);

  if (clean.length === 8) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }

  return id;
};

// ==========================
// 📡 FETCH
// ==========================
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
};

// ==========================
// 🚀 MAIN FUNCTION
// ==========================
export const handleBridgeScan = async (qrHash: string): Promise<ScanResult> => {
  const time = nowTime();

  const displayID = formatID(qrHash);

  // 🔥 kung DB mo ay may dash, ito gamitin mo:
  const sendID = formatID(qrHash);

  console.log(`${LOG.cyan}[${time}] SCAN:${LOG.reset} ${displayID}`);

  try {
    const res = await fetchWithTimeout(
      API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": DEVICE_ID,
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          student_id: sendID, // 🔥 ALWAYS CLEAN
        }),
      },
      REQUEST_TIMEOUT
    );

    // ==========================
    // ❌ SERVER ERROR
    // ==========================
    if (!res.ok) {
      const errorTime = nowTime();

      console.log(
        `${LOG.red}[${errorTime}] ERROR:${LOG.reset} ${res.status} | ${displayID}`
      );

      return {
        status: "fail",
        student_id: displayID,
        message: res.status === 404 ? "404 - Not Found" : "Server Error",
      };
    }

    // ==========================
    // 📦 PARSE
    // ==========================
    let data: unknown;

    try {
      data = await res.json();
    } catch {
      return {
        status: "success",
        student_id: displayID,
        name: "N/A",
        course: "N/A",
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        message: "Empty response",
      };
    }

    // ==========================
    // ✅ SUCCESS
    // ==========================
    if (isScanResult(data) && data.name) {
      const successTime = nowTime();

      console.log(
        `${LOG.green}[${successTime}] SUCCESS:${LOG.reset} ${displayID} - ${data.name}`
      );

      return {
        ...data,
        student_id: displayID, // 🔥 keep formatted
      };
    }

    // ==========================
    // ❌ NOT FOUND
    // ==========================
    const failTime = nowTime();

    console.log(
      `${LOG.red}[${failTime}] ERROR:${LOG.reset} NOT FOUND | ${displayID}`
    );

    return {
      status: "fail",
      student_id: displayID,
      message: "Student not found",
    };
  } catch (err: unknown) {
    const errorTime = nowTime();

    console.log(
      `${LOG.red}[${errorTime}] ERROR:${LOG.reset} NETWORK | ${displayID}`
    );

    return {
      status: "fail",
      student_id: displayID,
      message: "Request failed",
    };
  }
};
