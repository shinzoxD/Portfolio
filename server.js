import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import {
  handleAdminLogin,
  handleAdminLogout,
  handleAdminSession,
  handleContentGet,
  handleContentSave,
} from "./src/server/adminApi.js";
import { readContentStore } from "./src/server/contentStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, "dist");
const INDEX_FILE = path.join(DIST_DIR, "index.html");
const PORT = Number(process.env.PORT || 5173);
const BOOTSTRAP_TOKEN = "__PORTFOLIO_BOOTSTRAP__";

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function setNoStore(res) {
  res.setHeader("Cache-Control", "no-store");
}

function setStaticCache(res) {
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
}

function sendText(res, status, text) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  setNoStore(res);
  res.end(text);
}

function serializeForHtml(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

async function routeApi(req, res, pathname) {
  if (pathname === "/api/admin/session") {
    handleAdminSession(req, res);
    return true;
  }
  if (pathname === "/api/admin/login") {
    await handleAdminLogin(req, res);
    return true;
  }
  if (pathname === "/api/admin/logout") {
    handleAdminLogout(req, res);
    return true;
  }
  if (pathname === "/api/content") {
    if (req.method === "GET") {
      await handleContentGet(req, res);
    } else {
      await handleContentSave(req, res);
    }
    return true;
  }
  if (pathname.startsWith("/api/")) {
    sendText(res, 404, "Not found");
    return true;
  }
  return false;
}

function canUsePath(candidatePath) {
  const relative = path.relative(DIST_DIR, candidatePath);
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function sendFile(res, filePath, method) {
  if (!canUsePath(filePath)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      sendText(res, 404, "Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[extension] || "application/octet-stream";
    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      setStaticCache(res);
    } else {
      setNoStore(res);
    }

    if (method === "HEAD") {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on("error", () => sendText(res, 500, "File stream error"));
    stream.pipe(res);
  } catch (error) {
    sendText(res, 404, "Not found");
  }
}

async function sendIndexHtml(res, method) {
  try {
    const html = fs.readFileSync(INDEX_FILE, "utf8");
    let content = null;

    try {
      content = await readContentStore();
    } catch (error) {
      content = null;
    }

    const body = html.replace(BOOTSTRAP_TOKEN, serializeForHtml(content));
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    setNoStore(res);

    if (method === "HEAD") {
      res.end();
      return;
    }

    res.end(body);
  } catch (error) {
    sendText(res, 500, "Could not render app shell");
  }
}

async function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendText(res, 405, "Method not allowed");
    return;
  }

  const cleaned = pathname === "/" ? "/index.html" : pathname;
  const staticFile = path.join(DIST_DIR, cleaned.replace(/^\/+/, ""));
  const staticExists = fs.existsSync(staticFile) && fs.statSync(staticFile).isFile();
  if (staticExists) {
    if (path.resolve(staticFile) === path.resolve(INDEX_FILE)) {
      await sendIndexHtml(res, req.method);
      return;
    }
    await sendFile(res, staticFile, req.method);
    return;
  }

  await sendIndexHtml(res, req.method);
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "/", `http://${host}`);
    const pathname = decodeURIComponent(url.pathname);

    const handledApi = await routeApi(req, res, pathname);
    if (handledApi) return;

    await serveStatic(req, res, pathname);
  } catch (error) {
    sendText(res, 500, "Server error");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
