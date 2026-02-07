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
- `DATABASE_SSL`: `true` when your Postgres requires SSL, otherwise `false`

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

## Northflank + Postgres deploy

### 1. Create project (screen you shared)

1. Open Northflank `Projects` and click `Create new`.
2. Enter project name, keep `Northflank Cloud`, choose region, and create.

### 2. Link Git provider

1. In your team/project, open `Integrations`.
2. Connect GitHub and allow access to the repository that contains this app.

### 3. Add Postgres

1. Inside project, click `Create new` -> `Addon`.
2. Choose `PostgreSQL` and create it in the same project/region.
3. Open the addon and copy its connection env var (`DATABASE_URL`).

### 4. Create web service

1. Click `Create new` -> `Service`.
2. Select your GitHub repo and branch.
3. Configure:
   - Runtime: Node.js
   - Build command: `npm ci && npm run build`
   - Start command: `npm run start`
   - Port: use default `PORT` from Northflank (already supported by `server.js`)

### 5. Set environment variables in service

Add:

- `ADMIN_PIN` = your admin passcode
- `ADMIN_SESSION_SECRET` = long random secret (at least 32 chars)
- `DATABASE_URL` = value from Postgres addon
- `DATABASE_SSL` = `false` for internal Northflank network, `true` only if your DB endpoint requires TLS

### 6. Deploy and verify

1. Trigger deploy.
2. Open your service domain.
3. Visit `https://your-domain/#/admin`.
4. Unlock with `ADMIN_PIN`.
5. Edit a section, save, refresh page, confirm data persists.

### 7. Optional first backup after deploy

Run in a local shell with the same production `DATABASE_URL`:

```bash
npm run db:backup
```
