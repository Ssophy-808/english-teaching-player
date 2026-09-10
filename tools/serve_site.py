from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import re


SITE = Path(__file__).resolve().parents[1]


class SpaHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        requested = self.path.split("?", 1)[0]
        local = SITE / requested.lstrip("/")
        if re.match(r"^/book\d+(?:/unit\d+)?(?:/day\d+)?/?$", requested) and not local.exists():
            self.path = "/index.html"
        return super().do_GET()


if __name__ == "__main__":
    os.chdir(SITE)
    print("English Teaching Player: http://127.0.0.1:8765/")
    ThreadingHTTPServer(("127.0.0.1", 8765), SpaHandler).serve_forever()
