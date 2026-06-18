# Agent Tasks

Last updated: 2026-06-18

## Main Codex

Owner of integration and final state.

- Reads Obsidian memory at session start.
- Keeps implementation changes coherent.
- Runs build and local checks.
- Writes final handoff notes.
- Gives Cursor narrow review instructions only when the code is stable enough.

## DB Agent

Use for Supabase-only work.

- Migration SQL.
- Seed SQL / CSV shape.
- RLS recommendations.
- PostGIS and pgvector notes.

Do not assign UI or frontend files to this agent.

## UI Agent

Use for layout and page-structure suggestions.

- Page list.
- Component boundaries.
- Image mock prompts.
- Cursor QA instructions.

Do not assign schema or pipeline files to this agent.

## Pipeline Agent

Use after the first web build passes.

- Python extraction skeleton.
- Gemini structured JSON prompt.
- Geocoding / Places API interfaces.
- GitHub Actions workflow.

Do not run production scraping in the MVP phase.

## Cursor Role

Cursor should be used after Codex has a buildable version.

Good Cursor tasks:

- Review generated diffs.
- Fix small styling issues.
- Adjust copy and spacing.
- Pinpoint TypeScript or lint errors.

Avoid asking Cursor to:

- Rewrite the architecture.
- Change the database schema.
- Add Stripe/Auth before the MVP is stable.
- Refactor multiple areas at once.
