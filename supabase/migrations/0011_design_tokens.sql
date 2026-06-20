-- Admin-managed design tokens.

create table if not exists public.design_tokens (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

drop trigger if exists set_design_tokens_updated_at on public.design_tokens;
create trigger set_design_tokens_updated_at
  before update on public.design_tokens
  for each row
  execute function public.set_updated_at();

alter table public.design_tokens enable row level security;
-- No public policies: only the service role reads/writes this table.
