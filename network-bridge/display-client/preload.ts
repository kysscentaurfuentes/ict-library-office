// display-client/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Define the shape ng scan result (pwede mo pa i-adjust depende sa server response mo)
type ScanResult = {
  success: boolean;
  message?: string;
  studentId?: string;
};

contextBridge.exposeInMainWorld("electronAPI", {
  // Send scan data to main process
  sendScanData: (data: string): void => {
    ipcRenderer.send("send-scan-data", data);
  },

  // Listen for scan result from main process
  onScanResult: (callback: (data: ScanResult) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, data: ScanResult) => {
      callback(data);
    };

    ipcRenderer.on("scan-result", listener);

    // Cleanup function (important para iwas memory leak)
    return () => {
      ipcRenderer.removeListener("scan-result", listener);
    };
  },
});