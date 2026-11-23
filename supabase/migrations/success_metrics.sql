-- ============================================================
-- success_metrics migration
-- Run this in Supabase SQL Editor (or via supabase db push).
-- Run AFTER platform_journeys.sql.
--
-- For the admin "success metrics" tab (api/_successMetrics.js). Everything
-- else that tab needs is already logged (visits, page steps, sign-ups,
-- registrations). The one missing piece was the click on an event's
-- "Book your spot" button, so the event funnel can tell apart
--   "read the event page and left"  from
--   "tried to register, then dropped at sign-in / payment / the form".
--
--   analytics_events.event  + 'event_register_click'
--                           props: { slug, signed_in }
-- ============================================================

alter table public.analytics_events drop constraint if exists analytics_events_event_check;
alter table public.analytics_events
  add constraint analytics_events_event_check
  check (event in ('cta_click', 'signup', 'event_register_click'));

create or replace function public.analytics_track_event(
  p_visitor text, p_event text, p_props jsonb default '{}'::jsonb, p_path text default null, p_session text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_event not in ('cta_click', 'signup', 'event_register_click') then return; end if;
  if length(coalesce(p_props, '{}'::jsonb)::text) > 1000 then return; end if;
  insert into analytics_events (visitor_id, session_id, user_id, event, props, path)
  values (left(p_visitor, 64), left(p_session, 64), auth.uid(), p_event, coalesce(p_props, '{}'::jsonb), left(p_path, 300));
end;
$$;

revoke all on function public.analytics_track_event(text, text, jsonb, text, text) from public;
grant execute on function public.analytics_track_event(text, text, jsonb, text, text) to anon, authenticated;

create index if not exists analytics_events_session_idx on public.analytics_events (session_id);
