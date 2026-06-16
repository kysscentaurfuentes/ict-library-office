# ICT-LIBRARY-OFFICE/ai-service/detectors/head_detector.py
import time
from ultralytics import YOLO

head_model = YOLO(
    "models/head/yolov8_head.pt"
)

print("YOLO HEAD DETECTOR LOADED")


def detect_heads(frame):

    results = head_model(
        frame,
        verbose=False
    )[0]

    heads = []

    if results.boxes is None:
        return heads

    for box in results.boxes.xyxy.cpu().numpy():

        x1, y1, x2, y2 = map(
            int,
            box[:4]
        )

        heads.append({
            "x": x1,
            "y": y1,
            "width": x2 - x1,
            "height": y2 - y1
        })

    if not hasattr(detect_heads, "_last_log"):
        detect_heads._last_log = time.time()

    if time.time() - detect_heads._last_log >= 10:
        print("Heads Found:", len(heads))
        detect_heads._last_log = time.time()

    return heads