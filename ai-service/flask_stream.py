# ai-service/flask_stream.py
from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import time
import numpy as np
from datetime import datetime
import pytz
from collections import deque
import subprocess
import threading
import os
import sys

app = Flask(__name__)
CORS(app)

# ==========================
# 🔐 CONFIG
# ==========================
RTSP_URL = "rtsp://Khysss333:Deluxbaby123@192.168.8.156:554/stream1"
PH_TIMEZONE = pytz.timezone('Asia/Manila')

# FFmpeg path (Windows)
FFMPEG_PATH = r"C:\Users\ADMIN\Downloads\ffmpeg\ffmpeg\bin\ffmpeg.exe"

# HLS output directory - adjust to your backend public folder
BACKEND_HLS_DIR = r"C:\Users\ADMIN\Desktop\ICT Library Office\backend\public\hls"
HLS_OUTPUT = os.path.join(BACKEND_HLS_DIR, "stream.m3u8")

# Will be set after getting camera resolution
FRAME_WIDTH = None
FRAME_HEIGHT = None
FPS = 20

# Ensure HLS directory exists
os.makedirs(BACKEND_HLS_DIR, exist_ok=True)

# ==========================
# 🎯 FACE DETECTION
# ==========================
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

face_history = deque(maxlen=5)

def detect_faces(frame):
    global face_history

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(60, 60)
    )

    if len(faces) > 0:
        # Get the largest face
        main_face = max(faces, key=lambda f: f[2] * f[3])
        face_history.append(main_face)
        
        # Return smoothed face position
        if len(face_history) > 0:
            avg = np.mean(list(face_history), axis=0).astype(int)
            return [avg]
    
    return []

# ==========================
# 🕒 TIME
# ==========================
def get_ph_dt():
    now = datetime.now(PH_TIMEZONE)
    return now.strftime("%Y-%m-%d"), now.strftime("%I:%M:%S %p")

# ==========================
# 🎥 FFMPEG PROCESS
# ==========================
ffmpeg_process = None

def start_ffmpeg():
    global ffmpeg_process
    
    # Clean old HLS files
    for f in os.listdir(BACKEND_HLS_DIR):
        if f.endswith('.ts') or f.endswith('.m3u8'):
            try:
                os.remove(os.path.join(BACKEND_HLS_DIR, f))
            except:
                pass
    
    # FFmpeg command to accept raw video from stdin (using original resolution)
    cmd = [
        FFMPEG_PATH,
        '-loglevel', 'error',
        '-f', 'rawvideo',
        '-vcodec', 'rawvideo',
        '-pix_fmt', 'bgr24',
        '-s', f'{FRAME_WIDTH}x{FRAME_HEIGHT}',
        '-r', str(FPS),
        '-i', '-',  # Read from stdin
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-pix_fmt', 'yuv420p',
        '-g', '30',
        '-f', 'hls',
        '-hls_time', '1',
        '-hls_list_size', '5',
        '-hls_flags', 'delete_segments+append_list',
        '-hls_segment_filename', os.path.join(BACKEND_HLS_DIR, 'segment_%05d.ts'),
        HLS_OUTPUT
    ]
    
    ffmpeg_process = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE
    )
    
    print(f"✅ FFmpeg started with resolution {FRAME_WIDTH}x{FRAME_HEIGHT}")
    return ffmpeg_process

# ==========================
# 🔁 MAIN STREAM LOOP
# ==========================
def stream_loop():
    global ffmpeg_process, FRAME_WIDTH, FRAME_HEIGHT
    
    print("🎥 Starting stream thread...")
    
    # Open RTSP stream to get original resolution
    cap = cv2.VideoCapture(RTSP_URL)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    
    # Get original camera resolution
    original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    # Set global resolution variables
    FRAME_WIDTH = original_width
    FRAME_HEIGHT = original_height
    
    print(f"📐 Original Camera Resolution: {FRAME_WIDTH}x{FRAME_HEIGHT}")
    
    # Initialize FFmpeg with original resolution
    ffmpeg_process = start_ffmpeg()
    
    frame_count = 0
    
    while True:
        try:
            success, frame = cap.read()
            
            if not success:
                print("⚠️ Failed to read frame, reconnecting...")
                cap.release()
                time.sleep(1)
                cap = cv2.VideoCapture(RTSP_URL)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                continue
            
            # ==========================
            # 🧠 PROCESS FRAME
            # ==========================
            # Rotate 180 degrees
            frame = cv2.rotate(frame, cv2.ROTATE_180)
            
            # NO RESIZE - keep original resolution
            
            # Face detection
            faces = detect_faces(frame)
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # Add timestamp overlay
            ph_date, ph_time = get_ph_dt()
            
            # Semi-transparent background for text (at the bottom)
            overlay = frame.copy()
            cv2.rectangle(overlay, (0, FRAME_HEIGHT-50), (FRAME_WIDTH, FRAME_HEIGHT), (0, 0, 0), -1)
            frame = cv2.addWeighted(overlay, 0.7, frame, 0.3, 0)
            
            # Draw date and time text
            text = f"{ph_date} | {ph_time}"
            # Use dynamic font scale based on resolution
            font_scale = FRAME_WIDTH / 800  # Adjust scale proportionally
            cv2.putText(frame, text, (20, FRAME_HEIGHT-15),
                        cv2.FONT_HERSHEY_SIMPLEX, max(0.5, font_scale * 0.6), (255, 255, 255), 1, cv2.LINE_AA)
            
            # ==========================
            # 🚀 SEND TO FFMPEG
            # ==========================
            if ffmpeg_process and ffmpeg_process.poll() is None:
                try:
                    # Convert frame to raw bytes and send to FFmpeg stdin
                    ffmpeg_process.stdin.write(frame.tobytes())
                    frame_count += 1
                    
                    if frame_count % 30 == 0:
                        print(f"📹 Streamed {frame_count} frames...")
                        
                except (BrokenPipeError, OSError) as e:
                    print(f"⚠️ FFmpeg pipe broken: {e}")
                    print("🔄 Restarting FFmpeg...")
                    
                    # Restart FFmpeg
                    if ffmpeg_process:
                        try:
                            ffmpeg_process.stdin.close()
                            ffmpeg_process.terminate()
                        except:
                            pass
                    
                    time.sleep(0.5)
                    ffmpeg_process = start_ffmpeg()
            
            # Small delay to maintain FPS
            time.sleep(1.0 / FPS)
            
        except Exception as e:
            print(f"❌ Error in stream loop: {e}")
            time.sleep(2)
            continue
    
    # Cleanup
    if ffmpeg_process:
        ffmpeg_process.stdin.close()
        ffmpeg_process.terminate()
    cap.release()

# ==========================
# 📡 MJPEG (DEBUG only - optional)
# ==========================
def mjpeg_generator():
    cap = cv2.VideoCapture(RTSP_URL)
    
    while True:
        success, frame = cap.read()
        if not success:
            cap.release()
            time.sleep(1)
            cap = cv2.VideoCapture(RTSP_URL)
            continue
        
        # No resize for MJPEG either
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' +
               buffer.tobytes() + b'\r\n')

@app.route('/video')
def video():
    return Response(mjpeg_generator(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# ==========================
# 🕒 TIME API
# ==========================
@app.route('/time')
def get_time():
    d, t = get_ph_dt()
    return jsonify({"date": d, "time": t})

# ==========================
# 🏥 HEALTH CHECK
# ==========================
@app.route('/health')
def health():
    return jsonify({
        "status": "ok",
        "ffmpeg_running": ffmpeg_process is not None and ffmpeg_process.poll() is None,
        "hls_path": HLS_OUTPUT,
        "resolution": f"{FRAME_WIDTH}x{FRAME_HEIGHT}" if FRAME_WIDTH else "unknown"
    })

# ==========================
# ▶ START
# ==========================
if __name__ == "__main__":
    # Start stream processing in background thread
    stream_thread = threading.Thread(target=stream_loop, daemon=True)
    stream_thread.start()
    
    # Give FFmpeg time to start
    time.sleep(3)
    
    print("=" * 50)
    print("🚀 Flask CCTV Streamer with Face Detection")
    print(f"📡 HLS Stream: http://192.168.8.236:5000/hls/stream.m3u8")
    print(f"📸 MJPEG Debug: http://192.168.8.236:5000/video")
    print(f"🕒 Time API: http://192.168.8.236:5000/time")
    print(f"❤️  Health: http://192.168.8.236:5000/health")
    print("=" * 50)
    
    # Run Flask on port 5000
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)