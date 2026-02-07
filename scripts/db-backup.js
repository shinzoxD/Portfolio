import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const CONTENT_ROW_ID = 1;

function getArg(name, shortName) {
  const args = process.argv.slice(2);
  const longForm = `${name}=`;
  const shortForm = `${shortName}=`;

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (token === name || token === shortName) {
      return args[i + 1] || "";
    }
    if (token.startsWith(longForm)) return token.slice(longForm.length);
    if (token.startsWith(shortForm)) return token.slice(shortForm.length);
  }
  return "";
}

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  return typeof value === "string" ? value.trim() : "";
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

function formatStamp(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}-${h}${min}${s}Z`;
}

async function ensureSchema(pool) {
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
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.error("DATABASE_URL is required to run db backup.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isDatabaseSslEnabled() ? { rejectUnauthorized: false } : false,
  });

  try {
    await ensureSchema(pool);
    const result = await pool.query(
      "SELECT content, updated_at FROM portfolio_content WHERE id = $1 LIMIT 1",
      [CONTENT_ROW_ID],
    );
    const row = result.rows[0] || {};
    const content =
      row && row.content && typeof row.content === "object" && !Array.isArray(row.content)
        ? row.content
        : {};

    const now = new Date();
    const outPathArg = getArg("--out", "-o");
    const defaultPath = path.join(
      process.cwd(),
      "backups",
      `content-backup-${formatStamp(now)}.json`,
    );
    const outPath = outPathArg ? path.resolve(process.cwd(), outPathArg) : defaultPath;
    const outDir = path.dirname(outPath);
    fs.mkdirSync(outDir, { recursive: true });

    const payload = {
      schema: "portfolio-content-backup-v1",
      exportedAt: now.toISOString(),
      source: "portfolio_content",
      rowId: CONTENT_ROW_ID,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
      content,
    };

    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
    console.log(`Backup written: ${outPath}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Backup failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exit(1);
});
