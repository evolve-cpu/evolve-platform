-- ============================================================
-- review_invite migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- Run AFTER trial_rejoin_ledger.sql.
--
-- Students invited from the admin panel's Grant access tab with a free
-- portfolio review (e.g. a partner college cohort) are stamped with
-- review_invite_at by api/_manualGrant.js. For them:
--   • there's no 30-day trial — the grant marks the trial as started and
--     already over, so public.start_trial() never gives them one
--   • the resume + portfolio they upload for the review also builds their
--     AI profile on My Profile (api/admin.js op "review_profile_build"),
--     so they don't have to upload both again there
--   • the "your trial has ended" pop-up is skipped (they never had one)
-- ============================================================

alter table public.profiles
  add column if not exists review_invite_at timestamptz;
