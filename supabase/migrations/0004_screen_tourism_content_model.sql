create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  work_type text not null
    check (work_type in ('film', 'drama', 'anime', 'mv', 'cm', 'documentary')),
  title_ja text not null,
  title_en text,
  official_url text,
  release_date date,
  synopsis_ja text,
  synopsis_en text,
  copyright_notice text,
  seo_title_ja text,
  seo_title_en text,
  seo_description_ja text,
  seo_description_en text,
  og_image_url text,
  verification_status text not null default 'draft'
    check (verification_status in ('draft', 'reviewed', 'verified', 'rejected')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  publisher text,
  source_type text not null
    check (source_type in ('official', 'press', 'database', 'venue', 'map', 'editorial', 'social')),
  published_at timestamptz,
  accessed_at timestamptz not null default now(),
  language text,
  is_official boolean not null default false,
  is_public boolean not null default false,
  quoted_fact text,
  archive_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.filming_locations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ja text not null,
  name_en text,
  address text,
  prefecture text,
  city text,
  geom geography(point, 4326) not null,
  access_notes_ja text,
  access_notes_en text,
  visit_restrictions_ja text,
  visit_restrictions_en text,
  opening_hours jsonb,
  admission_fee text,
  official_url text,
  image_url text,
  verification_status text not null default 'draft'
    check (verification_status in ('draft', 'reviewed', 'verified', 'rejected')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_locations (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  location_id uuid not null references public.filming_locations(id) on delete cascade,
  relation_type text not null
    check (relation_type in ('filming', 'visual_model', 'narrative_setting', 'mentioned', 'unverified')),
  scene_title_ja text,
  scene_title_en text,
  episode_number text,
  scene_timestamp text,
  scene_description_ja text,
  scene_description_en text,
  spoiler_level text not null default 'none'
    check (spoiler_level in ('none', 'minor', 'major')),
  source_id uuid references public.content_sources(id),
  verification_status text not null default 'draft'
    check (verification_status in ('draft', 'reviewed', 'verified', 'rejected')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (work_id, location_id, relation_type, episode_number, scene_timestamp)
);

create table if not exists public.screen_foods (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  slug text not null,
  name_ja text not null,
  name_en text,
  food_type text,
  scene_description_ja text,
  scene_description_en text,
  episode_number text,
  scene_timestamp text,
  character_names text[] not null default '{}',
  spoiler_level text not null default 'none'
    check (spoiler_level in ('none', 'minor', 'major')),
  image_url text,
  source_id uuid references public.content_sources(id),
  verification_status text not null default 'draft'
    check (verification_status in ('draft', 'reviewed', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (work_id, slug)
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ja text not null,
  name_en text,
  address text,
  geom geography(point, 4326) not null,
  official_url text,
  reservation_url text,
  google_maps_url text,
  opening_hours jsonb,
  closed_days text,
  dietary_tags text[] not null default '{}',
  language_support text[] not null default '{}',
  payment_methods text[] not null default '{}',
  price_range text,
  business_status text not null default 'unknown'
    check (business_status in ('open', 'temporarily_closed', 'permanently_closed', 'unknown')),
  image_url text,
  last_verified_at timestamptz,
  verification_status text not null default 'draft'
    check (verification_status in ('draft', 'reviewed', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.food_experiences (
  id uuid primary key default gen_random_uuid(),
  screen_food_id uuid not null references public.screen_foods(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  experience_type text not null
    check (experience_type in (
      'actual_filming_venue',
      'exact_menu',
      'official_collaboration',
      'model_menu',
      'inspired_menu',
      'regional_equivalent'
    )),
  menu_name_ja text not null,
  menu_name_en text,
  description_ja text,
  description_en text,
  price numeric(10, 2),
  currency char(3) not null default 'JPY',
  reservation_required boolean not null default false,
  available_from date,
  available_until date,
  availability_status text not null default 'unknown'
    check (availability_status in ('available', 'limited', 'ended', 'seasonal', 'unknown')),
  evidence_source_id uuid references public.content_sources(id),
  verification_status text not null default 'draft'
    check (verification_status in ('draft', 'reviewed', 'verified', 'rejected')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (screen_food_id, venue_id, experience_type, menu_name_ja),
  check (price is null or price >= 0),
  check (available_from is null or available_until is null or available_from <= available_until),
  check (verification_status <> 'verified' or (evidence_source_id is not null and verified_at is not null))
);

alter table public.works
  add column if not exists primary_source_id uuid references public.content_sources(id);

alter table public.works
  drop constraint if exists works_verified_source_check;
alter table public.works
  add constraint works_verified_source_check
  check (
    verification_status <> 'verified'
    or (primary_source_id is not null and published_at is not null)
  );

alter table public.filming_locations
  add column if not exists primary_source_id uuid references public.content_sources(id);

alter table public.filming_locations
  drop constraint if exists filming_locations_verified_source_check;
alter table public.filming_locations
  add constraint filming_locations_verified_source_check
  check (
    verification_status <> 'verified'
    or (primary_source_id is not null and last_verified_at is not null)
  );

alter table public.venues
  add column if not exists primary_source_id uuid references public.content_sources(id);

alter table public.venues
  drop constraint if exists venues_verified_source_check;
alter table public.venues
  add constraint venues_verified_source_check
  check (
    verification_status <> 'verified'
    or (primary_source_id is not null and last_verified_at is not null)
  );

alter table public.work_locations
  drop constraint if exists work_locations_work_id_location_id_relation_type_episode_number_scene_timestamp_key;
create unique index if not exists work_locations_scene_identity_idx
  on public.work_locations (
    work_id,
    location_id,
    relation_type,
    coalesce(episode_number, ''),
    coalesce(scene_timestamp, '')
  );

alter table public.work_locations
  drop constraint if exists work_locations_verified_source_check;
alter table public.work_locations
  add constraint work_locations_verified_source_check
  check (
    verification_status <> 'verified'
    or (source_id is not null and verified_at is not null)
  );

alter table public.screen_foods
  drop constraint if exists screen_foods_verified_source_check;
alter table public.screen_foods
  add constraint screen_foods_verified_source_check
  check (verification_status <> 'verified' or source_id is not null);

create index if not exists works_published_idx
  on public.works (verification_status, published_at);
create index if not exists filming_locations_geom_idx
  on public.filming_locations using gist (geom);
create index if not exists venues_geom_idx
  on public.venues using gist (geom);
create index if not exists work_locations_work_idx
  on public.work_locations (work_id, verification_status);
create index if not exists screen_foods_work_idx
  on public.screen_foods (work_id, verification_status);
create index if not exists food_experiences_food_idx
  on public.food_experiences (screen_food_id, verification_status, availability_status);

alter table public.works enable row level security;
alter table public.content_sources enable row level security;
alter table public.filming_locations enable row level security;
alter table public.work_locations enable row level security;
alter table public.screen_foods enable row level security;
alter table public.venues enable row level security;
alter table public.food_experiences enable row level security;

drop policy if exists "Public reads published sources" on public.content_sources;
create policy "Public reads published sources" on public.content_sources
  for select using (is_public = true);

drop policy if exists "Public reads verified works" on public.works;
create policy "Public reads verified works" on public.works
  for select using (
    verification_status = 'verified'
    and published_at is not null
    and published_at <= now()
    and exists (
      select 1 from public.content_sources
      where content_sources.id = works.primary_source_id
        and content_sources.is_public = true
    )
  );

drop policy if exists "Public reads verified locations" on public.filming_locations;
create policy "Public reads verified locations" on public.filming_locations
  for select using (
    verification_status = 'verified'
    and exists (
      select 1 from public.content_sources
      where content_sources.id = filming_locations.primary_source_id
        and content_sources.is_public = true
    )
  );

drop policy if exists "Public reads verified work locations" on public.work_locations;
create policy "Public reads verified work locations" on public.work_locations
  for select using (
    verification_status = 'verified'
    and exists (
      select 1 from public.works
      where works.id = work_locations.work_id
        and works.verification_status = 'verified'
        and works.published_at <= now()
    )
    and exists (
      select 1 from public.filming_locations
      where filming_locations.id = work_locations.location_id
        and filming_locations.verification_status = 'verified'
    )
    and exists (
      select 1 from public.content_sources
      where content_sources.id = work_locations.source_id
        and content_sources.is_public = true
    )
  );

drop policy if exists "Public reads verified screen foods" on public.screen_foods;
create policy "Public reads verified screen foods" on public.screen_foods
  for select using (
    verification_status = 'verified'
    and exists (
      select 1 from public.works
      where works.id = screen_foods.work_id
        and works.verification_status = 'verified'
        and works.published_at <= now()
    )
    and exists (
      select 1 from public.content_sources
      where content_sources.id = screen_foods.source_id
        and content_sources.is_public = true
    )
  );

drop policy if exists "Public reads verified venues" on public.venues;
create policy "Public reads verified venues" on public.venues
  for select using (
    verification_status = 'verified'
    and exists (
      select 1 from public.content_sources
      where content_sources.id = venues.primary_source_id
        and content_sources.is_public = true
    )
  );

drop policy if exists "Public reads verified food experiences" on public.food_experiences;
create policy "Public reads verified food experiences" on public.food_experiences
  for select using (
    verification_status = 'verified'
    and exists (
      select 1 from public.screen_foods
      where screen_foods.id = food_experiences.screen_food_id
        and screen_foods.verification_status = 'verified'
    )
    and exists (
      select 1 from public.venues
      where venues.id = food_experiences.venue_id
        and venues.verification_status = 'verified'
        and venues.business_status <> 'permanently_closed'
    )
    and exists (
      select 1 from public.content_sources
      where content_sources.id = food_experiences.evidence_source_id
        and content_sources.is_public = true
    )
  );

grant select on public.works to anon, authenticated;
grant select on public.content_sources to anon, authenticated;
grant select on public.filming_locations to anon, authenticated;
grant select on public.work_locations to anon, authenticated;
grant select on public.screen_foods to anon, authenticated;
grant select on public.venues to anon, authenticated;
grant select on public.food_experiences to anon, authenticated;

drop trigger if exists set_works_updated_at on public.works;
create trigger set_works_updated_at
  before update on public.works
  for each row execute function public.set_updated_at();

drop trigger if exists set_filming_locations_updated_at on public.filming_locations;
create trigger set_filming_locations_updated_at
  before update on public.filming_locations
  for each row execute function public.set_updated_at();

drop trigger if exists set_work_locations_updated_at on public.work_locations;
create trigger set_work_locations_updated_at
  before update on public.work_locations
  for each row execute function public.set_updated_at();

drop trigger if exists set_screen_foods_updated_at on public.screen_foods;
create trigger set_screen_foods_updated_at
  before update on public.screen_foods
  for each row execute function public.set_updated_at();

drop trigger if exists set_venues_updated_at on public.venues;
create trigger set_venues_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

drop trigger if exists set_food_experiences_updated_at on public.food_experiences;
create trigger set_food_experiences_updated_at
  before update on public.food_experiences
  for each row execute function public.set_updated_at();
