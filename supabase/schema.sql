-- ==============================================================================
-- PulseMeet Supabase Schema & 3-Hour Ingestion Scheduler
-- ==============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";
create extension if not exists "pg_net";

-- ------------------------------------------------------------------------------
-- 1. Events Table
-- ------------------------------------------------------------------------------
create table if not exists public.events (
  id text primary key,
  title text not null,
  organizer jsonb not null default '{"name": "Community Organizer", "id": "unknown"}'::jsonb,
  source_platform text default 'luma',
  tagline text,
  description text not null,
  date text not null,
  time text not null,
  iso_date timestamptz not null,
  location text not null,
  city text not null,
  area text,
  venue text,
  venue_url text, -- Strict rule: only populated if provided by organizer
  price text not null default 'Free',
  mode text not null check (mode in ('offline', 'online', 'hybrid')),
  categories text[] not null default '{}',
  rsvp_url text not null unique,
  attendee_count integer default 0,
  featured boolean default false,
  banner_image text,
  community_cadence text,
  speakers jsonb default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Indexes for lightning fast frontend queries & geo/format filtering
create index if not exists idx_events_city on public.events (city);
create index if not exists idx_events_mode on public.events (mode);
create index if not exists idx_events_iso_date on public.events (iso_date);
create index if not exists idx_events_categories on public.events using gin (categories);
create index if not exists idx_events_organizer on public.events using gin (organizer);

-- ------------------------------------------------------------------------------
-- 2. Communities Table
-- ------------------------------------------------------------------------------
create table if not exists public.communities (
  id text primary key,
  name text not null,
  description text not null,
  city text not null,
  logo_url text,
  upcoming_count integer default 0,
  cadence text not null,
  cadence_type text,
  meeting_pattern text,
  verified boolean default true,
  topics text[] not null default '{}',
  members_count text default '1K+',
  platform text not null default 'luma',
  community_url text not null,
  past_events_count integer default 0,
  founded_year integer,
  typical_venue text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_communities_city on public.communities (city);

-- ------------------------------------------------------------------------------
-- 3. Sync Logs Table (Auditing 3-Hour Scheduler Runs)
-- ------------------------------------------------------------------------------
create table if not exists public.sync_logs (
  id uuid primary key default uuid_generate_v4(),
  ran_at timestamptz not null default timezone('utc'::text, now()),
  status text not null check (status in ('running', 'success', 'failed')),
  source text not null default 'scheduled_3h',
  events_found integer default 0,
  events_upserted integer default 0,
  error_message text,
  execution_ms integer
);

create index if not exists idx_sync_logs_ran_at on public.sync_logs (ran_at desc);

-- ------------------------------------------------------------------------------
-- 4. User Profiles Table (Platform Users & Personalization)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id text primary key,
  name text not null,
  email text unique not null,
  role text default 'Software Engineer',
  city text default 'delhi-ncr',
  mode text default 'both',
  categories text[] default '{}',
  is_admin boolean default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  last_active_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_profiles_city on public.profiles (city);

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS)
-- ------------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.communities enable row level security;
alter table public.sync_logs enable row level security;

-- Public can read active events and communities (Anon Key)
create policy "Allow public read access on events"
  on public.events for select
  using (true);

create policy "Allow public read access on communities"
  on public.communities for select
  using (true);

-- Only service_role can insert, update, or delete (Protected backend ingestion)
create policy "Allow service_role full access on events"
  on public.events for all
  to service_role
  using (true)
  with check (true);

create policy "Allow service_role full access on communities"
  on public.communities for all
  to service_role
  using (true)
  with check (true);

create policy "Allow service_role full access on sync_logs"
  on public.sync_logs for all
  to service_role
  using (true)
  with check (true);

-- Public can view recent sync logs
create policy "Allow public read on sync_logs"
  on public.sync_logs for select
  using (true);

-- ------------------------------------------------------------------------------
-- 5. Automatic updated_at Trigger
-- ------------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_events_updated_at on public.events;
create trigger trigger_events_updated_at
  before update on public.events
  for each row
  execute function public.handle_updated_at();

drop trigger if exists trigger_communities_updated_at on public.communities;
create trigger trigger_communities_updated_at
  before update on public.communities
  for each row
  execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 6. Every 3 Hours pg_cron Scheduler (0 */3 * * *)
-- ------------------------------------------------------------------------------
-- Note: In your Supabase Dashboard -> SQL Editor, run this block after replacing
-- YOUR_PROJECT_REF and YOUR_SERVICE_ROLE_KEY.
--
-- Alternatively, trigger via Supabase Edge Function scheduled cron or GitHub Actions.

/*
-- Unschedules existing job if previously registered
select cron.unschedule('pulsemeet-event-sync-every-3-hours') 
where exists (select 1 from cron.job where jobname = 'pulsemeet-event-sync-every-3-hours');

-- Schedule to run at minute 0 of every 3rd hour (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00 UTC)
select cron.schedule(
  'pulsemeet-event-sync-every-3-hours',
  '0 */3 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-events',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := '{"source": "pg_cron_3h"}'::jsonb
  ) as request_id;
  $$
);
*/
