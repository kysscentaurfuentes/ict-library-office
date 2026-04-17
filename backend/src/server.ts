// backend/src/server.ts
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import type { Request } from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

import { resolvers } from './resolvers.js';
import { typeDefs } from './schema.js'; // ✅ SINGLE SOURCE

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ ENV
const SECRET = process.env.JWT_SECRET as string;
const PORT = process.env.PORT || 4000;
const FFMPEG_PATH = process.env.FFMPEG_PATH as string;
const RTSP_URL = process.env.RTSP_URL as string;

// ✅ PATHS
const HLS_DIR = path.join(__dirname, '..', 'public', 'hls');
const HLS_OUTPUT = path.join(HLS_DIR, 'stream.m3u8');

let ffmpegProcess: any = null;

// ✅ Ensure folder exists
if (!fs.existsSync(HLS_DIR)) {
  fs.mkdirSync(HLS_DIR, { recursive: true });
}

// ✅ CLEANUP
const cleanHLSSegments = () => {
  console.log('🧹 Cleaning HLS...');

  if (!fs.existsSync(HLS_DIR)) return;

  const files = fs.readdirSync(HLS_DIR);

  for (const file of files) {
    if (file.endsWith('.ts') || file.endsWith('.m3u8')) {
      try {
        fs.unlinkSync(path.join(HLS_DIR, file));
      } catch {
        console.log('⚠️ Failed to delete:', file);
      }
    }
  }

  console.log('✅ HLS cleaned');
};

// ✅ START FFMPEG
const startFFmpeg = () => {
  console.log('🎥 Starting FFmpeg...');

  ffmpegProcess = spawn(FFMPEG_PATH, [
    '-loglevel', 'error',
    '-rtsp_transport', 'tcp',
    '-fflags', 'nobuffer',
    '-flags', 'low_delay',
    '-i', RTSP_URL,

    '-c:v', 'copy',

    '-f', 'hls',
    '-hls_time', '1',
    '-hls_list_size', '2',
    '-hls_flags', 'delete_segments+append_list',
    '-hls_allow_cache', '0',

    HLS_OUTPUT
  ]);

  ffmpegProcess.stderr.on('data', (data: any) => {
    console.log(`FFmpeg: ${data}`);
  });

  ffmpegProcess.on('close', (code: number) => {
    console.log(`❌ FFmpeg exited (${code})`);
  });
};

// ✅ AUTH
async function getUserFromToken(token: string | undefined) {
  try {
    if (!token) return null;
    return jwt.verify(token.replace('Bearer ', ''), SECRET);
  } catch {
    return null;
  }
}

// ✅ SERVER START
async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs, // ✅ galing schema.ts
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // 🎥 Start stream
  startFFmpeg();

  // 📡 Serve HLS
  app.use('/hls', cors(), express.static(HLS_DIR));

  // 🔥 GraphQL
  app.use(
    '/graphql',
    cors({ origin: '*' }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }: { req: Request }) => {
        const user = await getUserFromToken(req.headers.authorization);
        return { authUser: user };
      },
    }),
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(`🚀 Server running at http://localhost:${PORT}`);
}

// ✅ CLEAN SHUTDOWN
const shutdown = async () => {
  console.log('\n🛑 Shutting down...');

  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGINT');
    await new Promise((res) => setTimeout(res, 1000));
  }

  cleanHLSSegments();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// 🚀 RUN
startServer();