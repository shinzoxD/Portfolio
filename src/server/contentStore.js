import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { normalizeCertifications } from "../utils/certifications.js";
import {
  normalizeAboutContent,
  normalizeEducation,
  normalizeExperience,
  normalizeHeroRoles,
  normalizeProfile,
  normalizeSectionSubtitles,
  normalizeSectionVisibility,
  normalizeSkillGroups,
} from "../utils/contentShape.js";
import { normalizeProjects } from "../utils/projects.js";

const STORE_DIR = path.join(process.cwd(), "server-data");
const STORE_FILE = path.join(STORE_DIR, "content.json");
const MAX_RESUME_DATA_URL_LEN = 8_000_000;
const CONTENT_ROW_ID = 1;

let poolRef = null;
let schemaPromise = null;

function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
}

function readStoreRawFromFile() {
  if (!fs.existsSync(STORE_FILE)) return {};
  try {
    const text = fs.readFileSync(STORE_FILE, "utf8");
    if (!text.trim()) return {};
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function sanitizeResumeDataUrl(value) {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (!text) return "";
  if (text.length > MAX_RESUME_DATA_URL_LEN) {
    throw new Error("Resume file is too large for server storage.");
  }
  if (!text.startsWith("data:application/pdf;base64,")) {
    throw new Error("Resume must be a PDF data URL.");
  }
  return text;
}

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  return typeof value === "string" ? value.trim() : "";
}

function hasDatabase() {
  return getDatabaseUrl().length > 0;
}

function isDatabaseSslEnabled() {
  const value = process.env.DATABASE_SSL;
  if (typeof value === "string" && value.trim().length > 0) {
    const clean = value.trim().toLowerCase();
    return clean === "1" || clean === "true" || clean === "yes";
  }

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return false;

  try {
    const parsed = new URL(databaseUrl);
    const sslMode = (parsed.searchParams.get("sslmode") || "").trim().toLowerCase();
    if (!sslMode) return false;
    return sslMode !== "disable" && sslMode !== "allow";
  } catch (error) {
    return false;
  }
}

function getPool() {
  if (poolRef) return poolRef;
  const connectionString = getDatabaseUrl();
  if (!connectionString) return null;
  poolRef = new Pool({
    connectionString,
    ssl: isDatabaseSslEnabled() ? { rejectUnauthorized: false } : false,
  });
  return poolRef;
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toStoredObject(value) {
  if (isObject(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isObject(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }
  return {};
}

async function ensureDatabaseSchema() {
  if (!hasDatabase()) return;
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const pool = getPool();
      if (!pool) return;
      await pool.query(`
        CREATE TABLE IF NOT EXISTS portfolio_content (
          id SMALLINT PRIMARY KEY CHECK (id = 1),
          content JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await pool.query(
        "INSERT INTO portfolio_content (id, content) VALUES ($1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING",
        [CONTENT_ROW_ID],
      );
    })();
  }
  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = null;
    throw error;
  }
}

function sanitizePatch(input) {
  const patch = input && typeof input === "object" ? input : {};
  const out = {};

  if (Object.prototype.hasOwnProperty.call(patch, "profile")) {
    out.profile = normalizeProfile(patch.profile);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "heroRoles")) {
    out.heroRoles = normalizeHeroRoles(patch.heroRoles);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "about")) {
    out.about = normalizeAboutContent(patch.about);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "skillGroups")) {
    out.skillGroups = normalizeSkillGroups(patch.skillGroups);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "experience")) {
    out.experience = normalizeExperience(patch.experience);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "education")) {
    out.education = normalizeEducation(patch.education);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "projects")) {
    out.projects = normalizeProjects(patch.projects);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "certifications")) {
    out.certifications = normalizeCertifications(patch.certifications);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "sectionVisibility")) {
    out.sectionVisibility = normalizeSectionVisibility(patch.sectionVisibility);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "sectionSubtitles")) {
    out.sectionSubtitles = normalizeSectionSubtitles(patch.sectionSubtitles);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "resumeDataUrl")) {
    out.resumeDataUrl = sanitizeResumeDataUrl(patch.resumeDataUrl);
  }

  return out;
}

function normalizeStoredContent(raw) {
  const value = raw && typeof raw === "object" ? raw : {};
  const out = {};
  if (value.profile && typeof value.profile === "object") out.profile = normalizeProfile(value.profile);
  if (value.heroRoles) out.heroRoles = normalizeHeroRoles(value.heroRoles);
  if (value.about && typeof value.about === "object") out.about = normalizeAboutContent(value.about);
  if (Array.isArray(value.skillGroups)) out.skillGroups = normalizeSkillGroups(value.skillGroups);
  if (Array.isArray(value.experience)) out.experience = normalizeExperience(value.experience);
  if (Array.isArray(value.education)) out.education = normalizeEducation(value.education);
  if (Array.isArray(value.projects)) out.projects = normalizeProjects(value.projects);
  if (Array.isArray(value.certifications)) out.certifications = normalizeCertifications(value.certifications);
  if (value.sectionVisibility && typeof value.sectionVisibility === "object") {
    out.sectionVisibility = normalizeSectionVisibility(value.sectionVisibility);
  }
  if (value.sectionSubtitles && typeof value.sectionSubtitles === "object") {
    out.sectionSubtitles = normalizeSectionSubtitles(value.sectionSubtitles);
  }
  if (typeof value.resumeDataUrl === "string" && value.resumeDataUrl.trim()) {
    out.resumeDataUrl = value.resumeDataUrl.trim();
  }
  return out;
}

async function readStoreRawFromDatabase() {
  await ensureDatabaseSchema();
  const pool = getPool();
  if (!pool) return {};

  const result = await pool.query(
    "SELECT content FROM portfolio_content WHERE id = $1 LIMIT 1",
    [CONTENT_ROW_ID],
  );
  const current = result.rows.length > 0 ? toStoredObject(result.rows[0].content) : {};
  if (Object.keys(current).length > 0) return current;

  const seed = readStoreRawFromFile();
  if (Object.keys(seed).length === 0) return current;

  await pool.query(
    "UPDATE portfolio_content SET content = $1::jsonb, updated_at = NOW() WHERE id = $2",
    [JSON.stringify(seed), CONTENT_ROW_ID],
  );
  return seed;
}

async function readStoreRaw() {
  if (hasDatabase()) return readStoreRawFromDatabase();
  return readStoreRawFromFile();
}

export async function readContentStore() {
  const raw = await readStoreRaw();
  return normalizeStoredContent(raw);
}

async function writeContentToDatabase(patch) {
  await ensureDatabaseSchema();
  const pool = getPool();
  if (!pool) throw new Error("Database connection is not configured.");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "SELECT content FROM portfolio_content WHERE id = $1 FOR UPDATE",
      [CONTENT_ROW_ID],
    );
    const current = result.rows.length > 0 ? toStoredObject(result.rows[0].content) : {};
    const next = { ...current, ...patch };
    await client.query(
      `
        INSERT INTO portfolio_content (id, content, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
      `,
      [CONTENT_ROW_ID, JSON.stringify(next)],
    );
    await client.query("COMMIT");
    return next;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function writeContentStore(inputPatch) {
  const patch = sanitizePatch(inputPatch);
  if (hasDatabase()) {
    const next = await writeContentToDatabase(patch);
    return normalizeStoredContent(next);
  }

  const current = readStoreRawFromFile();
  const next = { ...current, ...patch };

  ensureStoreDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(next, null, 2), "utf8");
  return normalizeStoredContent(next);
}
