-- ============================================================
-- platform_user_analytics migration
-- Run this in Supabase SQL Editor (or via supabase db push).
-- Run AFTER platform_journeys.sql.
--
-- One row per account with everything the admin "user analytics" tab
-- (api/_platformUsers.js) needs from the raw tracking tables, worked out
-- inside Postgres so the API doesn't page through every step ever logged:
--
--   first touch     the first visit from any browser the user has used
--                   (landing page, referrer, UTM tags) — before sign-up too
--   sign-up         where it happened and which CTA led to it
--                   (analytics_events 'signup')
--   after sign-up   the first page they opened once they had an account
--   sessions        count, total time (first → last step of each session),
--                   pages viewed, first / last seen
--   exit            the last page they opened (where they left from)
--
-- Steps logged before sign-up (no user_id) are tied to the account through
-- the browser's visitor id, same as api/_platformJourneys.js.
-- Service role only (api/admin.js).
-- ============================================================

create or replace function public.admin_user_analytics()
returns table (
  user_id               uuid,
  first_visit_at        timestamptz,
  first_landing_path    text,
  first_referrer        text,
  first_utm_source      text,
  first_utm_medium      text,
  first_utm_campaign    text,
  signup_path           text,
  signup_cta            text,
  signup_cta_location   text,
  first_page_after_signup text,
  sessions              bigint,
  total_ms              bigint,
  pages_viewed          bigint,
  first_seen_at         timestamptz,
  last_seen_at          timestamptz,
  last_page             text
)
language sql stable security definer set search_path = public as $$
  with uv as (
    select distinct s.user_id, s.visitor_id
    from analytics_steps s
    where s.user_id is not null
  ),
  st as (
    select s.user_id, s.session_id, s.kind, s.path, s.created_at
    from analytics_steps s
    where s.user_id is not null
    union all
    select uv.user_id, s.session_id, s.kind, s.path, s.created_at
    from analytics_steps s
    join uv on uv.visitor_id = s.visitor_id
    where s.user_id is null
  ),
  ses as (
    select st.user_id, st.session_id,
           min(st.created_at) as s_start,
           max(st.created_at) as s_end,
           count(*) filter (where st.kind = 'page') as pages
    from st
    group by st.user_id, st.session_id
  ),
  agg as (
    select ses.user_id,
           count(*) as sessions,
           coalesce(sum((extract(epoch from (ses.s_end - ses.s_start)) * 1000)::bigint), 0) as total_ms,
           coalesce(sum(ses.pages), 0)::bigint as pages_viewed,
           min(ses.s_start) as first_seen_at,
           max(ses.s_end) as last_seen_at
    from ses
    group by ses.user_id
  ),
  last_page as (
    select distinct on (st.user_id) st.user_id, st.path
    from st
    where st.kind = 'page'
    order by st.user_id, st.created_at desc
  ),
  first_visit as (
    select distinct on (uv.user_id) uv.user_id, v.created_at, v.landing_path, v.referrer,
           v.utm_source, v.utm_medium, v.utm_campaign
    from analytics_visits v
    join uv on uv.visitor_id = v.visitor_id
    order by uv.user_id, v.created_at
  ),
  signup as (
    select distinct on (e.user_id) e.user_id, e.path,
           e.props->>'cta' as cta, e.props->>'cta_location' as cta_location
    from analytics_events e
    where e.event = 'signup' and e.user_id is not null
    order by e.user_id, e.created_at
  ),
  after_signup as (
    select distinct on (s.user_id) s.user_id, s.path
    from analytics_steps s
    join profiles p on p.id = s.user_id
    where s.kind = 'page' and s.created_at >= p.created_at
    order by s.user_id, s.created_at
  )
  select p.id,
         fv.created_at, fv.landing_path, fv.referrer, fv.utm_source, fv.utm_medium, fv.utm_campaign,
         su.path, su.cta, su.cta_location,
         af.path,
         coalesce(a.sessions, 0), coalesce(a.total_ms, 0), coalesce(a.pages_viewed, 0),
         a.first_seen_at, a.last_seen_at,
         lp.path
  from profiles p
  left join agg a           on a.user_id = p.id
  left join last_page lp    on lp.user_id = p.id
  left join first_visit fv  on fv.user_id = p.id
  left join signup su       on su.user_id = p.id
  left join after_signup af on af.user_id = p.id
  order by p.created_at desc, p.id;
$$;

revoke all on function public.admin_user_analytics() from public, anon, authenticated;
grant execute on function public.admin_user_analytics() to service_role;
