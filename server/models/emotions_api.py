import cv2
from deepface import DeepFace
from flask import Flask, jsonify, abort

app = Flask(__name__)

rtsp_url = "rtsp://172.16.1.41:8554/mystream"

@app.route("/emotions", methods=["GET"])
def predictions():
    # Capture video from RTSP stream
    cap = cv2.VideoCapture(rtsp_url)

    if not cap.isOpened():
        abort(500, description="Could not open video stream.")

    try:
        ret, frame = cap.read()

        if not ret:
            abort(500, description="Failed to read frame from video stream.")

        # Analyze the frame for emotions
        result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)

        return jsonify(result)

    except Exception as e:
        abort(500, description=str(e))
    finally:
        cap.release()  # Ensure the video capture is released

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9000, debug=True)
    