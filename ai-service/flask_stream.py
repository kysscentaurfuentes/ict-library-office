# ai-service/flask_stream.py - ROTATION FIXED (change only line 70-72)

from flask import Flask, Response, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import threading
import os
import time
import logging
from datetime import datetime
import pytz

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Disable Flask logs for cleaner output
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# ==========================
# 🔐 CONFIG
# ==========================
RTSP_URL = "rtsp://Khysss333:Deluxbaby123@192.168.8.156:554/stream1"
PH_TIMEZONE = pytz.timezone('Asia/Manila')

FFMPEG_PATH = r"C:\Users\ADMIN\Downloads\ffmpeg\ffmpeg\bin\ffmpeg.exe"

BACKEND_HLS_DIR = r"C:\Users\ADMIN\Desktop\ICT Library Office\backend\public\hls"
HLS_OUTPUT = os.path.join(BACKEND_HLS_DIR, "stream.m3u8")

os.makedirs(BACKEND_HLS_DIR, exist_ok=True)

# Clean old files on startup
for f in os.listdir(BACKEND_HLS_DIR):
    if f.endswith(".ts") or f.endswith(".m3u8"):
        try:
            os.remove(os.path.join(BACKEND_HLS_DIR, f))
        except:
            pass

# ==========================
# 🕒 TIME (for API only)
# ==========================
def get_ph_dt():
    now = datetime.now(PH_TIMEZONE)
    return now.strftime("%Y-%m-%d"), now.strftime("%I:%M:%S %p")

# ==========================
# 🎥 SIMPLE FFMPEG PROCESS
# ==========================
ffmpeg_process = None

def start_ffmpeg():
    """Start FFmpeg with simple overlay - no complex drawtext issues"""
    global ffmpeg_process

    vf_filter = 'scale=1280:720,rotate=180*PI/180'

    print(f"🎬 Using filter: {vf_filter}")
    
    cmd = [
        FFMPEG_PATH,
        '-loglevel', 'error',
        '-rtsp_transport', 'tcp',
        '-i', RTSP_URL,
        '-vf', vf_filter,  # <<< ITO ANG BINAGO KO
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-pix_fmt', 'yuv420p',
        '-g', '30',
        '-b:v', '2000k',
        '-maxrate', '2000k',
        '-bufsize', '4000k',
        '-f', 'hls',
        '-hls_time', '0.5',
        '-hls_list_size', '5',
        '-hls_flags', 'delete_segments+append_list+omit_endlist',
        '-hls_segment_filename', os.path.join(BACKEND_HLS_DIR, 'segment_%05d.ts'),
        '-y',
        HLS_OUTPUT
    ]
    
    print("🎬 Starting FFmpeg with direct RTSP capture...")
    
    ffmpeg_process = subprocess.Popen(
        cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        universal_newlines=True
    )
    
    return ffmpeg_process

# ==========================
# 🔁 FFMPEG WATCHDOG
# ==========================
def ffmpeg_watchdog():
    """Monitor and restart FFmpeg if it dies"""
    global ffmpeg_process
    
    while True:
        if ffmpeg_process is None or ffmpeg_process.poll() is not None:
            if ffmpeg_process and ffmpeg_process.poll() is not None:
                print(f"⚠️ FFmpeg exited with code: {ffmpeg_process.poll()}")
                if ffmpeg_process.stderr:
                    error = ffmpeg_process.stderr.read()
                    if error:
                        print(f"Error: {error[:200]}")
            
            print("🔄 Restarting FFmpeg...")
            time.sleep(2)
            start_ffmpeg()
        
        time.sleep(3)

# ==========================
# 📡 ROUTES
# ==========================
@app.route('/hls/<path:filename>')
def serve_hls(filename):
    """Serve HLS segments with no-cache headers"""
    response = send_from_directory(BACKEND_HLS_DIR, filename)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/health')
def health():
    """Health check endpoint"""
    hls_exists = os.path.exists(HLS_OUTPUT)
    return jsonify({
        "status": "ok",
        "ffmpeg_running": ffmpeg_process is not None and ffmpeg_process.poll() is None,
        "hls_file_exists": hls_exists
    })

@app.route('/time')
def get_time():
    """Get current Philippines time"""
    d, t = get_ph_dt()
    return jsonify({"date": d, "time": t})

@app.route('/')
def index():
    """Web player with timestamp overlay in JavaScript"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>LIBRARY CCTV - Ultra Smooth Stream</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                background: #000;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .container {
                width: 100%;
                max-width: 1400px;
                padding: 20px;
            }
            .video-wrapper {
                position: relative;
                background: #000;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            }
            video {
                width: 100%;
                height: auto;
                display: block;
            }
            .timestamp-overlay {
                position: absolute;
                bottom: 15px;
                left: 15px;
                background: rgba(0,0,0,0.7);
                color: white;
                padding: 8px 15px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 16px;
                font-weight: bold;
                z-index: 10;
                pointer-events: none;
                backdrop-filter: blur(5px);
            }
            .title-overlay {
                position: absolute;
                top: 15px;
                left: 15px;
                background: rgba(0,0,0,0.7);
                color: #0f0;
                padding: 8px 15px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 16px;
                font-weight: bold;
                z-index: 10;
                pointer-events: none;
                backdrop-filter: blur(5px);
            }
            .info {
                margin-top: 20px;
                padding: 15px;
                background: rgba(0,0,0,0.8);
                border-radius: 8px;
                color: #0f0;
                font-family: monospace;
                font-size: 14px;
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
            }
            .info-item {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .label {
                color: #888;
            }
            .value {
                color: #0f0;
                font-weight: bold;
            }
            .status-connected {
                color: #0f0;
            }
            .status-error {
                color: #f00;
            }
            .status-buffering {
                color: #ff0;
            }
            h1 {
                color: #fff;
                margin-bottom: 20px;
                font-size: 24px;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .recording {
                display: inline-block;
                width: 10px;
                height: 10px;
                background: #f00;
                border-radius: 50%;
                animation: pulse 1s infinite;
                margin-left: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📹 LIBRARY CCTV <span class="recording"></span></h1>
            <div class="video-wrapper">
                <div class="title-overlay" id="titleOverlay">LIBRARY CCTV</div>
                <div class="timestamp-overlay" id="timestampOverlay">Loading...</div>
                <video id="video" controls autoplay muted playsinline></video>
            </div>
            <div class="info">
                <div class="info-item">
                    <span class="label">🎥 Status:</span>
                    <span id="status" class="value status-buffering">CONNECTING...</span>
                </div>
                <div class="info-item">
                    <span class="label">📊 Buffer:</span>
                    <span id="buffer" class="value">0</span>
                    <span class="label">seconds</span>
                </div>
                <div class="info-item">
                    <span class="label">⚡ Latency:</span>
                    <span id="latency" class="value">0</span>
                    <span class="label">ms</span>
                </div>
                <div class="info-item">
                    <span class="label">🕐 Server Time:</span>
                    <span id="servertime" class="value">--:--:--</span>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
        <script>
            const video = document.getElementById('video');
            const statusSpan = document.getElementById('status');
            const bufferSpan = document.getElementById('buffer');
            const latencySpan = document.getElementById('latency');
            const timeSpan = document.getElementById('servertime');
            const timestampOverlay = document.getElementById('timestampOverlay');
            
            async function updateTimestamp() {
                try {
                    const res = await fetch('/time');
                    const data = await res.json();
                    timestampOverlay.textContent = `${data.date} | ${data.time}`;
                    timeSpan.textContent = `${data.date} | ${data.time}`;
                } catch(e) {}
            }
            
            setInterval(updateTimestamp, 1000);
            updateTimestamp();
            
            if (Hls.isSupported()) {
                const hls = new Hls({
                    debug: false,
                    enableWorker: true,
                    lowLatencyMode: true,
                    liveSyncDurationCount: 2,
                    liveMaxLatencyDurationCount: 4,
                    maxLiveSyncPlaybackRate: 1,
                    startPosition: -1,
                    manifestLoadingTimeOut: 2000,
                    manifestLoadingMaxRetry: 3,
                    levelLoadingTimeOut: 2000,
                    levelLoadingMaxRetry: 3,
                    fragLoadingTimeOut: 3000,
                    fragLoadingMaxRetry: 4,
                    capLevelToPlayerSize: true,
                    maxBufferLength: 2,
                    maxMaxBufferLength: 4,
                    backBufferLength: 1,
                    liveDurationInfinity: true
                });
                
                hls.loadSource('/hls/stream.m3u8');
                hls.attachMedia(video);
                
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    statusSpan.textContent = 'CONNECTED (HLS)';
                    statusSpan.className = 'value status-connected';
                    video.play().catch(e => console.log('Auto-play prevented'));
                });
                
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        statusSpan.textContent = 'ERROR - Reconnecting';
                        statusSpan.className = 'value status-error';
                        console.error('HLS error:', data);
                        hls.recoverMediaError();
                    }
                });
                
                hls.on(Hls.Events.BUFFER_APPENDING, () => {
                    const bufferLen = hls.bufferLength || 0;
                    bufferSpan.textContent = bufferLen.toFixed(1);
                    
                    if (video.currentTime > 0 && hls.liveSyncPosition) {
                        const latency = Math.abs(video.currentTime - hls.liveSyncPosition) * 1000;
                        if (latency < 5000) {
                            latencySpan.textContent = Math.round(latency);
                            if (latency > 3000) {
                                latencySpan.style.color = '#f90';
                            } else if (latency > 2000) {
                                latencySpan.style.color = '#ff0';
                            } else {
                                latencySpan.style.color = '#0f0';
                            }
                        }
                    }
                });
                
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = '/hls/stream.m3u8';
                statusSpan.textContent = 'CONNECTED (Native)';
                statusSpan.className = 'value status-connected';
                
                video.addEventListener('playing', () => {
                    statusSpan.textContent = 'CONNECTED';
                    statusSpan.className = 'value status-connected';
                });
            }
            
            video.addEventListener('waiting', () => {
                statusSpan.textContent = 'BUFFERING...';
                statusSpan.className = 'value status-buffering';
            });
            
            video.addEventListener('playing', () => {
                if (statusSpan.textContent !== 'CONNECTED (HLS)') {
                    statusSpan.textContent = 'CONNECTED';
                    statusSpan.className = 'value status-connected';
                }
            });
            
            video.addEventListener('error', () => {
                statusSpan.textContent = 'ERROR';
                statusSpan.className = 'value status-error';
            });
        </script>
    </body>
    </html>
    """

# ==========================
# ▶ START
# ==========================
if __name__ == "__main__":
    print("=" * 70)
    print("🚀 ULTRA SMOOTH CCTV STREAM - NO STUTTERS")
    print("=" * 70)
    print("📹 Architecture: FFmpeg → RTSP (TCP) → HLS")
    print("⚡ No Python frame processing - direct pipeline")
    print("🎯 Target latency: < 1 second")
    print("=" * 70)
    
    # Start FFmpeg
    start_ffmpeg()
    
    # Start watchdog
    watchdog = threading.Thread(target=ffmpeg_watchdog, daemon=True)
    watchdog.start()
    
    time.sleep(2)
    
    print("\n" + "=" * 70)
    print("✅ STREAM READY!")
    print(f"📱 Web Player: http://192.168.8.236:5000/")
    print(f"📡 HLS Stream: http://192.168.8.236:5000/hls/stream.m3u8")
    print(f"❤️  Health: http://192.168.8.236:5000/health")
    print("=" * 70)
    print("\n🎯 KEY IMPROVEMENTS:")
    print("   • NO Python frame processing (zero delay)")
    print("   • Timestamp via JavaScript overlay (no FFmpeg issues)")
    print("   • TCP RTSP transport (no packet loss)")
    print("   • 0.5 second HLS segments (ultra low latency)")
    print("   • HLS.js optimized for live streaming")
    print("   • Auto-reconnect on failure")
    print("=" * 70)
    
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=False, use_reloader=False)