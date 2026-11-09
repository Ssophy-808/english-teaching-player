from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import re


SITE = Path(__file__).resolve().parents[1]


class SpaHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # The Player changes frequently during lesson preparation. Prevent an
        # already-open local tab from keeping an older index or data file.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        return super().end_headers()

    def do_GET(self):
        requested = self.path.split("?", 1)[0]
        local = SITE / requested.lstrip("/")
        app_route = re.match(r"^/book\d+(?:/unit\d+)?(?:/day\d+)?/?$", requested)
        phonics_route = re.match(r"^/phonics/[^/]+(?:/[^/]+)?/?$", requested)
        literacy_route = re.match(r"^/literacy/[^/]+(?:/[^/]+)?/?$", requested)
        if (app_route or phonics_route or literacy_route) and not local.exists():
            self.path = "/index.html"
        return super().do_GET()


if __name__ == "__main__":
    os.chdir(SITE)
    print("English Teaching Player: http://127.0.0.1:8765/")
    ThreadingHTTPServer(("127.0.0.1", 8765), SpaHandler).serve_forever()
