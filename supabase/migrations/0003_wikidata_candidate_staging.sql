create table if not exists public.location_candidates (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_work_id text not null,
  source_place_id text not null,
  source_relation text not null,
  work_title text,
  place_name text,
  address text,
  latitude double precision,
  longitude double precision,
  source_url text not null,
  raw_payload jsonb not null default '{}',
  review_status text not null default 'pending'
    check (review_status in ('pending', 'accepted', 'rejected')),
  review_notes text,
  fetched_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (source_name, source_work_id, source_place_id, source_relation)
);

alter table public.location_candidates enable row level security;

revoke all on public.location_candidates from anon, authenticated;
grant all on public.location_candidates to service_role;

create index if not exists location_candidates_review_status_idx
  on public.location_candidates (review_status);

create index if not exists location_candidates_source_ids_idx
  on public.location_candidates (source_work_id, source_place_id);
