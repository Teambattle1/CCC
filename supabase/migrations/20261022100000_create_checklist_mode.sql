-- Checklist mode (porteret fra TeamTrack) — FÆLLES for FLOW, CREW og EventDay.
-- ALLEREDE KØRT på MAIN 2026-10-22 (via Supabase-MCP). Samme fil ligger i OCC og eventday.
-- To tabeller i MAIN; `app` skiller apps ad ('flow' | 'crew' | 'eventday').
-- Additiv og idempotent. Skrives af admin-laget i appen (anon-nøglen) og af
-- /checklist-skillen i Claude Code (status/fix_ref/fix_version tilbage).

create table if not exists public.cm_packages (
  id uuid primary key,
  app text not null check (app in ('flow','crew','eventday')),
  title text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  device text,
  app_version text,
  note text
);
-- Pakkenavnet («22/10 · A») er unikt pr. app på tværs af enheder.
create unique index if not exists cm_packages_app_title_key on public.cm_packages (app, title);
create index if not exists cm_packages_app_created_idx on public.cm_packages (app, created_at desc);

create table if not exists public.cm_items (
  id uuid primary key,
  package_id uuid not null references public.cm_packages(id) on delete cascade,
  app text not null check (app in ('flow','crew','eventday')),
  seq int not null default 1,
  screen_key text not null,
  screen_label text,
  screen_state text,
  screen_file text,
  route text,
  kind text not null default 'bug',
  comment text not null default '',
  element jsonb,
  context jsonb not null default '{}'::jsonb,
  errors jsonb not null default '[]'::jsonb,
  -- 480 px-miniature og ≤1280 px-billede som data-URI (JPEG), så en
  -- Claude Code-session altid kan se billedet via SQL.
  thumb_b64 text,
  shot_b64 text,
  status text not null default 'open'
    check (status in ('open','sent','in_progress','fixed','declined')),
  fix_ref text,
  fix_version text,
  declined_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cm_items_package_idx on public.cm_items (package_id, seq);
create index if not exists cm_items_app_status_idx on public.cm_items (app, status, updated_at desc);

create or replace function public.cm_touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists cm_packages_touch on public.cm_packages;
create trigger cm_packages_touch before update on public.cm_packages for each row execute function public.cm_touch_updated_at();
drop trigger if exists cm_items_touch on public.cm_items;
create trigger cm_items_touch before update on public.cm_items for each row execute function public.cm_touch_updated_at();

alter table public.cm_packages enable row level security;
alter table public.cm_items enable row level security;

-- Samme mønster som ef_-tabellerne: appen gater laget på admin-sessionen.
do $$ begin
  create policy cm_packages_all on public.cm_packages for all to anon, authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy cm_items_all on public.cm_items for all to anon, authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on public.cm_packages, public.cm_items to anon, authenticated;
