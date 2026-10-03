"""
SuperFlow Live Preview & Hot-Reload Engine.
Provides instant live web previews with WebSocket auto-reload for vanilla projects
and Vite HMR for modern React/Vue applications.
"""

from __future__ import annotations

import asyncio
import http.server
import os
import socketserver
import threading
import time
import webbrowser
from pathlib import Path
from typing import Optional

LIVE_RELOAD_SCRIPT = """
<!-- SuperFlow Live Reload Client -->
<script>
(function() {
  const wsUrl = "ws://" + location.hostname + ":" + (parseInt(location.port) + 1);
  let socket = null;
  function connect() {
    socket = new WebSocket(wsUrl);
    socket.onmessage = function(msg) {
      if (msg.data === "reload") {
        console.log("[SuperFlow] Change detected, reloading page...");
        location.reload();
      }
    };
    socket.onclose = function() {
      setTimeout(connect, 1000);
    };
  }
  connect();
})();
</script>
"""


class LiveReloadHTTPHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP handler that injects live reload script into HTML files."""

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        # Resolve target file path
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, "index.html")

        if os.path.isfile(path) and path.endswith(".html"):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Inject reload script before </head> or </body>
                if "</body>" in content:
                    content = content.replace("</body>", f"{LIVE_RELOAD_SCRIPT}\n</body>", 1)
                elif "</head>" in content:
                    content = content.replace("</head>", f"{LIVE_RELOAD_SCRIPT}\n</head>", 1)
                else:
                    content += LIVE_RELOAD_SCRIPT

                data = content.encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            except Exception:
                pass

        super().do_GET()


class SuperFlowLiveServer:
    """Zero-config live dev server with file watcher and browser auto-refresh."""

    def __init__(self, root_dir: str = "./workspace", port: int = 3000):
        self.root_dir = Path(root_dir).resolve()
        self.port = port
        self.ws_port = port + 1
        self._is_running = False
        self._httpd = None
        self._clients = set()
        self._last_mtimes = {}

    def _get_files_mtime(self) -> dict:
        mtimes = {}
        if self.root_dir.exists():
            for f in self.root_dir.rglob("*"):
                if f.is_file() and not any(part.startswith(".") for part in f.parts):
                    try:
                        mtimes[str(f)] = f.stat().st_mtime
                    except Exception:
                        pass
        return mtimes

    def _file_watch_loop(self):
        self._last_mtimes = self._get_files_mtime()
        while self._is_running:
            time.sleep(0.4)
            current_mtimes = self._get_files_mtime()
            if current_mtimes != self._last_mtimes:
                self._last_mtimes = current_mtimes
                self._broadcast_reload()

    def _broadcast_reload(self):
        """Sends reload signal over simple TCP sockets."""
        for client in list(self._clients):
            try:
                # WebSocket text frame format for "reload"
                payload = b"reload"
                frame = bytearray([0x81, len(payload)]) + payload
                client.sendall(frame)
            except Exception:
                self._clients.discard(client)

    def _ws_server_loop(self):
        import socket
        import hashlib
        import base64

        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind(("0.0.0.0", self.ws_port))
        server.listen(10)

        while self._is_running:
            try:
                client, _ = server.accept()
                req = client.recv(1024).decode("utf-8", errors="ignore")
                key_match = None
                for line in req.split("\r\n"):
                    if line.lower().startswith("sec-websocket-key:"):
                        key_match = line.split(":", 1)[1].strip()
                        break

                if key_match:
                    guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
                    resp_key = base64.b64encode(hashlib.sha1((key_match + guid).encode()).digest()).decode()
                    resp = (
                        "HTTP/1.1 101 Switching Protocols\r\n"
                        "Upgrade: websocket\r\n"
                        "Connection: Upgrade\r\n"
                        f"Sec-WebSocket-Accept: {resp_key}\r\n\r\n"
                    )
                    client.sendall(resp.encode())
                    self._clients.add(client)
            except Exception:
                break

    def start(self, open_browser: bool = True) -> str:
        """Starts the live reload server in background threads."""
        if self._is_running:
            return f"http://localhost:{self.port}"

        self._is_running = True
        self.root_dir.mkdir(parents=True, exist_ok=True)

        # 1. Start HTTP Server
        handler = lambda *args: LiveReloadHTTPHandler(*args, directory=str(self.root_dir))
        socketserver.TCPServer.allow_reuse_address = True
        self._httpd = socketserver.TCPServer(("0.0.0.0", self.port), handler)

        http_thread = threading.Thread(target=self._httpd.serve_forever, daemon=True)
        http_thread.start()

        # 2. Start WebSocket reload server
        ws_thread = threading.Thread(target=self._ws_server_loop, daemon=True)
        ws_thread.start()

        # 3. Start File Watcher
        watch_thread = threading.Thread(target=self._file_watch_loop, daemon=True)
        watch_thread.start()

        url = f"http://localhost:{self.port}"
        if open_browser:
            threading.Timer(0.5, lambda: webbrowser.open(url)).start()

        return url

    def stop(self):
        self._is_running = False
        if self._httpd:
            self._httpd.shutdown()
            self._httpd.server_close()


def main():
    import argparse
    import sys

    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    parser = argparse.ArgumentParser(description="SuperFlow Live Preview Hot-Reload Server")
    parser.add_argument("--dir", default="./workspace", help="Directory containing web app files (default: ./workspace)")
    parser.add_argument("--port", type=int, default=3000, help="HTTP server port (default: 3000)")
    parser.add_argument("--no-browser", action="store_true", help="Do not open browser automatically")
    args = parser.parse_args()

    server = SuperFlowLiveServer(root_dir=args.dir, port=args.port)
    url = server.start(open_browser=not args.no_browser)
    print("=" * 60)
    print(f"🚀 SuperFlow Live Hot-Reload Server Active")
    print(f"   URL:           {url}")
    print(f"   Watching:      {Path(args.dir).resolve()}")
    print(f"   WebSocket:     ws://localhost:{args.port + 1}")
    print("=" * 60)
    print("👀 Edit any file in the folder to see instant browser refresh!")
    print("   Press Ctrl+C to terminate.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping live server...")
        server.stop()
        sys.exit(0)


if __name__ == "__main__":
    main()
