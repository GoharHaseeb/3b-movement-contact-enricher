-- 3B Movement Contact Enricher
-- Run this in the Supabase SQL editor (once per project).
-- Internal studio use only. Do not expose the service_role key in the app.

create table if not exists public.enrich_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  segment_file text,
  master_file text,
  total integer not null default 0,
  matched integer not null default 0,
  phones_found integer not null default 0,
  phones_missing integer not null default 0,
  emails_not_found integer not null default 0,
  match_rate numeric(6, 2) not null default 0
);

create table if not exists public.enrich_rows (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.enrich_runs(id) on delete cascade,
  email text,
  phone text,
  customer_name text,
  match_status text,
  phone_status text,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists enrich_rows_run_id_idx on public.enrich_rows (run_id);
create index if not exists enrich_rows_email_idx on public.enrich_rows (email);

alter table public.enrich_runs enable row level security;
alter table public.enrich_rows enable row level security;

drop policy if exists enrich_runs_internal on public.enrich_runs;
drop policy if exists enrich_rows_internal on public.enrich_rows;

create policy enrich_runs_internal
  on public.enrich_runs
  for all
  using (true)
  with check (true);

create policy enrich_rows_internal
  on public.enrich_rows
  for all
  using (true)
  with check (true);

-- One saved studio contact list. Upload once, then only drop segment CSVs.

create table if not exists public.master_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  file_name text not null,
  email_column text not null,
  phone_column text,
  headers jsonb not null default '[]'::jsonb,
  row_count integer not null default 0,
  phone_count integer not null default 0
);

create table if not exists public.master_contacts (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.master_sources(id) on delete cascade,
  email text not null,
  phone text,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists master_contacts_source_email_idx
  on public.master_contacts (source_id, email);
create index if not exists master_contacts_email_idx on public.master_contacts (email);

alter table public.master_sources enable row level security;
alter table public.master_contacts enable row level security;

drop policy if exists master_sources_internal on public.master_sources;
drop policy if exists master_contacts_internal on public.master_contacts;

create policy master_sources_internal
  on public.master_sources
  for all
  using (true)
  with check (true);

create policy master_contacts_internal
  on public.master_contacts
  for all
  using (true)
  with check (true);
