// backend/src/services/hls/ffmpeg.ts

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { logger } from "../../utils/logger.js";

function startSingleHlsStream(
  rtspUrl: string,
  outputFolder: string
) {

logger.streaming(
  `[${outputFolder.toUpperCase()}] Starting HLS from ${rtspUrl}`
);

  const ffmpegPath =
    process.env.FFMPEG_PATH ||
    "ffmpeg";

  const hlsDir = path.join(
    process.cwd(),
    "public",
    "hls",
    outputFolder
  );

  fs.mkdirSync(
    hlsDir,
    { recursive: true }
  );

  for (const file of fs.readdirSync(hlsDir)) {

  if (
    file.endsWith(".ts") ||
    file.endsWith(".m3u8")
  ) {

    fs.unlinkSync(
      path.join(hlsDir, file)
    );

  }

}

  const outputFile = path.join(
    hlsDir,
    "index.m3u8"
  );

  const startedAt = Date.now();

const waitTimer = setInterval(() => {

  const seconds = Math.floor(
    (Date.now() - startedAt) / 1000
  );

  logger.streaming(
  `[${outputFolder.toUpperCase()}] Waiting ${seconds}s for first HLS files...`
);

}, 5000);

const watchTimer = setInterval(() => {

  if (
    fs.existsSync(outputFile)
  ) {

    clearInterval(waitTimer);

    const seconds = Math.floor(
      (Date.now() - startedAt) / 1000
    );

    logger.streaming(
  `[${outputFolder.toUpperCase()}] HLS READY after ${seconds}s`
);
    clearInterval(watchTimer);

  }

}, 1000);

  const ffmpeg = spawn(
    ffmpegPath,
    [
      "-hide_banner",

      "-loglevel",
      "warning",

      "-rtsp_transport",
      "tcp",

      "-i",
      rtspUrl,

      "-an",

      "-vf",
      "scale=1280:720",

      "-c:v",
      "libx264",

      "-preset",
      "ultrafast",

      "-tune",
      "zerolatency",

      "-pix_fmt",
      "yuv420p",

      "-g",
      "15",

      "-keyint_min",
      "15",

      "-sc_threshold",
      "0",

      "-f",
      "hls",

      "-hls_time",
      "1",

      "-hls_list_size",
      "6",

      "-hls_flags",
      "delete_segments+append_list",

      "-hls_allow_cache",
      "0",

      "-start_number",
      "0",

      "-hls_segment_filename",

      path.join(
        hlsDir,
        "segment_%05d.ts"
      ),

      outputFile
    ],
    {
      windowsHide: true
    }
  );

  ffmpeg.stderr.on(
  "data",
  data => {

   const lines = data
  .toString()
  .split("\n")
  .map((line: string) => line.trim())
  .filter(Boolean);

for (const line of lines) {
  logger.streaming(
    `[${outputFolder.toUpperCase()}] ${line}`
  );
}

  }
);

ffmpeg.on(
  "close",
  code => {

    logger.streaming(
  `[${outputFolder.toUpperCase()}] FFmpeg exited: ${code}`
);

    setTimeout(() => {

      startSingleHlsStream(
        rtspUrl,
        outputFolder
      );

    }, 5000);

  }
);

ffmpeg.on(
  "error",
  err => {
    logger.error(
  `[STREAMING][${outputFolder.toUpperCase()}] FFmpeg error: ${err.message}`
);
  }
);
}

export function startHlsStream() {

  startSingleHlsStream(
    "rtsp://mediamtx:8554/admin",
    "admin"
  );

  startSingleHlsStream(
    "rtsp://mediamtx:8554/student",
    "student"
  );

}