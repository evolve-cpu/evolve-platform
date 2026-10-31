-- ============================================================
-- platform_journeys migration
-- Run this in Supabase SQL Editor (or via supabase db push).
-- Run AFTER platform_analytics.sql.
--
-- Journeys for the admin platform report (api/_platformJourneys.js):
-- every page a visitor opens, in order, grouped into sessions (a tab;
-- a new session after 30 minutes idle — src/lib/platformAnalytics.js).
-- The platform keeps its tab / programme in the URL (/app/grow,
-- /app/grow/portfolio-review …), so page steps cover it too. Actions
-- (built a profile, asked for verification, paid …) aren't logged here:
-- the report reads them from the tables that already record them.
--
--   analytics_steps   kind 'page' = opened a page, 'leave' = the tab was
--                     closed or navigated off the site (best effort)
--
-- Visits and events get the session id too, so a session knows its UTM
-- tags and CTA clicks.
-- ============================================================

create table if not exists public.analytics_steps (
  id          bigint generated always as identity primary key,
  visitor_id  text not null,
  session_id  text not null,
  user_id     uuid references auth.users(id) on delete set null,
  kind        text not null check (kind in ('page', 'leave')),
  path        text,
  created_at  timestamptz not null default now()
);
alter table public.analytics_steps enable row level security;
create index if not exists analytics_steps_created_idx on public.analytics_steps (created_at);
create index if not exists analytics_steps_user_idx on public.analytics_steps (user_id, created_at);
create index if not exists analytics_steps_session_idx on public.analytics_steps (session_id);
create index if not exists analytics_steps_visitor_idx on public.analytics_steps (visitor_id);

alter table public.analytics_visits add column if not exists session_id text;
alter table public.analytics_events add column if not exists session_id text;
create index if not exists analytics_visits_session_idx on public.analytics_visits (session_id);

create or replace function public.analytics_track_step(
  p_visitor text, p_session text, p_kind text, p_path text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(p_visitor, '') = '' or coalesce(p_session, '') = '' then return; end if;
  if p_kind not in ('page', 'leave') then return; end if;
  insert into analytics_steps (visitor_id, session_id, user_id, kind, path)
  values (left(p_visitor, 64), left(p_session, 64), auth.uid(), p_kind, left(p_path, 300));
end;
$$;

-- same as platform_analytics.sql, plus the session id (defaulted, so
-- browsers still on the old code keep working)
drop function if exists public.analytics_track_visit(text, text, text, jsonb);
create or replace function public.analytics_track_visit(
  p_visitor text, p_path text, p_referrer text, p_utm jsonb default '{}'::jsonb, p_session text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(p_visitor, '') = '' then return; end if;
  insert into analytics_visits (visitor_id, session_id, user_id, landing_path, referrer,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term)
  values (
    left(p_visitor, 64), left(p_session, 64), auth.uid(), left(p_path, 300), left(nullif(p_referrer, ''), 300),
    left(lower(nullif(trim(p_utm->>'source'), '')), 100),
    left(lower(nullif(trim(p_utm->>'medium'), '')), 100),
    left(lower(nullif(trim(p_utm->>'campaign'), '')), 150),
    left(nullif(trim(p_utm->>'content'), ''), 150),
    left(nullif(trim(p_utm->>'term'), ''), 150)
  );
end;
$$;

drop function if exists public.analytics_track_event(text, text, jsonb, text);
create or replace function public.analytics_track_event(
  p_visitor text, p_event text, p_props jsonb default '{}'::jsonb, p_path text default null, p_session text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_event not in ('cta_click', 'signup') then return; end if;
  if length(coalesce(p_props, '{}'::jsonb)::text) > 1000 then return; end if;
  insert into analytics_events (visitor_id, session_id, user_id, event, props, path)
  values (left(p_visitor, 64), left(p_session, 64), auth.uid(), p_event, coalesce(p_props, '{}'::jsonb), left(p_path, 300));
end;
$$;

revoke all on function public.analytics_track_step(text, text, text, text) from public;
revoke all on function public.analytics_track_visit(text, text, text, jsonb, text) from public;
revoke all on function public.analytics_track_event(text, text, jsonb, text, text) from public;
grant execute on function public.analytics_track_step(text, text, text, text) to anon, authenticated;
grant execute on function public.analytics_track_visit(text, text, text, jsonb, text) to anon, authenticated;
grant execute on function public.analytics_track_event(text, text, jsonb, text, text) to anon, authenticated;
