-- ============================================================
-- platform_analytics migration
-- Run this in Supabase SQL Editor (or via supabase db push).
-- Run AFTER profile_verification.sql.
--
-- First-party numbers for the admin "platform report" tab
-- (api/_platformReport.js). GA4 + Clarity stay for deep-dives, but GA
-- only counts visitors who accept cookies, and neither knows which
-- visitor became which account, so the report reads from here:
--
--   analytics_visits     one row per browser session on the site: landing
--                        page, referrer, UTM tags
--   analytics_events     CTA clicks (sign in / start for free) and sign-ups
--                        (google one tap / google / linkedin / email)
--   user_daily_activity  one row per signed-in user per India day → DAU/MAU
--   user_explored        one row per user per platform area they've opened
--                        → explored split + "% of platform explored"
--
-- Browsers write only through the three functions at the bottom
-- (anyone for visits/events, signed-in users for activity); the tables
-- themselves have RLS on and no policies, so only the service role
-- (api/admin.js) reads them.
-- ============================================================

create table if not exists public.analytics_visits (
  id            bigint generated always as identity primary key,
  visitor_id    text not null,
  user_id       uuid references auth.users(id) on delete set null,
  landing_path  text,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  utm_term      text,
  created_at    timestamptz not null default now()
);
alter table public.analytics_visits enable row level security;
create index if not exists analytics_visits_created_idx on public.analytics_visits (created_at);

create table if not exists public.analytics_events (
  id          bigint generated always as identity primary key,
  visitor_id  text,
  user_id     uuid references auth.users(id) on delete set null,
  event       text not null check (event in ('cta_click', 'signup')),
  props       jsonb not null default '{}'::jsonb,
  path        text,
  created_at  timestamptz not null default now()
);
alter table public.analytics_events enable row level security;
create index if not exists analytics_events_created_idx on public.analytics_events (event, created_at);

create table if not exists public.user_daily_activity (
  user_id     uuid not null references auth.users(id) on delete cascade,
  day         date not null,
  first_seen  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.user_daily_activity enable row level security;
create index if not exists user_daily_activity_day_idx on public.user_daily_activity (day);

-- areas: profile, grow, events, community (the four platform tabs) and
-- portfolio_review, mentorship (opening those programmes = "interested")
create table if not exists public.user_explored (
  user_id   uuid not null references auth.users(id) on delete cascade,
  area      text not null check (area in ('profile', 'grow', 'events', 'community', 'portfolio_review', 'mentorship')),
  first_at  timestamptz not null default now(),
  last_at   timestamptz not null default now(),
  visits    integer not null default 1,
  primary key (user_id, area)
);
alter table public.user_explored enable row level security;

-- ── profiles: how the account was created, when the AI profile was first
-- built (ai_profile_updated_at moves on every rebuild), when verification
-- was asked for
-- signup_method: google_one_tap | google | linkedin | email
alter table public.profiles
  add column if not exists signup_method             text,
  add column if not exists ai_profile_first_built_at timestamptz,
  add column if not exists verification_requested_at timestamptz;

-- backfills for existing rows, with profile triggers paused so they don't
-- bump updated_at or re-run the verification guard on every profile
alter table public.profiles disable trigger user;

-- existing AI profiles: best guess is the last build
update public.profiles
set ai_profile_first_built_at = coalesce(ai_profile_updated_at, updated_at, created_at)
where ai_profile_status = 'done' and ai_profile_first_built_at is null;

-- existing verification requests: best guess is the last profile update
update public.profiles
set verification_requested_at = coalesce(updated_at, created_at)
where verification_status is not null and verification_requested_at is null;

-- existing accounts: provider from auth (One Tap and Google redirect both
-- show up as "google" there, so only new sign-ups get the split)
update public.profiles p
set signup_method = case u.raw_app_meta_data->>'provider'
    when 'linkedin_oidc' then 'linkedin'
    else u.raw_app_meta_data->>'provider'
  end
from auth.users u
where u.id = p.id and p.signup_method is null;

alter table public.profiles enable trigger user;

-- a new profile with no method from the browser gets the auth provider
create or replace function public.profiles_default_signup_method()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.signup_method is null then
    select case raw_app_meta_data->>'provider' when 'linkedin_oidc' then 'linkedin' else raw_app_meta_data->>'provider' end
    into new.signup_method
    from auth.users where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_default_signup_method on public.profiles;
create trigger profiles_default_signup_method
  before insert on public.profiles
  for each row execute function public.profiles_default_signup_method();

-- stamp the first AI profile build and each ask for verification
-- (null → booked). Named to sort after profiles_protect_verification, so it
-- sees the status that trigger actually let through.
create or replace function public.profiles_stamp_milestones()
returns trigger language plpgsql as $$
begin
  if old.verification_status is null and new.verification_status is not null then
    new.verification_requested_at := now();
  else
    new.verification_requested_at := old.verification_requested_at;
  end if;

  if old.ai_profile_first_built_at is not null then
    new.ai_profile_first_built_at := old.ai_profile_first_built_at;
  elsif new.ai_profile_status = 'done' then
    new.ai_profile_first_built_at := now();
  else
    new.ai_profile_first_built_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_stamp_milestones on public.profiles;
create trigger profiles_stamp_milestones
  before update on public.profiles
  for each row execute function public.profiles_stamp_milestones();

-- ── write functions (the only way in from the browser) ────────────────
-- Text is clipped so a bad client can't stuff the tables.
create or replace function public.analytics_track_visit(
  p_visitor text, p_path text, p_referrer text, p_utm jsonb default '{}'::jsonb
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(p_visitor, '') = '' then return; end if;
  insert into analytics_visits (visitor_id, user_id, landing_path, referrer,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term)
  values (
    left(p_visitor, 64), auth.uid(), left(p_path, 300), left(nullif(p_referrer, ''), 300),
    left(lower(nullif(trim(p_utm->>'source'), '')), 100),
    left(lower(nullif(trim(p_utm->>'medium'), '')), 100),
    left(lower(nullif(trim(p_utm->>'campaign'), '')), 150),
    left(nullif(trim(p_utm->>'content'), ''), 150),
    left(nullif(trim(p_utm->>'term'), ''), 150)
  );
end;
$$;

create or replace function public.analytics_track_event(
  p_visitor text, p_event text, p_props jsonb default '{}'::jsonb, p_path text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_event not in ('cta_click', 'signup') then return; end if;
  if length(coalesce(p_props, '{}'::jsonb)::text) > 1000 then return; end if;
  insert into analytics_events (visitor_id, user_id, event, props, path)
  values (left(p_visitor, 64), auth.uid(), p_event, coalesce(p_props, '{}'::jsonb), left(p_path, 300));
end;
$$;

-- signed-in heartbeat: marks today active, and the area if one is given
create or replace function public.analytics_ping(p_area text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then return; end if;
  insert into user_daily_activity (user_id, day)
  values (uid, (now() at time zone 'Asia/Kolkata')::date)
  on conflict (user_id, day) do update set last_seen = now();

  if p_area in ('profile', 'grow', 'events', 'community', 'portfolio_review', 'mentorship') then
    insert into user_explored (user_id, area)
    values (uid, p_area)
    on conflict (user_id, area) do update
      set last_at = now(), visits = user_explored.visits + 1;
  end if;
end;
$$;

revoke all on function public.analytics_track_visit(text, text, text, jsonb) from public;
revoke all on function public.analytics_track_event(text, text, jsonb, text) from public;
revoke all on function public.analytics_ping(text) from public;
grant execute on function public.analytics_track_visit(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.analytics_track_event(text, text, jsonb, text) to anon, authenticated;
grant execute on function public.analytics_ping(text) to authenticated;
