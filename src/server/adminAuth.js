import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "admin_session";

function getEnvVar(name) {
  const value = process.env[name];
  return typeof value === "string" ? value : "";
}

export function getAdminPin() {
  return getEnvVar("ADMIN_PIN");
}

export function getAdminSessionSecret() {
  return getEnvVar("ADMIN_SESSION_SECRET");
}

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function compareSecret(input, expected) {
  if (!input || !expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function parseCookieHeader(cookieHeader) {
  const out = {};
  if (typeof cookieHeader !== "string" || cookieHeader.length === 0) return out;

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const raw = part.trim();
    if (!raw) continue;
    const index = raw.indexOf("=");
    if (index < 1) continue;
    const key = raw.slice(0, index).trim();
    const value = raw.slice(index + 1).trim();
    if (!key) continue;
    out[key] = decodeURIComponent(value);
  }
  return out;
}

export function createSessionToken() {
  const secret = getAdminSessionSecret();
  if (!secret) return "";
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    }),
  );
  const body = `${header}.${payload}`;
  const sig = signValue(body, secret);
  return `${body}.${sig}`;
}

export function verifySessionToken(token) {
  const secret = getAdminSessionSecret();
  if (!secret || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const body = `${parts[0]}.${parts[1]}`;
  const expectedSig = signValue(body, secret);
  if (!compareSecret(parts[2], expectedSig)) return false;

  try {
    const payload = JSON.parse(fromBase64Url(parts[1]));
    if (!payload || typeof payload !== "object") return false;
    if (payload.role !== "admin") return false;
    if (typeof payload.exp !== "number") return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch (error) {
    return false;
  }
}

function shouldUseSecureCookie(req) {
  if (process.env.NODE_ENV === "production") return true;
  const forwardedProto = req && req.headers ? req.headers["x-forwarded-proto"] : "";
  return typeof forwardedProto === "string" && forwardedProto.includes("https");
}

export function makeSessionCookie(value, req) {
  const parts = [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=43200",
  ];
  if (shouldUseSecureCookie(req)) parts.push("Secure");
  return parts.join("; ");
}

export function makeClearSessionCookie(req) {
  const parts = [
    `${ADMIN_COOKIE_NAME}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (shouldUseSecureCookie(req)) parts.push("Secure");
  return parts.join("; ");
}

