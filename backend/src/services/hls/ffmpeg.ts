// backend/src/services/hls/ffmpeg.ts

import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export function startHlsStream() {
  const ffmpegPath = process.env.FFMPEG_PATH;
  const rtspUrl = process.env.RTSP_URL;

  if (!ffmpegPath || !rtspUrl) {
    console.error("❌ Missing FFMPEG_PATH or RTSP_URL");
    return;
  }

  const hlsDir = path.join(process.cwd(), "public", "hls");

  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
  }

  // cleanup old files
  for (const file of fs.readdirSync(hlsDir)) {
    if (
      file.endsWith(".ts") ||
      file.endsWith(".m3u8")
    ) {
      fs.unlinkSync(path.join(hlsDir, file));
    }
  }

  const outputFile =
    path.join(hlsDir, "stream.m3u8");

  console.log("🎥 Starting FFmpeg HLS...");
  console.log("📺 RTSP:", rtspUrl);

  const ffmpeg = spawn(
    ffmpegPath,
    [
 "-hide_banner",
 "-loglevel",
 "error",

 "-rtsp_transport",
 "tcp",

 "-i",
 rtspUrl,

// ======================================
// DEVELOPMENT
// Rotated because camera is not mounted
// ======================================

 "-vf",
 "transpose=2,transpose=2",

 "-c:v",
 "libx264",

 "-preset",
 "fast",

 "-tune",
 "zerolatency",

// ======================================
// PRODUCTION
// Use when camera is ceiling mounted
// ======================================

// "-c:v",
// "copy",
//
// remove:
// "-vf",
// "transpose=2,transpose=2",

 "-g",
 "30",

 "-sc_threshold",
 "0",

 "-f",
 "hls",

 "-hls_time",
"1",

 "-hls_list_size",
 "3",

 "-hls_flags",
 "delete_segments+append_list",

 "-hls_segment_filename",
 path.join(
   hlsDir,
   "segment_%05d.ts"
 ),

 outputFile
],
    {
      windowsHide: true,
    }
  );

  ffmpeg.stdout.on("data", data => {
    console.log(data.toString());
  });

ffmpeg.stderr.on("data", data => {
  console.log(data.toString());
});

ffmpeg.on("close", code => {
  console.log(
    "FFmpeg exited:",
    code
  );

  console.log(
    "🔄 Restarting FFmpeg in 5 seconds..."
  );

  setTimeout(() => {
    startHlsStream();
  }, 5000);
});

ffmpeg.on("error", err => {
  console.error(
    "❌ FFmpeg process error:",
    err
  );
});
}