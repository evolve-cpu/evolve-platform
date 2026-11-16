-- Tell apart AI profiles a user built themselves in the app from the ones
-- the evolve team pre-generated (admin "ai profiles" tab regenerate,
-- scripts/pregenerate-ai-profiles.mjs, free-review invite builds).
--
-- Set by the app (src/components/AccountPanel.jsx) the first time a
-- signed-in user builds their own profile. Team builds never touch it.
-- Used by the admin "user ai profiles" tab, the platform report's
-- "Profiles created", journeys and the "user analytics" funnel.

alter table public.profiles
  add column if not exists ai_profile_self_built_at timestamptz;

create index if not exists profiles_ai_profile_self_built_at_idx
  on public.profiles (ai_profile_self_built_at desc)
  where ai_profile_self_built_at is not null;

-- Backfill (best guess for profiles built before this column existed):
-- the team only generated profiles for portfolio-review submitters and
-- free-review invitees, so any other finished profile was built by the user.
-- Someone who submitted a portfolio review AND later rebuilt their profile
-- themselves can't be told apart here; they'll show up on their next build.
update public.profiles p
set ai_profile_self_built_at = coalesce(p.ai_profile_first_built_at, p.ai_profile_updated_at, p.updated_at)
where p.ai_profile_status = 'done'
  and p.ai_profile_self_built_at is null
  and p.review_invite_at is null
  and not exists (
    select 1 from public.portfolio_reviews r
    where r.user_id = p.id
       or (r.email is not null and p.email is not null and lower(r.email) = lower(p.email))
  );
