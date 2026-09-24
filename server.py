from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Состояние автоответчика
assistant_enabled = False


@app.route("/status", methods=["GET"])
def get_status():
    return jsonify({
        "enabled": assistant_enabled
    })


@app.route("/toggle", methods=["POST"])
def toggle():
    global assistant_enabled

    data = request.get_json(silent=True) or {}

    if "enabled" in data:
        assistant_enabled = bool(data["enabled"])

    return jsonify({
        "enabled": assistant_enabled
    })


@app.route("/")
def home():
    return "AI Assistant server is running!"


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )