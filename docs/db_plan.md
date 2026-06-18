# MadPilgrim MVP DB/Backend Draft

Scope: MVP DB draft only. Keep implementation limited to `spots`, `nearby_foods`, seed data, Supabase migration, and frontend type policy. Do not store secrets in repo.

## 1. MVP tables

### Create now

- `spots`: main pilgrimage/location records for map pins, SEO pages, and detail pages.
- `nearby_foods`: restaurants/cafes near a spot, sourced manually for MVP or later from Google Places.

### Defer/delete from MVP

- `user_reviews`: defer until auth/community features exist.
- `pilgrimage_routes`: defer until route generation UX exists.
- `sponsored_listings`: defer until monetization workflow exists.
- Any crawler/LLM job tables: defer. For MVP, import seed files manually or via a one-off script.

## 2. Migration SQL approach

Use Supabase PostgreSQL with:

- `postgis` for location queries.
- `vector` for future semantic duplicate detection/search.
- `pgcrypto` for `gen_random_uuid()`.
- RLS enabled with public read policies only.

The proposed SQL lives in `supabase/migrations/0001_initial.sql`.

Notes:

- `geom` uses `geography(Point, 4326)` so distance queries can use meters.
- `embedding vector(1536)` is nullable in MVP so manual seed data does not need embeddings.
- Status/category/source are constrained with `check` constraints instead of enum types to keep iteration cheap.
- `updated_at` is maintained with a shared trigger.
- Sponsored food ordering is supported directly on `nearby_foods` through `is_sponsored` and `sponsor_rank`; no separate sponsorship table in MVP.

## 3. Seed CSV/JSON minimum columns

### `spots` minimum seed columns

```csv
slug,title,category,spot_name,latitude,longitude,description_ja,description_en,seo_title_ja,seo_title_en,visit_tips_ja,scene_timestamp,confidence_score,source_type,status,og_image_url
```

Required minimum for import: `slug`, `title`, `category`, `spot_name`, `latitude`, `longitude`.

Recommended JSON shape:

```json
{
  "slug": "example-work-shibuya-crossing",
  "title": "Example Work",
  "category": "anime",
  "spot_name": "Shibuya Scramble Crossing",
  "latitude": 35.6595,
  "longitude": 139.7005,
  "description_ja": "",
  "description_en": "",
  "seo_title_ja": "",
  "seo_title_en": "",
  "visit_tips_ja": "",
  "scene_timestamp": "",
  "confidence_score": 0.8,
  "source_type": "official",
  "status": "approved",
  "og_image_url": ""
}
```

### `nearby_foods` minimum seed columns

```csv
spot_slug,place_id,name,category,latitude,longitude,address,rating,price_level,google_maps_url,website_url,description_ja,description_en,is_sponsored,sponsor_rank,last_synced_at
```

Required minimum for import: `spot_slug`, `name`. Add `latitude` and `longitude` when available.

`spot_slug` should be resolved to `spots.id` in the import script. Do not put raw service API keys or private Places payloads into seed files.

## 4. RLS policy for MVP

MVP should be read-only from the browser:

- Enable RLS on both tables.
- Allow anonymous and authenticated `select` only for public rows.
- `spots`: public rows are `status in ('ai_suggested', 'approved')`.
- `nearby_foods`: public rows are visible only when their parent spot is public.
- No browser-side `insert`, `update`, or `delete` policies in MVP.

Writes should happen only through:

- Supabase dashboard/import during MVP, or
- a server-side seed/admin script using `SUPABASE_SERVICE_ROLE_KEY` stored in local/Vercel env, never committed.

## 5. Type definition policy

For MVP, generate Supabase types after migration:

```bash
supabase gen types typescript --project-id <project-id> --schema public > src/types/supabase.ts
```

Then create small app-facing types manually, for example `SpotListItem`, `SpotDetail`, and `NearbyFood`, instead of exposing full DB rows everywhere. Frontend should read `latitude`/`longitude` from helper query aliases or compute from PostGIS server-side; avoid parsing `geom` in UI components.

## 6. Implementation notes for main Codex

- Keep seed import idempotent by upserting `spots.slug` and `nearby_foods.place_id` when present.
- If `place_id` is unknown, dedupe foods by `(spot_id, lower(name), address)`.
- For map APIs, fetch only `status in ('ai_suggested', 'approved')`; hide `unverified` and `hidden`.
- Use `ST_DWithin(nearby_foods.geom, spots.geom, 500)` for nearby queries when both geoms exist.
- If a frontend query needs coordinates, expose `ST_Y(geom::geometry) as latitude` and `ST_X(geom::geometry) as longitude` via SQL view/RPC later, or map in the server layer.
- Do not add auth/community/revenue tables during the 3-day MVP unless the main implementation already depends on them.
