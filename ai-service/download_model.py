import urllib.request

print("Downloading deploy.prototxt...")
urllib.request.urlretrieve(
    "https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt",
    "deploy.prototxt"
)

print("Downloading caffemodel...")
urllib.request.urlretrieve(
    "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel",
    "res10_300x300_ssd_iter_140000.caffemodel"
)

print("✅ Done!")