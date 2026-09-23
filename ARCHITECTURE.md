# 🏛️ PulseMeet Architecture & Technical Specification

## 1. System Design Principles

PulseMeet is architected with three core tenets:
1. **Zero Hallucination & Data Integrity**: Community event metadata, particularly dates, RSVP URLs, and venue addresses, must be preserved with 100% fidelity. Under no circumstances are links fabricated.
2. **Resilient Dual Ingestion**: Both automated cloud runners (GitHub Actions) and instant administrative imports (Web UI) operate against the same unified Supabase schema.
3. **Dual Dispatch Email Delivery**: Accommodates both standard transactional API gateways (Resend) and authenticated Google SMTP (`smtp.gmail.com`) to bypass vendor domain verification hurdles for personal admin addresses.

---

## 2. Ingestion & Sync Pipeline Architecture

```
[External Sources]
   ├─ Luma (lu.ma) Public Feeds
   ├─ Atlassian Community (ace.atlassian.com) Bevy API
   ├─ ProductTank / Mind the Product (Meetup & RSS)
   └─ Devpost & Hack2skill (Hackathons)
          │
          ▼
   [scripts/sync-events.js]
          │
          ├─ Normalize City Slugs ('delhi-ncr', 'bengaluru', 'mumbai', 'san-francisco', 'london', 'remote')
          ├─ Sanitize & Validate Venue Links (Strict Rule: http/https prefix or null)
          ├─ Deduplicate by RSVP URL and Entity ID
          │
          ▼
   [Supabase PostgREST Engine]
          │
          ├─ Upsert into public.events (Prefer: resolution=merge-duplicates)
          └─ Insert audit trace into public.sync_logs
```

---

## 3. Database Schema Specification

### `public.events`
```sql
create table if not exists public.events (
  id text primary key,
  title text not null,
  tagline text,
  description text,
  mode text check (mode in ('offline', 'online', 'hybrid')),
  event_type text default 'meetup',
  vibe text default 'deep-tech',
  categories text[] default '{}',
  date text not null,
  time text not null,
  iso_date timestamptz,
  city text not null,
  area text,
  venue text,
  venue_url text, -- Must be a valid URL or NULL
  rsvp_url text not null,
  source_platform text default 'Luma',
  price text default 'Free',
  organizer jsonb default '{}'::jsonb,
  seats integer,
  speakers jsonb default '[]'::jsonb,
  banner_image text,
  community_cadence text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `public.sync_logs`
```sql
create table if not exists public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz default now(),
  status text check (status in ('success', 'failed')),
  source text not null,
  events_found integer default 0,
  events_upserted integer default 0,
  error_message text,
  execution_ms integer
);
```

---

## 4. Email Notification Subsystem

### Dual Engine Architecture
1. **Native Gmail SMTP (`/api/send-gmail`)**:
   - Uses `nodemailer` to open a TLS connection to `smtp.gmail.com:465`.
   - Authenticates using the administrator's Google 16-character App Password.
   - Sets the authenticated sender envelope to `Devendra | PulseMeet <devendrs2313@gmail.com>`.
   - Allows sending to **any arbitrary recipient** across domains without DNS verification.
2. **Resend REST API (`https://api.resend.com/emails`)**:
   - Fast transactional engine for domain-verified addresses (`alerts@yourdomain.com`).
3. **1-Click Web Client Fallback**:
   - Generates pre-populated `mailto:` links with subject, body, schedule details, and RSVP links if an API gateway hits sandbox restrictions.

---

## 5. Security & Push Protection

- All API keys, secrets, and database credentials are kept strictly in `.env` and injected into CI/CD via GitHub Actions Repository Secrets.
- Client-side code accesses Supabase strictly through the public anon key (`VITE_SUPABASE_ANON_KEY`) subject to Row-Level Security (RLS).
- Administrative modifications require the `SUPABASE_SERVICE_ROLE_KEY` which only runs in backend contexts (`scripts/` and GitHub Actions runners).
