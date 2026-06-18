# Day 2 Pipeline Notes

Last updated: 2026-06-18

## Purpose

Day 2 prepares the data pipeline without spending external API credits.

The current script:

- Reads source records from `scripts/sample_sources.json`.
- Simulates Gemini structured extraction.
- Applies safety and confidence validation.
- Assigns publication status.
- Adds deterministic placeholder coordinates.
- Adds placeholder nearby food records.
- Reports whether Gemini, Google Maps, and Supabase env vars are present.

## Command

```powershell
C:\Users\Haruki\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\pipeline_demo.py --input scripts\sample_sources.json --dry-run
```

Write the same dry-run output to a temporary file:

```powershell
C:\Users\Haruki\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\pipeline_demo.py --input scripts\sample_sources.json --dry-run --output pipeline-output.local.json
```

## Next Integration Points

1. Replace `simulate_gemini_extract` with a Gemini API call using `scripts/pipeline_prompt.txt`.
2. Replace `geocode_placeholder` with Google Maps Geocoding API.
3. Replace `places_placeholder` with Google Places nearby search.
4. Replace the deterministic source list with real collection targets.

The migration includes admin-oriented RPCs used by the ingestion script:

- `public.upsert_spot_candidate(...)`
- `public.upsert_nearby_food_candidate(...)`

They are revoked from `public`; call them only from the trusted server-side script or GitHub Actions using service-role credentials.

## Supabase Ingestion

Preview validated records without network access:

```powershell
C:\Users\Haruki\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\supabase_ingest.py --input pipeline-output.local.json
```

After the migration has been applied and `.env.local` contains the Supabase URL
and service-role key, explicitly commit:

```powershell
C:\Users\Haruki\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\supabase_ingest.py --input pipeline-output.local.json --commit
```

The default is preview mode. No data is written unless `--commit` is present.

## Secret Handling

Real values belong in local environment variables or GitHub Actions secrets:

- `GEMINI_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not write real values into Obsidian or the repository.
