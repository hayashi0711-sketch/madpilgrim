-- Separate "dish name" from "venue name" for the food-on-screen panel.

alter table public.nearby_foods
  add column if not exists dish_name text;

drop view if exists public.public_nearby_foods;

create view public.public_nearby_foods
with (security_invoker = true)
as
select
  nearby_foods.id::text,
  spots.slug as spot_slug,
  nearby_foods.place_id,
  nearby_foods.name,
  nearby_foods.dish_name,
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

grant select on public.public_nearby_foods to anon, authenticated;
