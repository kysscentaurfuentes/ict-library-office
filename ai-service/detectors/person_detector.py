# ICT-LIBRARY-OFFICE/ai-service/detectors/person_detector.py

from ultralytics import YOLO
import supervision as sv

person_model = YOLO("yolov8n.pt")
tracker = sv.ByteTrack()

def detect_persons(frame):

    results = person_model(
        frame,
        verbose=False
    )[0]

    detections = sv.Detections.from_ultralytics(
        results
    )

    detections = detections[
        (detections.class_id == 0)
        &
        (detections.confidence > 0.50)
    ]

    tracked = tracker.update_with_detections(
        detections
    )

    persons = []

    for i in range(len(tracked.xyxy)):

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