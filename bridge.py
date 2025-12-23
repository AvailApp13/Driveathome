import json
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

PROMO_FILE = os.path.join("promo", "promo_codes.json")


def load_promos():
    if not os.path.exists(PROMO_FILE):
        return {}
    with open(PROMO_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_promos(data):
    with open(PROMO_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


@app.route("/")
def index():
    return "DriveAtHome bridge is running"


@app.route("/status")
def status():
    return jsonify({
        "status": "ok",
        "robot": "not connected yet"
    })


@app.route("/promo", methods=["POST"])
def promo():
    data = request.get_json()
    if not data or "code" not in data:
        return jsonify({"ok": False, "error": "NO_CODE"}), 400

    code = data["code"].strip()

    promos = load_promos()

    if code not in promos:
        return jsonify({"ok": False, "error": "INVALID_CODE"}), 404

    promo = promos[code]

    if promo.get("used"):
        return jsonify({"ok": False, "error": "CODE_ALREADY_USED"}), 403

    minutes = promo.get("minutes", 0)

    if minutes <= 0:
        return jsonify({"ok": False, "error": "INVALID_MINUTES"}), 500

    # помечаем как использованный
    promos[code]["used"] = True
    save_promos(promos)

    return jsonify({
        "ok": True,
        "minutes": minutes
    })


if __name__ == "__main__":
    print("OK BRIDGE START")
    app.run(port=5000)