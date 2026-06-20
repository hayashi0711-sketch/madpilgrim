-- Add the selectable image type used by the "food on screen" panel.

alter table public.spots
  add column if not exists food_image_type text;

alter table public.spots
  drop constraint if exists spots_food_image_type_check;

alter table public.spots
  add constraint spots_food_image_type_check
  check (
    food_image_type is null
    or food_image_type in ('washoku', 'yoshoku', 'chuka', 'sweets', 'gourmet', 'location')
  );

drop view if exists public.public_spots;

create view public.public_spots
with (security_invoker = true)
as
select
  id::text,
  title,
  title_en,
  category,
  spot_name,
  spot_name_en,
  slug,
  prefecture,
  city,
  st_y(geom::geometry) as latitude,
  st_x(geom::geometry) as longitude,
  description_ja,
  description_en,
  description_ko,
  description_zh,
  seo_title_ja,
  seo_title_en,
  visit_tips_ja,
  visit_tips_en,
  scene_timestamp,
  scene_timestamp_en,
  scene_number,
  broadcaster,
  release_year,
  confidence_score,
  source_type,
  status,
  og_image_url,
  youtube_url,
  youtube_channel_name,
  is_featured,
  food_image_type,
  created_at,
  updated_at
from public.spots
where status = 'approved';

grant select on public.public_spots to anon, authenticated;

-- SELECT spots.* is expanded when a view is created, so recreate the admin view too.
drop view if exists public.admin_spots;

create view public.admin_spots
with (security_invoker = true)
as
select
  spots.*,
  st_y(geom::geometry) as latitude,
  st_x(geom::geometry) as longitude
from public.spots;

grant select on public.admin_spots to service_role;
