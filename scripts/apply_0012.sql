-- Admin CMS support for nearby food management.

drop view if exists public.admin_nearby_foods;

create view public.admin_nearby_foods
with (security_invoker = true)
as
select
  nearby_foods.*,
  case
    when nearby_foods.geom is null then null
    else st_y(nearby_foods.geom::geometry)
  end as latitude,
  case
    when nearby_foods.geom is null then null
    else st_x(nearby_foods.geom::geometry)
  end as longitude,
  spots.title as spot_title,
  spots.slug as spot_slug
from public.nearby_foods
join public.spots on spots.id = nearby_foods.spot_id;

revoke all on public.admin_nearby_foods from public, anon, authenticated;
grant select on public.admin_nearby_foods to service_role;

create or replace function public.admin_upsert_food_geom(
  p_id uuid,
  p_lat double precision,
  p_lng double precision
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.nearby_foods
  set geom = case
    when p_lat is null or p_lng is null then null
    else st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
  end
  where id = p_id;
$$;

revoke all on function public.admin_upsert_food_geom(uuid, double precision, double precision) from public;
grant execute on function public.admin_upsert_food_geom(uuid, double precision, double precision) to service_role;
