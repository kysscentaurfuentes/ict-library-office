# ICT-LIBRARY-OFFICE/ai-service/detectors/face_detector.py
import cv2

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)

def detect_faces(frame):

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.05,
        minNeighbors=3,
        minSize=(30, 30)
    )

    results = []

    for (x, y, w, h) in faces:

        results.append({
            "x": int(x),
            "y": int(y),
            "width": int(w),
            "height": int(h)
        })

    return results