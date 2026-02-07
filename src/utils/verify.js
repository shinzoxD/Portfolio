import fs from "node:fs";
import path from "node:path";

export function listFilesRecursive(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else out.push(fullPath);
    }
  }
  return out;
}

export function readTextSafe(filePath) {
  const buf = fs.readFileSync(filePath);
  return buf.toString("utf8");
}

export function containsEmDash(text) {
  const emDash = "\u2014";
  return text.includes(emDash);
}
