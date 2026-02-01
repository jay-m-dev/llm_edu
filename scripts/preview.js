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
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}`);
});
