import { Client } from 'ssh2';
const ROUTER_CONFIG = {
    host: process.env.ROUTER_HOST,
    username: process.env.ROUTER_USER,
    password: process.env.ROUTER_PASS,
    readyTimeout: 10000,
};
const DEBUG_SSH = false;
export function execRouterCommand(command) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        let output = '';
        let errorOutput = '';
        conn
            .on('ready', () => {
            if (DEBUG_SSH) {
                console.log('[SSH] Connected to router');
            }
            conn.exec(command, (err, stream) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }
                stream
                    .on('data', (data) => {
                    output += data.toString();
                })
                    .stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                stream.on('close', (code) => {
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
                console.error('[SSH ERROR]', err.message);
            }
            reject(err);
        })
            .on('timeout', () => {
            if (DEBUG_SSH) {
                console.error('[SSH TIMEOUT]');
            }
            conn.end();
            reject(new Error('SSH connection timeout'));
        })
            .connect(ROUTER_CONFIG);
    });
}
//# sourceMappingURL=router.js.map