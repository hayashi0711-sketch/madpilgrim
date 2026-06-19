-- Restrict public spot data to approved records only.

drop policy if exists "Public can read visible spots" on public.spots;
create policy "Public can read visible spots"
  on public.spots for select
  using (status = 'approved');

drop policy if exists "Public can read foods for visible spots" on public.nearby_foods;
create policy "Public can read foods for visible spots"
  on public.nearby_foods for select
  using (
    exists (
      select 1
      from public.spots
      where spots.id = nearby_foods.spot_id
      and spots.status = 'approved'
    )
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
  created_at,
  updated_at
from public.spots
where status = 'approved';

drop view if exists public.public_nearby_foods;

create view public.public_nearby_foods
with (security_invoker = true)
as
select
  nearby_foods.id::text,
  spots.slug as spot_slug,
  nearby_foods.place_id,
  nearby_foods.name,
  nearby_foods.category,
  case
    when nearby_foods.geom is null then null
    else st_y(nearby_foods.geom::geometry)
  end as latitude,
  case
    when nearby_foods.geom is null then null
    else st_x(nearby_foods.geom::geometry)
  end as longitude,
  nearby_foods.address,
  nearby_foods.rating,
  nearby_foods.price_level,
  nearby_foods.opening_hours,
  nearby_foods.photo_reference,
  nearby_foods.website_url,
  nearby_foods.google_maps_url,
  nearby_foods.description_ja,
  nearby_foods.description_en,
  nearby_foods.description_ko,
  nearby_foods.description_zh,
  nearby_foods.tags,
  nearby_foods.is_sponsored,
  nearby_foods.sponsor_rank,
  nearby_foods.last_synced_at,
  nearby_foods.created_at
from public.nearby_foods
join public.spots on spots.id = nearby_foods.spot_id
where spots.status = 'approved';

grant select on public.public_spots to anon, authenticated;
grant select on public.public_nearby_foods to anon, authenticated;
