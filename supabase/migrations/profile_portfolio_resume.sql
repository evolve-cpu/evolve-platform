-- ============================================================
-- Portfolio / resume fields on profiles + raw extracted-profile
-- storage, for the profile-building test flow (My Account page).
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

alter table profiles
  add column if not exists portfolio_link              text,
  add column if not exists portfolio_file_url           text,
  add column if not exists resume_link                  text,
  add column if not exists resume_file_url               text,
  add column if not exists extracted_profile             jsonb,
  add column if not exists extracted_profile_status      text default 'none',
  add column if not exists extracted_profile_updated_at  timestamptz;

alter table profiles
  add constraint extracted_profile_status_check
  check (extracted_profile_status in ('none', 'pending', 'done', 'failed'));

-- Reuses the existing public "portfolio-files" storage bucket and its
-- folder-scoped RLS policies (auth.uid()/*) created in portfolio_reviews.sql —
-- resume files upload under the same {user.id}/ folder with a "resume-"
-- filename prefix, so no new bucket/policy is needed.
