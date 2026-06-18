# Mapbox and Supabase Setup

Last updated: 2026-06-18

## Environment File

Create `.env.local` from `.env.example`.

```powershell
Copy-Item .env.example .env.local
```

Fill only the values you need. Do not commit `.env.local`.

## Mapbox

Set:

```text
NEXT_PUBLIC_MAPBOX_TOKEN=
```

For local QA, use:

```text
http://localhost:3003
```

The current local setup uses the account's default public token. Before public
deployment, create a dedicated token with only `styles:tiles`, `styles:read`,
and `fonts:read`, then restrict it to the production domain.

Mapbox GL JS map-load cost guardrail:

- The map is initialized only on the list page.
- One page visit creates one map instance.
- Category and approval filters update markers without recreating the map.
- Detail and nearby-food pages do not initialize Mapbox.

Then run:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3002
```

Open `/ja` and confirm the fallback map is replaced by a live Mapbox map.

## Supabase

The current local setup can reuse the existing MAD about U Supabase project.
This shares one Supabase project but keeps MadPilgrim data in separate tables.

1. Open the existing Supabase project.
2. Open the SQL editor.
3. Run:

```text
supabase/migrations/0001_initial.sql
supabase/migrations/0002_spot_localized_names.sql
```

This creates the MVP tables plus read-friendly views:

- `public_spots`
- `public_nearby_foods`

It also creates a trusted-ingestion RPC:

- `upsert_spot_candidate(...)`
- `upsert_nearby_food_candidate(...)`

The Next.js app reads those views when Supabase env vars are present, and falls back to static sample data when they are absent or empty.

4. Run seed data if desired:

```text
supabase/seed.sql
```

5. Add browser-readable values to `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

6. Keep service role server-side only:

```text
SUPABASE_SERVICE_ROLE_KEY=
```

7. Verify the public read path:

```powershell
C:\Users\Haruki\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\check_supabase.py
```

## Pipeline API Keys

For Day 3/4 real pipeline integration, store locally or in GitHub Actions secrets:

```text
GEMINI_API_KEY=
GOOGLE_MAPS_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not write real values into Obsidian or committed files.

## Ingestion Check

Generate and preview the current deterministic candidates:

```powershell
C:\Users\Haruki\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\pipeline_demo.py --input scripts\sample_sources.json --dry-run --output pipeline-output.local.json
C:\Users\Haruki\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\supabase_ingest.py --input pipeline-output.local.json
```

Only after the migration and secrets are ready, add `--commit` to the second command.

## Reproducible MVP Seed

The five reviewed MVP spot records and six provisional nearby food records live
in `scripts/mvp_seed.json`.

Preview:

```powershell
C:\Users\Haruki\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\supabase_ingest.py --input scripts\mvp_seed.json
```

Commit:

```powershell
C:\Users\Haruki\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\supabase_ingest.py --input scripts\mvp_seed.json --commit
```

Nearby food names are provisional MVP content and should be replaced with
verified Google Places results before public launch.
