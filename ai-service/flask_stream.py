# ai-service/flask_stream.py
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
person_model = YOLO("yolov8n.pt")

ffmpeg_process = None

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

    results = person_model(frame, verbose=False)

    persons = []

    for result in results:

        for box in result.boxes:

            cls = int(box.cls[0])

            if cls == 0:  # person

                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0]
                )

                persons.append({
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
            (416, 234)
        )

        if frame_skip % 8 == 0:

            try:

                persons = detect_persons(
                    small
                )

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

            scale_x = (
                frame.shape[1] / 416
            )

            scale_y = (
                frame.shape[0] / 234
            )

            temp_faces = []

            for (x, y, w, h) in faces:

                temp_faces.append({
                    "x": int(x * scale_x),
                    "y": int(y * scale_y),
                    "width": int(w * scale_x),
                    "height": int(h * scale_y)
                })

            latest_faces = temp_faces

            temp_persons = []

            for person in persons:

                temp_persons.append({
                    "x": int(person["x"] * scale_x),
                    "y": int(person["y"] * scale_y),
                    "width": int(
                        person["width"] * scale_x
                    ),
                    "height": int(
                        person["height"] * scale_y
                    )
                })

            latest_persons = temp_persons

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