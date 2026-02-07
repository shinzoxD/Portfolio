import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const CONTENT_ROW_ID = 1;

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  return typeof value === "string" ? value.trim() : "";
}

function isDatabaseSslEnabled() {
  const value = process.env.DATABASE_SSL;
  if (typeof value !== "string") return false;
  const clean = value.trim().toLowerCase();
  return clean === "1" || clean === "true" || clean === "yes";
}

function getFirstPositionalArg() {
  const args = process.argv.slice(2);
  for (const token of args) {
    if (!token.startsWith("-")) return token;
  }
  return "";
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

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function findLatestBackupFile() {
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) return "";
  const candidates = fs
    .readdirSync(backupDir)
    .filter((name) => name.startsWith("content-backup-") && name.endsWith(".json"))
    .sort();
  if (candidates.length === 0) return "";
  return path.join(backupDir, candidates[candidates.length - 1]);
}

function readBackupContent(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!isObject(parsed)) throw new Error("Backup file must contain a JSON object.");
  const content = isObject(parsed.content) ? parsed.content : parsed;
  if (!isObject(content)) throw new Error("Backup content is invalid.");
  return content;
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

async function writePreRestoreBackup(currentContent) {
  const dir = path.join(process.cwd(), "backups");
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  const outPath = path.join(dir, `pre-restore-${formatStamp(now)}.json`);
  const payload = {
    schema: "portfolio-content-backup-v1",
    exportedAt: now.toISOString(),
    source: "portfolio_content",
    rowId: CONTENT_ROW_ID,
    content: currentContent,
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  return outPath;
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    console.error("DATABASE_URL is required to run db restore.");
    process.exit(1);
  }

  const positional = getFirstPositionalArg();
  const filePath = positional
    ? path.resolve(process.cwd(), positional)
    : findLatestBackupFile();
  if (!filePath) {
    console.error("No backup file found. Pass a file path or create a backup first.");
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error(`Backup file not found: ${filePath}`);
    process.exit(1);
  }

  const restoreContent = readBackupContent(filePath);
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isDatabaseSslEnabled() ? { rejectUnauthorized: false } : false,
  });

  try {
    await ensureSchema(pool);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "SELECT content FROM portfolio_content WHERE id = $1 FOR UPDATE",
        [CONTENT_ROW_ID],
      );
      const currentContent = isObject(result.rows[0]?.content) ? result.rows[0].content : {};
      const preBackupPath = await writePreRestoreBackup(currentContent);

      await client.query(
        `
          INSERT INTO portfolio_content (id, content, updated_at)
          VALUES ($1, $2::jsonb, NOW())
          ON CONFLICT (id)
          DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
        `,
        [CONTENT_ROW_ID, JSON.stringify(restoreContent)],
      );
      await client.query("COMMIT");

      console.log(`Restore source: ${filePath}`);
      console.log(`Pre-restore backup: ${preBackupPath}`);
      console.log("Database restore completed.");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Restore failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exit(1);
});
