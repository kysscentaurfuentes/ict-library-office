from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import time
import numpy as np
from datetime import datetime
import pytz
from collections import deque

app = Flask(__name__)
CORS(app)

RTSP_URL = "rtsp://Khysss333:Deluxbaby123@192.168.8.156:554/stream1"
PH_TIMEZONE = pytz.timezone('Asia/Manila')

# Face Detection Setup
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
face_history = deque(maxlen=5) 

def get_ph_dt():
    now = datetime.now(PH_TIMEZONE)
    return now.strftime("%Y-%m-%d"), now.strftime("%I:%M:%S %p")

def detect_faces(frame):
    global face_history
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray) # For better detection in low light
    
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
        if len(face_history) > 0:
            face_history.popleft()

    if face_history:
        avg_face = np.mean(face_history, axis=0).astype(int)
        return [avg_face]
    return []

def generate():
    cap = cv2.VideoCapture(RTSP_URL)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1) 
    
    frame_count = 0
    while True:
        success, frame = cap.read()
        if not success:
            time.sleep(1)
            cap = cv2.VideoCapture(RTSP_URL)
            continue

        # 1. ROTATE 180 DEGREES
        frame = cv2.rotate(frame, cv2.ROTATE_180)

        frame_count += 1
        frame = cv2.resize(frame, (800, 450)) 
        
        # 2. FACE DETECTION (Box only, no text)
        faces = detect_faces(frame)
        for (x, y, w, h) in faces:
            # Thickness 2 para mas manipis at malinis tignan
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

        # 3. DATE AND TIME OVERLAY
        ph_date, ph_time = get_ph_dt()
        h_img, w_img = frame.shape[:2]
        
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, h_img-45), (w_img, h_img), (0, 0, 0), -1)
        # solid dark bar for readability
        frame = cv2.addWeighted(overlay, 0.85, frame, 0.15, 0)

        display_text = f"Philippine Date: {ph_date} | Time: {ph_time}"
        cv2.putText(frame, display_text, (25, h_img-15), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if not ret: continue
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route('/video')
def video():
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/time')
def get_time():
    d, t = get_ph_dt()
    return jsonify({"date": d, "time": t})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, threaded=True)