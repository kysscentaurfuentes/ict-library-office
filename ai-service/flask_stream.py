# ai-service/flask_stream.py

from flask import (
    Flask,
    jsonify,
    send_from_directory,
    request,
    Response
)

from flask_cors import CORS
from dotenv import load_dotenv

from prometheus_client import (
    Counter,
    Gauge,
    Histogram,
    generate_latest
)

from collections import deque
from datetime import datetime

import subprocess
import threading
import os
import time
import logging
import cv2
import pytz
import numpy as np

# =========================================================
# LOAD ENV
# =========================================================

ENV_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../backend/.env.local"
    )
)

load_dotenv(ENV_PATH)

# =========================================================
# APP
# =========================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": "*"
        }
    }
)

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

# =========================================================
# CONFIG
# =========================================================

RTSP_URL = os.getenv("RTSP_URL")

FFMPEG_PATH = os.getenv(
    "FFMPEG_PATH",
    "ffmpeg"
)

print("RTSP_URL =", RTSP_URL)
print("FFMPEG_PATH =", FFMPEG_PATH)

PH_TIMEZONE = pytz.timezone("Asia/Manila")

BACKEND_HLS_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "../backend/public/hls"
    )
)

HLS_OUTPUT = os.path.join(
    BACKEND_HLS_DIR,
    "stream.m3u8"
)

# =========================================================
# PROMETHEUS METRICS
# =========================================================

ACTIVE_STREAMS = Gauge(
    "ai_active_streams",
    "Number of active CCTV streams"
)

FACE_DETECTIONS = Counter(
    "ai_face_detections_total",
    "Total detected faces"
)

AI_PROCESSING_LATENCY = Histogram(
    "ai_processing_latency_seconds",
    "AI frame processing latency"
)

# =========================================================
# GLOBALS
# =========================================================

ffmpeg_process = None

current_faces = 0
current_face_boxes = []

camera_online = False

face_history = deque(maxlen=5)

# =========================================================
# FACE DETECTOR
# =========================================================

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

# =========================================================
# SETUP
# =========================================================

os.makedirs(
    BACKEND_HLS_DIR,
    exist_ok=True
)

for f in os.listdir(BACKEND_HLS_DIR):

    if f.endswith(".ts") or f.endswith(".m3u8"):

        try:

            os.remove(
                os.path.join(
                    BACKEND_HLS_DIR,
                    f
                )
            )

        except:
            pass

# =========================================================
# TIME
# =========================================================

def get_ph_dt():

    now = datetime.now(PH_TIMEZONE)

    return (
        now.strftime("%Y-%m-%d"),
        now.strftime("%I:%M:%S %p")
    )

# =========================================================
# FACE DETECTION
# =========================================================

def detect_faces(frame):

    global face_history

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    gray = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(60, 60)
    )

    if len(faces) > 0:

        main_face = max(
            faces,
            key=lambda f: f[2] * f[3]
        )

        face_history.append(main_face)

    else:

        if len(face_history) > 0:
            face_history.popleft()

    if face_history:

        avg_face = np.mean(
            face_history,
            axis=0
        ).astype(int)

        return [avg_face]

    return []

# =========================================================
# FFMPEG
# =========================================================

def start_ffmpeg():

    global ffmpeg_process

    print("=" * 70)
    print("🎬 STARTING FFMPEG")
    print("=" * 70)

    cmd = [

        FFMPEG_PATH,

        "-rtsp_transport",
        "tcp",

        "-use_wallclock_as_timestamps",
        "1",

        "-fflags",
        "+genpts",

        "-i",
        RTSP_URL,

        "-vf",
        "scale=1280:720:flags=lanczos,hflip,vflip",

        "-c:v",
        "libx264",

        "-preset",
        "faster",

        "-tune",
        "zerolatency",

        "-pix_fmt",
        "yuv420p",

        "-profile:v",
        "high",

        "-crf",
        "18",

        "-r",
        "30",

        "-g",
        "30",

        "-keyint_min",
        "30",

        "-sc_threshold",
        "0",

        "-an",

        "-f",
        "hls",

        "-hls_time",
        "1",

        "-hls_list_size",
        "5",

        "-hls_flags",
        "delete_segments+append_list+independent_segments",

        "-hls_segment_filename",
        os.path.join(
            BACKEND_HLS_DIR,
            "segment_%05d.ts"
        ),

        "-y",
        HLS_OUTPUT
    ]

    print("🎬 FFmpeg Command:")
    print(" ".join(cmd))

    ffmpeg_process = subprocess.Popen(
        cmd,
        stdout=subprocess.DEVNULL,
        stderr=None,
        universal_newlines=True
    )

    ACTIVE_STREAMS.set(1)

    return ffmpeg_process

# =========================================================
# WATCHDOG
# =========================================================

def ffmpeg_watchdog():

    global ffmpeg_process

    while True:

        if (
            ffmpeg_process is None or
            ffmpeg_process.poll() is not None
        ):

            print("🔄 Restarting FFmpeg...")

            ACTIVE_STREAMS.set(0)

            time.sleep(2)

            start_ffmpeg()

        time.sleep(3)

# =========================================================
# FACE DETECTION THREAD
# =========================================================

def face_detection_worker():

    global current_faces
    global current_face_boxes
    global camera_online

    cap = cv2.VideoCapture(RTSP_URL)

    if not cap.isOpened():

        print("❌ Cannot open RTSP stream")
        return

    frame_counter = 0

    while True:

        start_time = time.time()

        success, frame = cap.read()

        if not success:

            print("⚠️ Reconnecting RTSP...")

            camera_online = False

            cap.release()

            time.sleep(2)

            cap = cv2.VideoCapture(RTSP_URL)

            continue

        camera_online = True

        frame_counter += 1

        # =================================================
        # DETECT EVERY 3 FRAMES
        # =================================================

        if frame_counter % 3 == 0:

            frame = cv2.rotate(
                frame,
                cv2.ROTATE_180
            )

            frame = cv2.resize(
                frame,
                (800, 450)
            )

            faces = detect_faces(frame)

            face_boxes = []

            for (x, y, w, h) in faces:

                face_boxes.append({

                    "x": int(x),
                    "y": int(y),
                    "width": int(w),
                    "height": int(h)

                })

            current_faces = len(faces)
            current_face_boxes = face_boxes

            FACE_DETECTIONS.inc(current_faces)

            print(
                f"👤 Faces: {current_faces}"
            )

        AI_PROCESSING_LATENCY.observe(
            time.time() - start_time
        )

# =========================================================
# ROUTES
# =========================================================

@app.route("/")
def index():

    return jsonify({
        "message": "Flask HLS Stream Running"
    })

@app.route("/health")
def health():

    return jsonify({

        "status": "ok",

        "camera_online":
            camera_online,

        "ffmpeg_running":
            ffmpeg_process is not None and
            ffmpeg_process.poll() is None,

        "hls_exists":
            os.path.exists(HLS_OUTPUT),

        "faces":
            current_faces
    })

@app.route("/faces")
def faces():

    return jsonify({

        "faces": current_faces,
        "boxes": current_face_boxes

    })

@app.route("/time")
def get_time():

    d, t = get_ph_dt()

    return jsonify({

        "date": d,
        "time": t

    })

@app.route("/metrics")
def metrics():

    return Response(
        generate_latest(),
        mimetype="text/plain"
    )

@app.route("/detect", methods=["POST"])
def detect_face():

    try:

        file = request.files["file"]

        contents = file.read()

        nparr = np.frombuffer(
            contents,
            np.uint8
        )

        frame = cv2.imdecode(
            nparr,
            cv2.IMREAD_COLOR
        )

        if frame is None:

            return jsonify({
                "error": "Invalid image"
            })

        faces = detect_faces(frame)

        boxes = []

        for (x, y, w, h) in faces:

            boxes.append({

                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h)

            })

        return jsonify({

            "faces_detected": len(faces),
            "boxes": boxes

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })

@app.route("/hls/<path:filename>")
def serve_hls(filename):

    response = send_from_directory(
        BACKEND_HLS_DIR,
        filename
    )

    response.headers[
        "Cache-Control"
    ] = "no-cache, no-store, must-revalidate"

    response.headers[
        "Pragma"
    ] = "no-cache"

    response.headers[
        "Expires"
    ] = "0"

    response.headers[
        "Access-Control-Allow-Origin"
    ] = "*"

    return response

# =========================================================
# START
# =========================================================

if __name__ == "__main__":

    print("=" * 70)
    print("🚀 CCTV HLS STREAM STARTING")
    print("=" * 70)

    start_ffmpeg()

    watchdog = threading.Thread(
        target=ffmpeg_watchdog,
        daemon=True
    )

    watchdog.start()

    face_thread = threading.Thread(
        target=face_detection_worker,
        daemon=True
    )

    face_thread.start()

    time.sleep(2)

    print("=" * 70)
    print("✅ STREAM READY")
    print("📡 http://localhost:5000/hls/stream.m3u8")
    print("👤 http://localhost:5000/faces")
    print("❤️  http://localhost:5000/health")
    print("📊 http://localhost:5000/metrics")
    print("=" * 70)

    app.run(
        host="0.0.0.0",
        port=5000,
        threaded=True,
        debug=False,
        use_reloader=False
    )