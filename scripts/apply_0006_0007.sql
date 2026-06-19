-- Manual production migration bundle for Supabase Dashboard > SQL Editor.
-- Applies 0006_gemini_import_pipeline.sql, then
-- 0007_restrict_public_spots_to_approved.sql as one transaction.

begin;

-- ============================================================================
-- 0006_gemini_import_pipeline.sql
-- ============================================================================

-- Extend the Gemini import RPC with broadcast metadata.
drop function if exists public.upsert_spot_candidate_v2(
  text, text, text, text, double precision, double precision, text, text, text,
  text, text, text, text, text, text, text, double precision, text, text, text,
  text, text
);

create function public.upsert_spot_candidate_v2(
  p_slug text,
  p_title text,
  p_category text,
  p_spot_name text,
  p_latitude double precision,
  p_longitude double precision,
  p_title_en text default null,
  p_spot_name_en text default null,
  p_description_ja text default null,
  p_description_en text default null,
  p_seo_title_ja text default null,
  p_seo_title_en text default null,
  p_visit_tips_ja text default null,
  p_visit_tips_en text default null,
  p_scene_timestamp text default null,
  p_scene_timestamp_en text default null,
  p_confidence_score double precision default 0.5,
  p_source_type text default 'inferred',
  p_status text default 'ai_suggested',
  p_prefecture text default null,
  p_city text default null,
  p_og_image_url text default null,
  p_broadcaster text default null,
  p_release_year integer default null,
  p_scene_number text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_spot_id uuid;
begin
  if p_slug is null or length(trim(p_slug)) = 0 then
    raise exception 'slug is required';
  end if;

  if p_latitude is null or p_longitude is null then
    raise exception 'latitude and longitude are required';
  end if;

  insert into public.spots (
    slug,
    title,
    title_en,
    category,
    spot_name,
    spot_name_en,
    prefecture,
    city,
    geom,
    description_ja,
    description_en,
    seo_title_ja,
    seo_title_en,
    visit_tips_ja,
    visit_tips_en,
    scene_timestamp,
    scene_timestamp_en,
    confidence_score,
    source_type,
    status,
    og_image_url,
    broadcaster,
    release_year,
    scene_number
  )
  values (
    p_slug,
    p_title,
    p_title_en,
    p_category,
    p_spot_name,
    p_spot_name_en,
    p_prefecture,
    p_city,
    st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography,
    p_description_ja,
    p_description_en,
    p_seo_title_ja,
    p_seo_title_en,
    p_visit_tips_ja,
    p_visit_tips_en,
    p_scene_timestamp,
    p_scene_timestamp_en,
    p_confidence_score,
    p_source_type,
    p_status,
    p_og_image_url,
    p_broadcaster,
    p_release_year,
    p_scene_number
  )
  on conflict (slug) do update set
    title = excluded.title,
    title_en = excluded.title_en,
    category = excluded.category,
    spot_name = excluded.spot_name,
    spot_name_en = excluded.spot_name_en,
    prefecture = excluded.prefecture,
    city = excluded.city,
    geom = excluded.geom,
    description_ja = excluded.description_ja,
    description_en = excluded.description_en,
    seo_title_ja = excluded.seo_title_ja,
    seo_title_en = excluded.seo_title_en,
    visit_tips_ja = excluded.visit_tips_ja,
    visit_tips_en = excluded.visit_tips_en,
    scene_timestamp = excluded.scene_timestamp,
    scene_timestamp_en = excluded.scene_timestamp_en,
    confidence_score = excluded.confidence_score,
    source_type = excluded.source_type,
    status = excluded.status,
    og_image_url = excluded.og_image_url,
    broadcaster = excluded.broadcaster,
    release_year = excluded.release_year,
    scene_number = excluded.scene_number,
    updated_at = now()
  returning id into v_spot_id;

  return v_spot_id;
end;
$$;

revoke all on function public.upsert_spot_candidate_v2(
  text, text, text, text, double precision, double precision, text, text, text,
  text, text, text, text, text, text, text, double precision, text, text, text,
  text, text, text, integer, text
) from public;

grant execute on function public.upsert_spot_candidate_v2(
  text, text, text, text, double precision, double precision, text, text, text,
  text, text, text, text, text, text, text, double precision, text, text, text,
  text, text, text, integer, text
) to service_role;

-- Keep the database category constraint aligned with the application type.
alter table public.spots
  drop constraint if exists spots_category_check;

alter table public.spots
  add constraint spots_category_check
  check (category in ('anime', 'mv', 'drama', 'movie', 'cm', 'manga'));

-- Upsert one nearby food venue for a spot.
create or replace function public.upsert_nearby_food(
  p_spot_id uuid,
  p_name text,
  p_category text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_address text default null,
  p_price_level integer default null,
  p_description_ja text default null,
  p_description_en text default null,
  p_tags text[] default '{}',
  p_google_maps_url text default null,
  p_is_sponsored boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_food_id uuid;
begin
  if p_spot_id is null then
    raise exception 'spot_id is required';
  end if;

  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name is required';
  end if;

  if p_price_level is not null and p_price_level not between 1 and 4 then
    raise exception 'price_level must be between 1 and 4';
  end if;

  select id into v_food_id
  from public.nearby_foods
  where spot_id = p_spot_id
    and name = p_name
  order by created_at
  limit 1;

  if v_food_id is null then
    insert into public.nearby_foods (
      spot_id,
      name,
      category,
      geom,
      address,
      price_level,
      description_ja,
      description_en,
      tags,
      google_maps_url,
      is_sponsored,
      last_synced_at
    )
    values (
      p_spot_id,
      p_name,
      p_category,
      case
        when p_latitude is null or p_longitude is null then null
        else st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography
      end,
      p_address,
      p_price_level,
      p_description_ja,
      p_description_en,
      coalesce(p_tags, '{}'),
      p_google_maps_url,
      coalesce(p_is_sponsored, false),
      now()
    )
    returning id into v_food_id;
  else
    update public.nearby_foods set
      category = p_category,
      geom = case
        when p_latitude is null or p_longitude is null then geom
        else st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography
      end,
      address = p_address,
      price_level = p_price_level,
      description_ja = p_description_ja,
      description_en = p_description_en,
      tags = coalesce(p_tags, '{}'),
      google_maps_url = p_google_maps_url,
      is_sponsored = coalesce(p_is_sponsored, false),
      last_synced_at = now()
    where id = v_food_id;
  end if;

  return v_food_id;
end;
$$;

revoke all on function public.upsert_nearby_food(
  uuid, text, text, double precision, double precision, text, integer, text,
  text, text[], text, boolean
) from public;

grant execute on function public.upsert_nearby_food(
  uuid, text, text, double precision, double precision, text, integer, text,
  text, text[], text, boolean
) to service_role;

-- ============================================================================
-- 0007_restrict_public_spots_to_approved.sql
-- ============================================================================

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

commit;
