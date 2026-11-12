const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const host = "127.0.0.1";
const port = 8765;
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function safeFile(urlPath) {
  const pathname = decodeURIComponent(String(urlPath || "/").split("?")[0]);
  const requested = path.resolve(root, `.${pathname}`);
  if (!requested.startsWith(root)) return null;
  if (!path.extname(pathname)) return path.join(root, "index.html");
  return requested;
}

http.createServer((request, response) => {
  const file = safeFile(request.url);
  if (!file) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": contentTypes[path.extname(file).toLowerCase()] || "application/octet-stream"
    });
    response.end(data);
  });
}).listen(port, host, () => {
  console.log(`Teaching Player: http://${host}:${port}`);
});
