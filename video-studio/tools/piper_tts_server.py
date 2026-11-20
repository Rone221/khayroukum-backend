"""Petit serveur compatible OpenAI /v1/audio/speech, adossé à Piper (hors ligne)."""
import io, json, subprocess, sys, wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from piper import PiperVoice
VOICE = PiperVoice.load(sys.argv[1])
class H(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype):
        self.send_response(code); self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
    def do_GET(self):
        if self.path.endswith("/audio/voices"):
            return self._send(200, json.dumps({"voices": ["siwis"]}).encode(), "application/json")
        self._send(404, b"{}", "application/json")
    def do_POST(self):
        if not self.path.endswith("/audio/speech"):
            return self._send(404, b"{}", "application/json")
        req = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
        buf = io.BytesIO()
        with wave.open(buf, "wb") as w:
            VOICE.synthesize_wav(req["input"], w)
        speed = float(req.get("speed") or 1.0)
        mp3 = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "wav", "-i", "pipe:0",
                              "-filter:a", f"atempo={speed}", "-f", "mp3", "pipe:1"],
                             input=buf.getvalue(), capture_output=True, check=True).stdout
        self._send(200, mp3, "audio/mpeg")
    def log_message(self, *a): pass
ThreadingHTTPServer(("127.0.0.1", 8880), H).serve_forever()
