# ai-service/ws_face.py
import cv2
import asyncio
import websockets
import json

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

async def handler(websocket):
    cap = cv2.VideoCapture(0)

    prev_x, prev_y = None, None
    last_face = None  # ✅ para hindi nagfi-flicker

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)

            result = []

            for (x, y, w, h) in faces:
                # ✅ movement detection (x + y, smoother)
                moving = False
                if prev_x is not None and prev_y is not None:
                    dx = abs(x - prev_x)
                    dy = abs(y - prev_y)
                    moving = (dx + dy) > 8  # threshold tweak

                prev_x, prev_y = x, y

                face_data = {
                    "x": int(x),
                    "y": int(y),
                    "w": int(w),
                    "h": int(h),
                    "moving": moving
                }

                result.append(face_data)
                last_face = face_data  # ✅ save last

            # ✅ fallback kapag walang detect (anti flicker)
            if len(result) == 0 and last_face:
                result = [last_face]

            await websocket.send(json.dumps(result))
            await asyncio.sleep(0.03)

    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")

    finally:
        cap.release()


async def main():
    async with websockets.serve(handler, "0.0.0.0", 8765):
        print("WebSocket running on ws://localhost:8765")
        await asyncio.Future()

