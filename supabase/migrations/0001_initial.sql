create extension if not exists postgis;
create extension if not exists vector;
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.spots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('anime', 'mv', 'drama', 'movie', 'cm')),
  spot_name text not null,
  slug text unique not null,
  prefecture text,
  city text,
  geom geography(point, 4326) not null,
  description_ja text,
  description_en text,
  description_ko text,
  description_zh text,
  seo_title_ja varchar(255),
  seo_title_en varchar(255),
  visit_tips_ja text,
  visit_tips_en text,
  scene_timestamp varchar(80),
  embedding vector(1536),
  confidence_score float default 0.5 check (confidence_score >= 0 and confidence_score <= 1),
  source_type text check (source_type in ('official', 'fan', 'social', 'inferred')),
  status text default 'ai_suggested' check (status in ('unverified', 'ai_suggested', 'approved', 'hidden')),
  approve_count integer default 0,
  report_count integer default 0,
  view_count integer default 0,
  og_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.nearby_foods (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references public.spots(id) on delete cascade,
  place_id text,
  name text not null,
  category text,
  geom geography(point, 4326),
  address text,
  rating float,
  price_level integer,
  opening_hours jsonb,
  photo_reference text,
  website_url text,
  google_maps_url text,
  description_ja text,
  description_en text,
  description_ko text,
  description_zh text,
  tags text[] default '{}',
  is_sponsored boolean default false,
  sponsor_rank integer,
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists spots_geom_idx on public.spots using gist (geom);
create index if not exists nearby_foods_geom_idx on public.nearby_foods using gist (geom);
create index if not exists spots_embedding_idx on public.spots using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists spots_slug_idx on public.spots (slug);
create index if not exists nearby_foods_spot_id_idx on public.nearby_foods (spot_id);

drop trigger if exists set_spots_updated_at on public.spots;
create trigger set_spots_updated_at
  before update on public.spots
  for each row
  execute function public.set_updated_at();

alter table public.spots enable row level security;
alter table public.nearby_foods enable row level security;

drop policy if exists "Public can read visible spots" on public.spots;
create policy "Public can read visible spots"
  on public.spots for select
  using (status in ('ai_suggested', 'approved'));

drop policy if exists "Public can read foods for visible spots" on public.nearby_foods;
create policy "Public can read foods for visible spots"
  on public.nearby_foods for select
  using (
    exists (
      select 1
      from public.spots
      where spots.id = nearby_foods.spot_id
      and spots.status in ('ai_suggested', 'approved')
    )
  );

create or replace view public.public_spots
with (security_invoker = true)
as
select
  id::text,
  title,
  category,
  spot_name,
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
  confidence_score,
  source_type,
  status,
  og_image_url,
  created_at,
  updated_at
from public.spots
where status in ('ai_suggested', 'approved');

create or replace view public.public_nearby_foods
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
where spots.status in ('ai_suggested', 'approved');

grant select on public.public_spots to anon, authenticated;
grant select on public.public_nearby_foods to anon, authenticated;

create or replace function public.upsert_spot_candidate(
  p_slug text,
  p_title text,
  p_category text,
  p_spot_name text,
  p_latitude double precision,
  p_longitude double precision,
  p_description_ja text default null,
  p_description_en text default null,
  p_seo_title_ja text default null,
  p_seo_title_en text default null,
  p_visit_tips_ja text default null,
  p_scene_timestamp text default null,
  p_confidence_score double precision default 0.5,
  p_source_type text default 'inferred',
  p_status text default 'ai_suggested',
  p_prefecture text default null,
  p_city text default null,
  p_og_image_url text default null
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
    category,
    spot_name,
    prefecture,
    city,
    geom,
    description_ja,
    description_en,
    seo_title_ja,
    seo_title_en,
    visit_tips_ja,
    scene_timestamp,
    confidence_score,
    source_type,
    status,
    og_image_url
  )
  values (
    p_slug,
    p_title,
    p_category,
    p_spot_name,
    p_prefecture,
    p_city,
    st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography,
    p_description_ja,
    p_description_en,
    p_seo_title_ja,
    p_seo_title_en,
    p_visit_tips_ja,
    p_scene_timestamp,
    p_confidence_score,
    p_source_type,
    p_status,
    p_og_image_url
  )
  on conflict (slug) do update set
    title = excluded.title,
    category = excluded.category,
    spot_name = excluded.spot_name,
    prefecture = excluded.prefecture,
    city = excluded.city,
    geom = excluded.geom,
    description_ja = excluded.description_ja,
    description_en = excluded.description_en,
    seo_title_ja = excluded.seo_title_ja,
    seo_title_en = excluded.seo_title_en,
    visit_tips_ja = excluded.visit_tips_ja,
    scene_timestamp = excluded.scene_timestamp,
    confidence_score = excluded.confidence_score,
    source_type = excluded.source_type,
    status = excluded.status,
    og_image_url = excluded.og_image_url,
    updated_at = now()
  returning id into v_spot_id;

  return v_spot_id;
end;
$$;

revoke all on function public.upsert_spot_candidate(
  text,
  text,
  text,
  text,
  double precision,
  double precision,
  text,
  text,
  text,
  text,
  text,
  text,
  double precision,
  text,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.upsert_spot_candidate(
  text,
  text,
  text,
  text,
  double precision,
  double precision,
  text,
  text,
  text,
  text,
  text,
  text,
  double precision,
  text,
  text,
  text,
  text,
  text
) to service_role;

create or replace function public.upsert_nearby_food_candidate(
  p_spot_id uuid,
  p_name text,
  p_place_id text default null,
  p_category text default null,
  p_latitude double precision default null,
  p_longitude double precision default null,
  p_address text default null,
  p_rating double precision default null,
  p_price_level integer default null,
  p_website_url text default null,
  p_google_maps_url text default null,
  p_description_ja text default null,
  p_description_en text default null,
  p_tags text[] default '{}',
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

  select id into v_food_id
  from public.nearby_foods
  where spot_id = p_spot_id
    and (
      (p_place_id is not null and place_id = p_place_id)
      or (p_place_id is null and place_id is null and name = p_name)
    )
  limit 1;

  if v_food_id is null then
    insert into public.nearby_foods (
      spot_id,
      place_id,
      name,
      category,
      geom,
      address,
      rating,
      price_level,
      website_url,
      google_maps_url,
      description_ja,
      description_en,
      tags,
      is_sponsored,
      last_synced_at
    )
    values (
      p_spot_id,
      p_place_id,
      p_name,
      p_category,
      case
        when p_latitude is null or p_longitude is null then null
        else st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography
      end,
      p_address,
      p_rating,
      p_price_level,
      p_website_url,
      p_google_maps_url,
      p_description_ja,
      p_description_en,
      coalesce(p_tags, '{}'),
      coalesce(p_is_sponsored, false),
      now()
    )
    returning id into v_food_id;
  else
    update public.nearby_foods set
      place_id = p_place_id,
      name = p_name,
      category = p_category,
      geom = case
        when p_latitude is null or p_longitude is null then geom
        else st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography
      end,
      address = p_address,
      rating = p_rating,
      price_level = p_price_level,
      website_url = p_website_url,
      google_maps_url = p_google_maps_url,
      description_ja = p_description_ja,
      description_en = p_description_en,
      tags = coalesce(p_tags, '{}'),
      is_sponsored = coalesce(p_is_sponsored, false),
      last_synced_at = now()
    where id = v_food_id;
  end if;

  return v_food_id;
end;
$$;

revoke all on function public.upsert_nearby_food_candidate(
  uuid,
  text,
  text,
  text,
  double precision,
  double precision,
  text,
  double precision,
  integer,
  text,
  text,
  text,
  text,
  text[],
  boolean
) from public;

grant execute on function public.upsert_nearby_food_candidate(
  uuid,
  text,
  text,
  text,
  double precision,
  double precision,
  text,
  double precision,
  integer,
  text,
  text,
  text,
  text,
  text[],
  boolean
) to service_role;
