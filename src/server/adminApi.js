import {
  ADMIN_COOKIE_NAME,
  compareSecret,
  createSessionToken,
  getAdminPin,
  getAdminSessionSecret,
  makeClearSessionCookie,
  makeSessionCookie,
  parseCookieHeader,
  verifySessionToken,
} from "./adminAuth.js";
import { readContentStore, writeContentStore } from "./contentStore.js";

function setNoStore(res) {
  res.setHeader("Cache-Control", "no-store");
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  setNoStore(res);
  res.end(JSON.stringify(payload));
}

function ensureAuthenticated(req) {
  const token = getSessionFromReq(req);
  return verifySessionToken(token);
}

async function readBodyAsJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.length > 0) {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk.toString();
      if (raw.length > 2_000_000) req.destroy();
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function getSessionFromReq(req) {
  const headerToken = req && req.headers ? req.headers["x-admin-session"] : "";
  if (typeof headerToken === "string" && headerToken.trim().length > 0) {
    return headerToken.trim();
  }
  if (Array.isArray(headerToken) && headerToken.length > 0) {
    const first = headerToken[0];
    if (typeof first === "string" && first.trim().length > 0) {
      return first.trim();
    }
  }

  const cookieHeader = req && req.headers ? req.headers.cookie : "";
  const cookies = parseCookieHeader(cookieHeader);
  return typeof cookies[ADMIN_COOKIE_NAME] === "string" ? cookies[ADMIN_COOKIE_NAME] : "";
}

function checkServerSecrets() {
  return Boolean(getAdminPin()) && Boolean(getAdminSessionSecret());
}

function configMessage() {
  return "Set ADMIN_PIN and ADMIN_SESSION_SECRET in .env.local (dev) or your hosting environment.";
}

export function handleAdminSession(req, res) {
  if (!checkServerSecrets()) {
    sendJson(res, 503, {
      ok: false,
      authenticated: false,
      message: configMessage(),
    });
    return;
  }

  const token = getSessionFromReq(req);
  const authenticated = verifySessionToken(token);
  sendJson(res, 200, { ok: true, authenticated });
}

export async function handleAdminLogin(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  if (!checkServerSecrets()) {
    sendJson(res, 503, { ok: false, message: configMessage() });
    return;
  }

  const body = await readBodyAsJson(req);
  const input = typeof body.passcode === "string" ? body.passcode.trim() : "";
  const pin = getAdminPin();

  if (!compareSecret(input, pin)) {
    sendJson(res, 401, { ok: false, message: "Invalid passcode." });
    return;
  }

  const token = createSessionToken();
  if (!token) {
    sendJson(res, 500, { ok: false, message: "Could not create admin session." });
    return;
  }

  res.setHeader("Set-Cookie", makeSessionCookie(token, req));
  sendJson(res, 200, { ok: true, authenticated: true, sessionToken: token });
}

export function handleAdminLogout(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  res.setHeader("Set-Cookie", makeClearSessionCookie(req));
  sendJson(res, 200, { ok: true, authenticated: false });
}

export async function handleContentGet(req, res) {
  try {
    const content = await readContentStore();
    sendJson(res, 200, { ok: true, content });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: "Could not load content." });
  }
}

export async function handleContentSave(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  if (!checkServerSecrets()) {
    sendJson(res, 503, { ok: false, message: configMessage() });
    return;
  }

  if (!ensureAuthenticated(req)) {
    sendJson(res, 401, { ok: false, message: "Unauthorized admin session." });
    return;
  }

  try {
    const patch = await readBodyAsJson(req);
    const content = await writeContentStore(patch);
    sendJson(res, 200, { ok: true, content });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: "Could not save content." });
  }
}
