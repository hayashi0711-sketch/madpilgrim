-- Admin CMS support: featured-spot flag + editable site copy table.

alter table public.spots
  add column if not exists is_featured boolean not null default false;

create table if not exists public.site_copy (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('ja', 'en')),
  key text not null,
  value text not null,
  updated_at timestamptz default now(),
  unique (locale, key)
);

drop trigger if exists set_site_copy_updated_at on public.site_copy;
create trigger set_site_copy_updated_at
  before update on public.site_copy
  for each row
  execute function public.set_updated_at();

alter table public.site_copy enable row level security;
-- No public policies: only the service role (admin server actions, server components) reads/writes this table.

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
  created_at,
  updated_at
from public.spots
where status = 'approved';

grant select on public.public_spots to anon, authenticated;

-- Admin-only view: all spots regardless of status, with lat/lng extracted for editing.
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

create or replace function public.admin_update_spot_geom(
  p_id uuid,
  p_lat double precision,
  p_lng double precision
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.spots
  set geom = st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography
  where id = p_id;
$$;

revoke all on function public.admin_update_spot_geom(uuid, double precision, double precision) from public;
grant execute on function public.admin_update_spot_geom(uuid, double precision, double precision) to service_role;
