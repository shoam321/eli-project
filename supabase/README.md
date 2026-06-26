# Supabase Recovery Setup

This repo now contains the missing first-pass schema for the restored iLab web workspace.

## What To Run

1. Open your Supabase project.
2. Go to SQL Editor.
3. Run the migration from [supabase/migrations/20260624_001_init_ilab_schema.sql](./migrations/20260624_001_init_ilab_schema.sql).
4. In Supabase Authentication, enable Email provider if you want app logins.
5. Create at least one user account in Supabase Auth.
6. Add the missing `SUPABASE_SERVICE_ROLE_KEY` to Vercel production and to local `.env.local`.

## Why The Site Is Still In Local Recovery Mode

The web UI is currently storing data in browser storage because:

1. The legacy API is offline.
2. The app had Supabase connection helpers but no applied business schema.
3. The production environment does not currently expose `SUPABASE_SERVICE_ROLE_KEY` for server-side admin operations.

## Import Existing Local Workspace Data

1. Open the deployed site.
2. Go to `/settings`.
3. Export the workspace JSON snapshot.
4. Find the target Supabase Auth user ID.
5. Run:

```powershell
node scripts/import-workspace-to-supabase.cjs <auth-user-id> <path-to-exported-json>
```

Example:

```powershell
node scripts/import-workspace-to-supabase.cjs 11111111-2222-3333-4444-555555555555 .\ilab-workspace-2026-06-24.json
```

## After The Schema Exists

The next code step is to replace the browser-local persistence layer in [src/lib/workspace-data.ts](../src/lib/workspace-data.ts) with real reads and writes through server routes or direct authenticated Supabase queries.