-- Add optional official YouTube embed fields to spots.
-- These are populated only after manual human confirmation that the URL
-- points to an official/rights-holder channel. No automated publishing.
alter table public.spots
  add column if not exists youtube_url text,
  add column if not exists youtube_channel_name text;

drop function if exists public.upsert_spot_candidate_v2(
  text, text, text, text, double precision, double precision, text, text, text,
  text, text, text, text, text, text, text, double precision, text, text, text,
  text, text, text, integer, text
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
  p_scene_number text default null,
  p_youtube_url text default null,
  p_youtube_channel_name text default null
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
    scene_number,
    youtube_url,
    youtube_channel_name
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
    p_scene_number,
    p_youtube_url,
    p_youtube_channel_name
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
    youtube_url = excluded.youtube_url,
    youtube_channel_name = excluded.youtube_channel_name,
    updated_at = now()
  returning id into v_spot_id;

  return v_spot_id;
end;
$$;

revoke all on function public.upsert_spot_candidate_v2(
  text, text, text, text, double precision, double precision, text, text, text,
  text, text, text, text, text, text, text, double precision, text, text, text,
  text, text, text, integer, text, text, text
) from public;

grant execute on function public.upsert_spot_candidate_v2(
  text, text, text, text, double precision, double precision, text, text, text,
  text, text, text, text, text, text, text, double precision, text, text, text,
  text, text, text, integer, text, text, text
) to service_role;

-- Expose the new columns on the public view (approved spots only).
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
  created_at,
  updated_at
from public.spots
where status = 'approved';

grant select on public.public_spots to anon, authenticated;
