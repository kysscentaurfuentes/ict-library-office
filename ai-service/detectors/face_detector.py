# ICT-LIBRARY-OFFICE/ai-service/detectors/face_detector.py

import time

from ultralytics import YOLO

face_model = YOLO(
    "models/face/yolov8n_100e.pt"
)

print("YOLO FACE DETECTOR LOADED")

def detect_faces(frame):

    results = face_model(
        frame,
        verbose=False
    )[0]

    faces = []

    if results.boxes is None:
        return faces

    for box in results.boxes.xyxy.cpu().numpy():

        x1, y1, x2, y2 = map(
            int,
            box[:4]
        )

        faces.append({
            "x": x1,
            "y": y1,
            "width": x2 - x1,
            "height": y2 - y1
        })

    if not hasattr(detect_faces, "_last_log"):
        detect_faces._last_log = time.time()

    if time.time() - detect_faces._last_log >= 10:
        print("Faces Found:", len(faces))
        detect_faces._last_log = time.time()

    return faces