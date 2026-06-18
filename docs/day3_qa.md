# Day 3 QA Notes

Last updated: 2026-06-18

## Verified By Codex

Build:

```powershell
npm run build
```

Passed.

Pipeline dry-run:

```powershell
C:\Users\Haruki\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe scripts\pipeline_demo.py --input scripts\sample_sources.json --dry-run
```

Passed.

Browser routes:

- `/ja`
- `/ja/spots/steins-gate-akihabara-radio-kaikan`
- `/ja/foods/steins-gate-akihabara-radio-kaikan`

All returned HTTP 200.

Responsive checks:

- Desktop 1280px: no horizontal overflow detected.
- Mobile 375px: no horizontal overflow detected.

Navigation checks:

- Home detail link opens `/ja/spots/steins-gate-akihabara-radio-kaikan`.
- Detail page food link opens `/ja/foods/steins-gate-akihabara-radio-kaikan`.
- Detail page language switch opens `/en/spots/steins-gate-akihabara-radio-kaikan`.

## Local Run

Port 3000 is already used on this machine, so use 3002:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3002
```

Open:

```text
http://127.0.0.1:3002/ja
```

## Remaining Manual QA

- Visual polish in a real browser.
- Mapbox live rendering after adding `NEXT_PUBLIC_MAPBOX_TOKEN`.
- Supabase migration execution against a real Supabase project.
- Optional Cursor review using `docs/cursor_handoff.md`.
