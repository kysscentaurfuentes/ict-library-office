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

app = Flask(__name__)
CORS(app)

# ==========================
# 🔐 CONFIG
# ==========================
RTSP_URL = "rtsp://Khysss333:Deluxbaby123@192.168.8.156:554/stream1"
PH_TIMEZONE = pytz.timezone('Asia/Manila')

FFMPEG_PATH = r"C:\ffmpeg\bin\ffmpeg.exe"  # 🔥 adjust if needed
HLS_OUTPUT = r"C:\Users\ADMIN\Desktop\ICT Library Office\backend\public\hls\stream.m3u8"

FRAME_WIDTH = 800
FRAME_HEIGHT = 450
FPS = 20

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
        main_face = max(faces, key=lambda f: f[2] * f[3])
        face_history.append(main_face)
    else:
        if face_history:
            face_history.popleft()

    if face_history:
        avg = np.mean(face_history, axis=0).astype(int)
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

# ==========================
# 🔁 MAIN STREAM LOOP
# ==========================
def stream_loop():
    print("🎥 Starting stream thread...")

    cap = cv2.VideoCapture(RTSP_URL)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    while True:
        success, frame = cap.read()

        if not success:
            print("⚠️ Reconnecting RTSP...")
            cap.release()
            time.sleep(1)
            cap = cv2.VideoCapture(RTSP_URL)
            continue

        # ==========================
        # 🧠 PROCESS FRAME
        # ==========================
        frame = cv2.rotate(frame, cv2.ROTATE_180)
        frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))

        faces = detect_faces(frame)
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

        ph_date, ph_time = get_ph_dt()

        overlay = frame.copy()
        cv2.rectangle(overlay, (0, FRAME_HEIGHT-40), (FRAME_WIDTH, FRAME_HEIGHT), (0,0,0), -1)
        frame = cv2.addWeighted(overlay, 0.8, frame, 0.2, 0)

        text = f"{ph_date} | {ph_time}"
        cv2.putText(frame, text, (20, FRAME_HEIGHT-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)

        # ==========================
        # 🚀 SEND TO FFMPEG
        # ==========================

# ==========================
# 📡 MJPEG (OPTIONAL DEBUG)
# ==========================
def mjpeg_generator():
    cap = cv2.VideoCapture(RTSP_URL)

    while True:
        success, frame = cap.read()
        if not success:
            continue

        frame = cv2.resize(frame, (FRAME_WIDTH, FRAME_HEIGHT))
        _, buffer = cv2.imencode('.jpg', frame)

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' +
               buffer.tobytes() + b'\r\n')

@app.route('/video')
def video():
    return Response(mjpeg_generator(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# ==========================
# 🕒 API
# ==========================
@app.route('/time')
def get_time():
    d, t = get_ph_dt()
    return jsonify({"date": d, "time": t})

# ==========================
# ▶ START
# ==========================
if __name__ == "__main__":
    threading.Thread(target=stream_loop, daemon=True).start()

    print("🚀 Flask running on :4000")
    app.run(host='0.0.0.0', port=4000, threaded=True)