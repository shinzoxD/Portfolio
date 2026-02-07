# Nishchaya Sharma - Portfolio

Single-page React app built with Vite and Tailwind CSS.

## Setup

```bash
npm install
```

Create a local env file:

```bash
copy .env.example .env.local
```

Set these values in `.env.local` and in your hosting provider secrets:

- `ADMIN_PIN`: passcode used to unlock admin panel
- `ADMIN_SESSION_SECRET`: long random value used to sign admin session cookie
- `DATABASE_URL`: Postgres connection string
- `DATABASE_SSL`: `true` for Neon and most managed Postgres services

The PIN is now validated on server-side routes (`/api/admin/*`), so it is not bundled in client JS.
After you change `.env.local`, restart `npm run dev`.

## Dev

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production start

```bash
npm run build
npm run start
```

## Verify

```bash
npm run verify
```

## Admin + storage

- Admin unlock uses server session cookie (`HttpOnly`) via `/api/admin/login`.
- Open the full admin page at `#/admin`.
- Admin can edit intro, about, skills, experience, education, projects, certifications, resume, and section visibility.
- With `DATABASE_URL` set, admin edits are stored in Postgres.
- Without `DATABASE_URL`, the app falls back to `server-data/content.json`.

## Database backup and restore

Run these from your project root with `DATABASE_URL` set:

```bash
npm run db:backup
```

- Creates a timestamped backup in `backups/content-backup-YYYYMMDD-HHMMSSZ.json`.
- Optional custom output path:

```bash
npm run db:backup -- --out backups/my-manual-backup.json
```

Restore the latest backup:

```bash
npm run db:restore
```

Restore a specific backup file:

```bash
npm run db:restore -- backups/content-backup-20260207-120000Z.json
```

- Before every restore, a safety snapshot is auto-created at `backups/pre-restore-*.json`.

## Hugging Face Spaces + Neon deploy

### 1. Create Neon database

1. In Neon, create a project and database.
2. Copy the pooled connection string.
3. Keep SSL mode enabled in the URL.

### 2. Create Hugging Face Docker Space

1. In Hugging Face, click `New Space`.
2. Select `Docker` SDK.
3. Create the Space from your GitHub repo or upload this project files.

### 3. Set Space secrets

In Space settings -> `Variables and secrets`, add:

 - `ADMIN_PIN`
 - `ADMIN_SESSION_SECRET`
 - `DATABASE_URL` (from Neon)
 - `DATABASE_SSL=true`

### 4. Deploy and verify

1. Hugging Face will build using the included `Dockerfile`.
2. Open your Space URL.
3. Go to `https://<your-space-url>/#/admin`.
4. Unlock with `ADMIN_PIN`.
5. Save a change, refresh, and confirm it persists.

### 5. Optional first backup after deploy

Run locally with production Neon `DATABASE_URL`:

```bash
npm run db:backup
```
