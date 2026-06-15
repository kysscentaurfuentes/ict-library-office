# ICT-LIBRARY-OFFICE/ai-service/detectors/head_detector.py

def detect_heads(persons):

    heads = []

    for person in persons:

        head_height = int(
            person["height"] * 0.30
        )

        heads.append({
            "person_id": person["id"],
            "x": person["x"],
            "y": person["y"],
            "width": person["width"],
            "height": head_height
        })

    return heads
