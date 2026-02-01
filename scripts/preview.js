#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const root = process.cwd();
const distDir = path.join(root, "dist");
const port = 4173;

if (!fs.existsSync(distDir)) {
  console.error("Missing dist/. Run `npm run build` first.");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || "/");
  const sanitizedPath = parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname;
  const filePath = path.join(distDir, sanitizedPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
  };

  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}`);
});
