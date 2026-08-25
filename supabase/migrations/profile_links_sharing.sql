-- ============================================================
-- Social/work links on profiles ("one-stop" shareable AI profile) +
-- catching up profile_cards on the ai_profile* columns it already
-- reads in app code (src/pages/PublicProfile.jsx, src/components/
-- AccountPanel.jsx) but that never landed in a committed migration.
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

alter table profiles
  add column if not exists social_links           jsonb not null default '[]',
  add column if not exists ai_profile              jsonb,
  add column if not exists ai_profile_status       text default 'none',
  add column if not exists ai_profile_updated_at   timestamptz,
  add column if not exists ai_profile_public       boolean not null default false;

-- Same public-safe view as onboarding_and_orgs.sql, extended with the
-- work/resume/social links and the AI-built profile — all gated behind
-- ai_profile_public so a visitor only ever sees them once the owner has
-- explicitly opted in to sharing.
create or replace view public.profile_cards as
  select
    id, username, name, avatar_url, bio, persona, level, discipline, intent,
    work_type, learning_method, growth_stage, created_at,
    case when ai_profile_public then portfolio_link end      as portfolio_link,
    case when ai_profile_public then portfolio_file_url end  as portfolio_file_url,
    case when ai_profile_public then resume_link end         as resume_link,
    case when ai_profile_public then resume_file_url end     as resume_file_url,
    case when ai_profile_public then social_links else '[]'::jsonb end as social_links,
    case when ai_profile_public then ai_profile end          as ai_profile
  from public.profiles
  where onboarding_completed = true and username is not null;

grant select on public.profile_cards to anon, authenticated;
