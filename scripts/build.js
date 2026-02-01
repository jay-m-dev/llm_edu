#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "prototype");
const outDir = path.join(root, "dist");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(srcDir)) {
  console.error("Missing prototype directory.");
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
copyDir(srcDir, outDir);
console.log("Build complete: dist/");
