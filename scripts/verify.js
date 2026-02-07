import fs from "node:fs";
import path from "node:path";
import {
  containsEmDash,
  listFilesRecursive,
  readTextSafe,
} from "../src/utils/verify.js";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const PUBLIC_DIR = path.join(ROOT, "public");

const REQUIRED_IDS = [
  "home",
  "projects",
  "skills",
  "about",
  "experience",
  "education",
  "certifications",
  "contact",
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function isTextFile(filePath) {
  return /\.(jsx?|css|html|md|json|cjs|mjs)$/i.test(filePath);
}

function scanDirFor(dir, predicate, label) {
  if (!fs.existsSync(dir)) return;
  const files = listFilesRecursive(dir).filter(isTextFile);
  for (const file of files) {
    const text = readTextSafe(file);
    if (predicate(text)) fail(`${label} found in ${path.relative(ROOT, file)}`);
  }
}

function containsUndefinedToken(text) {
  return /\bundefined\b/.test(text);
}

function findBuildIndexHtml() {
  const candidates = [
    path.join(ROOT, "dist", "index.html"),
    path.join(ROOT, "build", "index.html"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function checkRequiredIdsInBuiltHtml() {
  const builtHtmlPath = findBuildIndexHtml();
  if (!builtHtmlPath) {
    fail("Build output not found. Run npm run build first.");
    return;
  }
  const html = readTextSafe(builtHtmlPath);
  for (const id of REQUIRED_IDS) {
    if (!html.includes(`id=\"${id}\"`) && !html.includes(`id='${id}'`)) {
      fail(`Missing id="${id}" in ${path.relative(ROOT, builtHtmlPath)}`);
    }
  }
}

scanDirFor(SRC_DIR, containsEmDash, "Em dash");
scanDirFor(PUBLIC_DIR, containsEmDash, "Em dash");
scanDirFor(SRC_DIR, containsUndefinedToken, "Undefined token");

checkRequiredIdsInBuiltHtml();

if (process.exitCode) {
  process.exit(process.exitCode);
} else {
  console.log("verify: ok");
}
