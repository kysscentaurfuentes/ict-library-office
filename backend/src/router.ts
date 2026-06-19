// backend/src/router.ts
import { Client } from 'ssh2';
import { logger } from '../src/utils/logger.js'

const ROUTER_CONFIG = {
  host: process.env.ROUTER_HOST as string,
  username: process.env.ROUTER_USER as string,
  password: process.env.ROUTER_PASS as string,
  readyTimeout: 10000,
};

// 🔕 toggle mo lang to if gusto mo logs
const DEBUG_SSH = false;

export function execRouterCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    let output = '';
    let errorOutput = '';

    conn
      .on('ready', () => {
        if (DEBUG_SSH) {
          logger.network(
  "[SSH] Connected to router"
);
        }

        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          stream
            .on('data', (data: Buffer) => {
              output += data.toString();
            })
            .stderr.on('data', (data: Buffer) => {
              errorOutput += data.toString();
            });

          stream.on('close', (code: number) => {
            conn.end();

            if (code !== 0 && errorOutput) {
              return reject(new Error(`[SSH ERROR] ${errorOutput}`));
            }

            resolve(output.trim());
          });
        });
      })
      .on('error', (err) => {
        if (DEBUG_SSH) {
          logger.error(
  `[SSH] ${err.message}`
);
        }
        reject(err);
      })
      .on('timeout', () => {
        if (DEBUG_SSH) {
          logger.error(
  "[SSH] Connection timeout"
);
        }
        conn.end();
        reject(new Error('SSH connection timeout'));
      })
      .connect(ROUTER_CONFIG);
  });
}