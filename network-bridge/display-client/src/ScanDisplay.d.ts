import React from "react";
declare global {
    interface Window {
        electronAPI?: {
            sendScanData: (data: string) => void;
            onScanResult: (callback: (data: ScanData) => void) => () => void;
        };
    }
}
interface ScanData {
    status: "success" | "fail";
    student_id: string;
    name?: string;
    course?: string;
    time?: string;
    date?: string;
    message?: string;
}
declare const ScanDisplay: React.FC;
export default ScanDisplay;
