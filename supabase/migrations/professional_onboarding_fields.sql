-- ============================================================
-- professional_onboarding_fields migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds the two fields the Professional & Recent Grad onboarding screen
-- collects instead of the student college/year/program/stream set:
-- work_status ("You're...") and designation (job title, "NA" when
-- work_status is "Still exploring").
-- ============================================================

alter table public.profiles
  add column if not exists work_status  text,
  add column if not exists designation  text;

alter table public.profiles
  drop constraint if exists profiles_work_status_check;
alter table public.profiles
  add constraint profiles_work_status_check
  check (work_status in (
    'Working at a company',
    'Running my own company',
    'Freelancing',
    'Still exploring'
  ));
