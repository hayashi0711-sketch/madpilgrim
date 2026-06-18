# MAD Pilgrim MVP Scope

Last updated: 2026-06-18

## Goal

Build a 3-day MVP web site that proves the core loop:

1. A visitor opens a map of pilgrimage / filming spots.
2. They filter or inspect a spot.
3. They land on an SEO-ready spot detail page.
4. They see nearby food recommendations.

## In Scope

- Next.js App Router web app.
- TypeScript.
- Tailwind CSS.
- Locale-prefixed routes for `ja` and `en`.
- Sample data stored in code for local MVP.
- Supabase schema and seed SQL.
- Map page with spot pins and filters.
- Spot detail pages with metadata and JSON-LD.
- Nearby foods section.
- Python pipeline skeleton for later Gemini / Geocoding / Places integration.
- Cursor handoff instructions for visual QA and small fixes.

## Out of Scope For 3-Day MVP

- Supabase Auth.
- Stripe.
- User reviews and photo uploads.
- Realtime pin streaming.
- Production scraping at scale.
- Full Korean / Chinese UI.
- Admin moderation UI.
- Live Google Places sync.
- AdSense integration beyond placeholder slots.

## Success Criteria

- `npm run build` passes.
- `/ja` shows the map experience.
- `/ja/spots/jujutsu-kaisen-shibuya-scramble` renders a detail page.
- `/en/spots/jujutsu-kaisen-shibuya-scramble` renders English content.
- Supabase migration can be pasted into Supabase SQL editor.
- The handoff notes explain what Codex owns and what Cursor should review.

## 3-Day Plan

### Day 1

- Create project docs and app scaffold.
- Implement sample-data map, spot detail, and food cards.
- Create Supabase migration and seed.
- Confirm local build.

### Day 2

- Add Mapbox token path and improve map behavior.
- Add more seed records.
- Add Python pipeline skeleton with Gemini JSON validation shape.
- Add GitHub Actions manual workflow.

### Day 3

- Visual QA in browser.
- Cursor pass for Tailwind refinements and small TypeScript fixes.
- Prepare Vercel / Supabase environment checklist.
- Update Obsidian current state and handoff.
