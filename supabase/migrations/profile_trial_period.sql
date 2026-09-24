-- ============================================================
-- profile_trial_period migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds the 14-day free trial window for the paid platform. No payment/
-- subscription enforcement is wired up yet (that's a later migration) —
-- this just gives every profile a trial_ends_at timestamp so the UI
-- (trial bottom sheet, clock badge on the avatar) has something to read.
-- Existing profiles are backfilled with a fresh 14-day window starting
-- today, since nobody has been shown any trial UI before this ships.
-- ============================================================

alter table public.profiles
  add column if not exists trial_ends_at timestamptz
    default (now() + interval '14 days');

update public.profiles
set trial_ends_at = now() + interval '14 days'
where trial_ends_at is null;
