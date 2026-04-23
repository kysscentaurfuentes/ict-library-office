// display-client/electron-main.ts
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { handleBridgeScan } from "../scanner-bridge/bridge.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "dist", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(process.cwd(), "dist", "index.html"));
  }
}

// Set up IPC listener to receive data from the renderer process
ipcMain.on("send-scan-data", async (event, data: string) => {
  console.log("Received scan data from frontend:", data);

  try {
    // Call the local backend logic (handleBridgeScan)
    const result = await handleBridgeScan(data);
    // Send the result back to the renderer process
    event.sender.send("scan-result", result);
  } catch (error) {
    console.error("Failed to process scan data:", error);
    // Send a generic error message back to the frontend
    event.sender.send("scan-result", {
      status: "fail",
      student_id: data,
      message: "An internal error occurred. Please check the logs.",
    });
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});