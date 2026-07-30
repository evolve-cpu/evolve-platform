-- ============================================================
-- org_updates_source_url migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds an optional "source" link to a highlight post — where the post was
-- pulled from (an institute's own website/socials, seeded during onboarding
-- from the link-fetch step) or a link an admin/faculty member attaches
-- manually when posting. Rendered on the public feed as "view source ↗" so
-- interested visitors can click through to the original.
-- ============================================================

alter table public.org_updates
  add column if not exists source_url text;

-- ─────────────────────────────────────────────
-- org_updates — live updates on the feed (new post / edit / approve /
-- remove) without a manual page reload. Requires the table in the
-- `supabase_realtime` publication for postgres_changes subscriptions to
-- fire; safe to re-run (guarded by a pg_publication_tables check since
-- `add table if not exists` isn't valid syntax for publications).
-- ─────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'org_updates'
  ) then
    alter publication supabase_realtime add table public.org_updates;
  end if;
end $$;
