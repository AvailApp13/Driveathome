from flask import Flask, jsonify, request
import json
import os

app = Flask(__name__)

PROMO_FILE = os.path.join("promo", "promo_codes.json")


def load_promos():
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


@app.route("/promo/check", methods=["POST"])
def check_promo():
    data = request.json
    code = data.get("code", "").strip()

    if not code:
        return jsonify({"ok": False, "error": "NO_CODE"}), 400

    promos = load_promos()

    if code not in promos:
        return jsonify({"ok": False, "error": "INVALID_CODE"}), 404

    promo = promos[code]

    if promo.get("used"):
        return jsonify({"ok": False, "error": "CODE_ALREADY_USED"}), 403

    # помечаем как использованный
    promo["used"] = True
    promos[code] = promo
    save_promos(promos)

    return jsonify({
        "ok": True,
        "minutes": promo["minutes"]
    })


if __name__ == "__main__":
    print("OK BRIDGE START")
    app.run(port=5000)