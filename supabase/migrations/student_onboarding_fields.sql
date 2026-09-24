-- ============================================================
-- student_onboarding_fields migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds the Student/Working Professional role split and the student-ID
-- upload/verification fields used by the new onboarding flow. Reuses the
-- existing school_name (college name) / standard (year) / stream columns
-- from onboarding_design_school_fields.sql — only `program` is new.
-- ============================================================

alter table public.profiles
  add column if not exists role     text,
  add column if not exists program  text;

alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('student', 'professional'));

alter table public.profiles
  add column if not exists student_id_path                text,
  add column if not exists student_id_extracted            jsonb,
  add column if not exists student_id_verification_status  text default 'none',
  add column if not exists student_id_verified_at          timestamptz;

alter table public.profiles
  drop constraint if exists student_id_verification_status_check;
alter table public.profiles
  add constraint student_id_verification_status_check
  check (student_id_verification_status in ('none', 'verified', 'manual', 'unclear'));
