-- ============================================================
-- demo_access migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- Run AFTER membership_plans.sql.
--
-- "Demo access" from the admin panel's Grant access tab (api/_manualGrant.js,
-- kind "demo"): everything except mentorship, until an end date — an active
-- plan (events, recordings, public profile, verification) plus an open
-- portfolio review. Cancelling it (op "revoke_demo") puts the plan fields
-- back to what they were and removes the review cycle if it was never
-- started.
--
--   demo_until    when the demo ends (plan_expires_at is set to the same)
--   demo_restore  { plan, plan_expires_at, review_credits, review_id } —
--                 what to put back on cancel, and the review it opened
-- ============================================================

alter table public.profiles
  add column if not exists demo_until   timestamptz,
  add column if not exists demo_restore jsonb;
