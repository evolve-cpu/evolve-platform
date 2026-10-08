-- ============================================================
-- platform_entry_trial migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- Run AFTER membership_plans.sql and student_onboarding_fields.sql.
--
-- Onboarding is gone — signing in drops people straight onto the platform
-- (/app). The 30-day trial used to start the moment the profile row was
-- created (trial_ends_at defaulted to now() + 30 days); it now starts the
-- first time the person actually lands on the platform, via
-- public.start_trial() (called by src/pages/PlatformApp.jsx).
--
-- Existing profiles keep the trial window they already have — they're
-- backfilled as "already started".
--
-- Student pricing is no longer picked at onboarding either: it's decided
-- at checkout by uploading a student ID (see api/_membership.js tierFor).
-- 'submitted' marks an ID that's been uploaded but not yet reviewed by an
-- admin — it gets the student price straight away.
-- ============================================================


-- ── 1. trial starts on first platform entry ─────────────────────────────
alter table public.profiles
  add column if not exists trial_started_at timestamptz;

-- everyone who already exists keeps their current window
update public.profiles
set trial_started_at = coalesce(trial_ends_at - interval '30 days', now())
where trial_started_at is null;

-- new profiles start with no trial until they enter the platform
alter table public.profiles
  alter column trial_ends_at drop default;


-- ── 2. let start_trial() through the plan-field guard ───────────────────
-- protect_plan_fields() (membership_plans.sql) reverts any non-service-role
-- write to trial_ends_at. start_trial() is security definer but auth.role()
-- still reads the caller's JWT, so it flags itself with a transaction-local
-- setting the trigger honours.
create or replace function public.protect_plan_fields()
returns trigger language plpgsql as $$
begin
  if auth.role() <> 'service_role' then
    new.plan                 := old.plan;
    new.plan_expires_at      := old.plan_expires_at;
    new.review_credits       := old.review_credits;
    new.trial_extended_to_30 := old.trial_extended_to_30;
    if coalesce(current_setting('evolve.starting_trial', true), '') <> '1' then
      new.trial_ends_at    := old.trial_ends_at;
      new.trial_started_at := old.trial_started_at;
    end if;
  end if;
  return new;
end;
$$;


-- ── 3. start_trial() — idempotent, only ever starts it once ─────────────
create or replace function public.start_trial()
returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  ends timestamptz;
begin
  if auth.uid() is null then
    return null;
  end if;

  perform set_config('evolve.starting_trial', '1', true);

  update public.profiles
  set trial_started_at = now(),
      trial_ends_at    = now() + interval '30 days'
  where id = auth.uid()
    and trial_started_at is null;

  perform set_config('evolve.starting_trial', '', true);

  select trial_ends_at into ends from public.profiles where id = auth.uid();
  return ends;
end;
$$;

grant execute on function public.start_trial() to authenticated;


-- ── 4. 'submitted' student ID status ────────────────────────────────────
alter table public.profiles
  drop constraint if exists student_id_verification_status_check;
alter table public.profiles
  add constraint student_id_verification_status_check
  check (student_id_verification_status in ('none', 'submitted', 'verified', 'manual', 'unclear'));
