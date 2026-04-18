# ai-service/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import time

app = FastAPI()

# ✅ CORS (for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load face detector once
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# ✅ RTSP source (CCTV)
video_source = "rtsp://Khysss333:Deluxbaby123@192.168.8.156:554/stream1"


@app.get("/")
def read_root():
    return {"message": "API is working!"}


# ✅ IMAGE UPLOAD (manual detect)
@app.post("/detect")
async def detect_face(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"error": "Invalid image file"}

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        return {"faces_detected": int(len(faces))}

    except Exception as e:
        return {"error": str(e)}


# ✅ LIVE CCTV STREAM
def generate_frames():
    cap = cv2.VideoCapture(video_source)

    if not cap.isOpened():
        print("❌ Cannot open RTSP stream")
        return

    while True:
        success, frame = cap.read()

        # 🔁 Auto reconnect pag naputol
        if not success:
            print("⚠️ Reconnecting to RTSP...")
            cap.release()
            time.sleep(2)
            cap = cv2.VideoCapture(video_source)
            continue

        # ✅ Face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # ✅ Encode to JPG
        _, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
        )


@app.get("/video")
def video_feed():
    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )