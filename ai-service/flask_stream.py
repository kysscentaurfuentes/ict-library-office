# ICT-LIBRARY-OFFICE/ai-service/flask_stream.py
from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import time
import numpy as np
from datetime import datetime
import pytz
from collections import deque
import threading
import os
from dotenv import load_dotenv
import subprocess
from ultralytics import YOLO
import supervision as sv
import psutil

person_model = YOLO("yolov8n.pt")
tracker = sv.ByteTrack()

ffmpeg_process = None

latest_stats = {
    "fps": 0,
    "cpu": 0,
    "ram": 0,
    "persons": 0,
    "faces": 0
}

app = Flask(__name__)
CORS(app)

if not os.getenv("DOCKER_ENV"):
    load_dotenv(".env.local")

RTSP_URL = os.getenv(
    "RTSP_URL",
    "rtsp://127.0.0.1:8554/cctv"
)

print("RTSP_URL =", RTSP_URL)

latest_annotated_frame = None

PH_TIMEZONE = pytz.timezone("Asia/Manila")

# Face Detection Setup
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

face_history = deque(maxlen=5)

latest_frame = None
latest_faces = []
latest_persons = []

frame_lock = threading.Lock()

stream_ready = False

def get_ph_dt():
    now = datetime.now(PH_TIMEZONE)

    return (
        now.strftime("%Y-%m-%d"),
        now.strftime("%I:%M:%S %p")
    )


def detect_faces(frame):

    global face_history

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    gray = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.05,
        minNeighbors=3,
        minSize=(30, 30)
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


def detect_persons(frame):

    results = person_model(
        frame,
        verbose=False
    )[0]

    detections = sv.Detections.from_ultralytics(
        results
    )

    detections = detections[
        detections.class_id == 0
    ]

    tracked = tracker.update_with_detections(
        detections
    )

    persons = []

    for i in range(
        len(tracked.xyxy)
    ):

        x1, y1, x2, y2 = map(
            int,
            tracked.xyxy[i]
        )

        track_id = int(
            tracked.tracker_id[i]
        )

        persons.append({
            "id": track_id,
            "x": x1,
            "y": y1,
            "width": x2 - x1,
            "height": y2 - y1
        })

    return persons

def start_rtsp_publisher(width, height):

    global ffmpeg_process

    ffmpeg_process = subprocess.Popen(
        [
            "ffmpeg",

            "-f",
            "rawvideo",

            "-pix_fmt",
            "bgr24",

            "-s",
            f"{width}x{height}",

            "-r",
            "15",

            "-i",
            "-",

            "-c:v",
            "libx264",

            "-preset",
            "ultrafast",

            "-tune",
            "zerolatency",

            "-rtsp_transport",
            "tcp",

            "-f",
            "rtsp",

            "rtsp://mediamtx:8554/processed"
        ],
        stdin=subprocess.PIPE
    )


def face_worker():

    global latest_faces
    global latest_persons
    global latest_annotated_frame
    global ffmpeg_process

    print("🧠 FACE WORKER STARTED")

    frame_skip = 0
    persons = []

    while True:

        with frame_lock:

            if latest_frame is None:

                time.sleep(0.05)
                continue

            frame = latest_frame.copy()

        annotated = frame.copy()

        if ffmpeg_process is None:

            start_rtsp_publisher(
                frame.shape[1],
                frame.shape[0]
            )

        frame_skip += 1

        small = cv2.resize(
            frame,
            (640, 360)
        )

        if frame_skip % 3 == 0:

            try:

                persons = detect_persons(
                    small
                )

                latest_stats["persons"] = len(persons)

                print(
                    "PERSONS:",
                    len(persons)
                )

            except Exception as e:

                print(
                    "YOLO ERROR:",
                    e
                )

                persons = []

            faces = detect_faces(
                small
            )

            latest_stats["faces"] = len(faces)
            latest_stats["cpu"] = psutil.cpu_percent()
            latest_stats["ram"] = psutil.virtual_memory().percent

            scale_x = frame.shape[1] / small.shape[1]
            scale_y = frame.shape[0] / small.shape[0]

            temp_faces = []

            for (x, y, w, h) in faces:

                fx = int(x * scale_x)
                fy = int(y * scale_y)

                fw = int(w * scale_x)
                fh = int(h * scale_y)

                fx = max(0, min(fx, frame.shape[1] - 1))
                fy = max(0, min(fy, frame.shape[0] - 1))

                fw = min(fw, frame.shape[1] - fx)
                fh = min(fh, frame.shape[0] - fy)

                temp_faces.append({
                    "x": fx,
                    "y": fy,
                    "width": fw,
                    "height": fh
                })

            latest_faces = temp_faces

            temp_persons = []

            for person in persons:

                x = person["x"]
                y = person["y"]
                w = person["width"]
                h = person["height"]

                x = max(0, min(x, frame.shape[1] - 1))
                y = max(0, min(y, frame.shape[0] - 1))

                w = min(w, frame.shape[1] - x)
                h = min(h, frame.shape[0] - y)

                w = max(1, w)
                h = max(1, h)

                temp_persons.append({
                    "id": person["id"],
                    "x": x,
                    "y": y,
                    "width": w,
                    "height": h
                })

            latest_persons = temp_persons

            print("PERSON DATA:", latest_persons)
            print("FACE DATA:", latest_faces)

        for face in latest_faces:

            cv2.rectangle(
                annotated,
                (
                    face["x"],
                    face["y"]
                ),
                (
                    face["x"] + face["width"],
                    face["y"] + face["height"]
                ),
                (0, 255, 0),
                2
            )

        for person in latest_persons:

            cv2.rectangle(
                annotated,
                (
                    person["x"],
                    person["y"]
                ),
                (
                    person["x"] + person["width"],
                    person["y"] + person["height"]
                ),
                (255, 0, 0),
                2
            )

            cv2.putText(
                annotated,
                f'ID {person["id"]}',
                (
                    person["x"],
                    person["y"] - 10
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 0, 0),
                2
            )

        latest_annotated_frame = (
            annotated
        )

        try:

            if (
                ffmpeg_process
                and ffmpeg_process.stdin
            ):

                ffmpeg_process.stdin.write(
                    annotated.tobytes()
                )

                ffmpeg_process.stdin.flush()

        except Exception as e:

            print(
                "RTSP PUBLISH ERROR:",
                e
            )

        time.sleep(0.03)


def capture_worker():

    global latest_frame
    global stream_ready

    print("📹 CAPTURE WORKER STARTED")

    cap = None

    while True:

        try:

            if cap is None or not cap.isOpened():

                cap = cv2.VideoCapture(
                    RTSP_URL,
                    cv2.CAP_FFMPEG
                )

                cap.set(
                    cv2.CAP_PROP_BUFFERSIZE,
                    1
                )

                print("✅ RTSP CONNECTED")

            success, frame = cap.read()

            if not success:

                print(
                    "❌ CAPTURE FRAME FAILED"
                )

                stream_ready = False

                cap.release()
                cap = None

                time.sleep(1)

                continue

            frame = cv2.rotate(
                frame,
                cv2.ROTATE_180
            )

            print(
             "FRAME SIZE:",
             frame.shape[1],
             frame.shape[0]
            )

            with frame_lock:

                latest_frame = frame.copy()

            stream_ready = True

        except Exception as e:

            print(
                "CAPTURE ERROR:",
                e
            )

            if cap:
                cap.release()

            cap = None

            time.sleep(1)


def generate():

    global latest_faces
    global latest_annotated_frame

    print("🚀 VIDEO GENERATOR STARTED")

    frame_count = 0

    while True:

        with frame_lock:

            if latest_annotated_frame is None:

                time.sleep(0.01)
                continue

            frame = latest_annotated_frame.copy()

        frame_count += 1

        if frame_count % 100 == 0:

            print(
                f"✅ FRAME OK: {frame_count}"
            )

        ph_date, ph_time = get_ph_dt()

        h_img, w_img = frame.shape[:2]

        overlay = frame.copy()

        cv2.rectangle(
            overlay,
            (0, h_img - 45),
            (w_img, h_img),
            (0, 0, 0),
            -1
        )

        frame = cv2.addWeighted(
            overlay,
            0.85,
            frame,
            0.15,
            0
        )

        cv2.putText(
            frame,
            f"Philippine Date: {ph_date} | Time: {ph_time}",
            (25, h_img - 15),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            1
        )

        ret, buffer = cv2.imencode(
            ".jpg",
            frame,
            [cv2.IMWRITE_JPEG_QUALITY, 85]
        )

        if not ret:

            print(
                "❌ JPEG ENCODE FAILED"
            )

            continue

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + buffer.tobytes()
            + b"\r\n"
        )


@app.route("/video")
def video():

    return Response(
        generate(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/time")
def get_time():

    d, t = get_ph_dt()

    return jsonify({
        "date": d,
        "time": t
    })


@app.route("/faces")
def get_faces():

    print(
        "👤 FACES API:",
        len(latest_faces)
    )

    return jsonify({
        "faces": len(latest_faces),
        "boxes": latest_faces,
        "persons": latest_persons
    })

@app.route("/health")
def health():

    return jsonify({
        "status": "ok",
        "stream_ready": stream_ready,
        "faces": len(latest_faces)
    })

@app.route("/stats")
def stats():
    return jsonify(latest_stats)

if __name__ == "__main__":

    threading.Thread(
        target=capture_worker,
        daemon=True
    ).start()

    threading.Thread(
        target=face_worker,
        daemon=True
    ).start()

    app.run(
        host="0.0.0.0",
        port=5000,
        threaded=True
    )