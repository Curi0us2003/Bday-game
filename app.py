from pathlib import Path

from flask import Flask, jsonify, send_from_directory


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
app = Flask(__name__, static_folder=str(DIST), static_url_path="")


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "the-archive"})


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_app(path):
    requested = DIST / path
    if path and requested.is_file():
        return send_from_directory(DIST, path)
    return send_from_directory(DIST, "index.html")


if __name__ == "__main__":
    if not (DIST / "index.html").exists():
        raise SystemExit("Build the frontend first with: npm run build")
    app.run(host="127.0.0.1", port=5000, debug=True)
