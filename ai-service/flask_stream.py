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

load_dotenv("../backend/.env.local")

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

# =========================================================
# FACE DETECTOR
# =========================================================

face_net = cv2.dnn.readNetFromCaffe(
    "deploy.prototxt",
    "res10_300x300_ssd_iter_140000.caffemodel"
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
# FFMPEG
# =========================================================

def start_ffmpeg():

    global ffmpeg_process

    vf_filter = "scale=854:480"

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
    global camera_online
    global current_face_boxes

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
        # DETECT EVERY 5 FRAMES ONLY
        # =================================================

        if frame_counter % 5 == 0:

            small = cv2.resize(
                frame,
                (640, 360)
            )

            blob = cv2.dnn.blobFromImage(
                small,
                1.0,
                (300, 300),
                (104.0, 177.0, 123.0)
            )

            face_net.setInput(blob)

            detections = face_net.forward()

            face_count = 0
            face_boxes = []

            for i in range(detections.shape[2]):

                confidence = detections[0, 0, i, 2]

                if confidence < 0.35:
                    continue
                # 1 BOX
                box = detections[0, 0, i, 3:7] * np.array([
                       640,
    360,
    640,
    360
                ])

                (
                    startX,
                    startY,
                    endX,
                    endY
                ) = box.astype("int")

                width = endX - startX
                height = endY - startY

                if width < 40 or height < 40:
                    continue

                face_count += 1

                scale_x = frame.shape[1] / 640
                scale_y = frame.shape[0] / 360

                startX = int(startX * scale_x)
                startY = int(startY * scale_y)
                endX = int(endX * scale_x)
                endY = int(endY * scale_y)

                width = endX - startX
                height = endY - startY

                face_boxes.append({
    "x": int(startX),
    "y": int(startY),
    "width": int(width),
    "height": int(height)
})

                cv2.rectangle(
                    frame,
                    (startX, startY),
                    (endX, endY),
                    (0, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    f"{confidence:.2f}",
                    (startX, startY - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 0),
                    2
                )

            current_faces = face_count
            current_face_boxes = face_boxes

            FACE_DETECTIONS.inc(face_count)

            print(
                f"👤 Faces: {current_faces}"
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

        blob = cv2.dnn.blobFromImage(
            frame,
            1.0,
            (300, 300),
            (104.0, 177.0, 123.0)
        )

        face_net.setInput(blob)

        detections = face_net.forward()

        face_count = 0
        face_boxes = []

        for i in range(detections.shape[2]):

            confidence = detections[0, 0, i, 2]

            print("CONF:", confidence)

            if confidence < 0.35:
                continue
            # 2 BOX
            box = detections[0, 0, i, 3:7] * np.array([
                frame.shape[1],
                frame.shape[0],
                frame.shape[1],
                frame.shape[0]
            ])

            (
                startX,
                startY,
                endX,
                endY
            ) = box.astype("int")

            width = endX - startX
            height = endY - startY

            if width < 40 or height < 40:
                continue

            face_count += 1

            face_boxes.append({
                "x": int(startX),
                "y": int(startY),
                "width": int(width),
                "height": int(height)
            })

        return jsonify({
            "faces_detected": face_count,
            "boxes": face_boxes
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