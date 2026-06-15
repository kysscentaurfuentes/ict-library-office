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
import psutil
from detectors.person_detector import detect_persons
from detectors.face_detector import detect_faces
from detectors.head_detector import detect_heads

latest_heads = []

ffmpeg_process = None

latest_stats = {
    "fps": 0,
    "cpu": 0,
    "ram": 0,
    "persons": 0,
    "faces": 0,
    "heads": 0,
    "tracked_ids": []
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

            os.getenv(
            "PROCESSED_RTSP_URL",
            "rtsp://mediamtx:8554/processed"
    )
        ],
        stdin=subprocess.PIPE
    )


def face_worker():

    global latest_faces
    global latest_heads
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

                latest_stats["tracked_ids"] = [
                    p["id"]
                    for p in persons
                ]

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

            faces = []
            heads = []

            for person in persons:

                px = person["x"]
                py = person["y"]
                pw = person["width"]
                ph = person["height"]

                roi = small[
                    py:py + ph,
                    px:px + pw
                ]

                if roi.size == 0:
                    continue

                person_faces = detect_faces(
                    roi
                )

                person_heads = detect_heads(
                    roi
                )

                print(
                    "FACE:",
                    len(person_faces),
                    "HEAD:",
                    len(person_heads)
                )

                if len(person_faces) > 0:

                    biggest_face = max(
                        person_faces,
                        key=lambda f:
                            f["width"] * f["height"]
                    )

                    faces.append({
                        "x": px + biggest_face["x"],
                        "y": py + biggest_face["y"],
                        "width": biggest_face["width"],
                        "height": biggest_face["height"]
                    })


                if len(person_heads) > 0:

                    biggest_head = max(
                        person_heads,
                        key=lambda h:
                            h["width"] * h["height"]
                )

                    heads.append({
                        "person_id": person["id"],
                        "x": px + biggest_head["x"],
                        "y": py + biggest_head["y"],
                        "width": biggest_head["width"],
                        "height": biggest_head["height"]
                    })


                latest_stats["faces"] = len(faces)
                latest_stats["heads"] = len(heads)
                latest_stats["cpu"] = psutil.cpu_percent()
                latest_stats["ram"] = psutil.virtual_memory().percent

            scale_x = frame.shape[1] / small.shape[1]
            scale_y = frame.shape[0] / small.shape[0]

            temp_faces = []

            temp_heads = []

            for face in faces:

                x = face["x"]
                y = face["y"]
                w = face["width"]
                h = face["height"]

                fx = int(x * scale_x)
                fy = int(y * scale_y)

                fw = int(w * scale_x)
                fh = int(h * scale_y)

                temp_faces.append({
                    "x": fx,
                    "y": fy,
                    "width": fw,
                    "height": fh
                })

            for head in heads:

                hx = int(head["x"] * scale_x)
                hy = int(head["y"] * scale_y)

                hw = int(head["width"] * scale_x)
                hh = int(head["height"] * scale_y)

                temp_heads.append({
                    "person_id": head["person_id"],
                    "x": hx,
                    "y": hy,
                    "width": hw,
                "height": hh
                })

            latest_faces = temp_faces

            latest_heads = temp_heads

            temp_persons = []

            for person in persons:

                x = int(person["x"] * scale_x)
                y = int(person["y"] * scale_y)

                w = int(person["width"] * scale_x)
                h = int(person["height"] * scale_y)

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

        for head in latest_heads:

            cv2.rectangle(
                annotated,
                (
                    head["x"],
                    head["y"]
                ),
                (
                    head["x"] + head["width"],
                    head["y"] + head["height"]
                ),
                (0, 0, 255),
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
                and ffmpeg_process.poll() is None
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

            try:
                if ffmpeg_process:
                    ffmpeg_process.kill()
            except:
                pass

            ffmpeg_process = None

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


@app.route("/detections")
def get_detections():

    print(
        "👤 FACES:",
        len(latest_faces),
        "| HEADS:",
        len(latest_heads)
    )

    return jsonify({
        "faces": len(latest_faces),
        "heads": len(latest_heads),
        "persons": len(latest_persons),

        "face_boxes": latest_faces,
        "head_boxes": latest_heads,
        "person_boxes": latest_persons
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