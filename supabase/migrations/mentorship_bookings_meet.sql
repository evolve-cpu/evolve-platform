-- ============================================================
-- mentorship_bookings_meet migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- "Book a slot" now creates the real meeting: one recurring Google
-- Calendar event (5 weekly sessions, with a Meet link) on the evolve
-- content account, inviting the learner — see the "mentorship_meet" mode
-- of supabase/functions/events-notify. The event id
-- is kept here so the call stays idempotent; each session's time + link
-- still lands in mentorship_session_links, where admins can override it.
-- ============================================================

ALTER TABLE public.mentorship_bookings
  ADD COLUMN IF NOT EXISTS google_event_id TEXT,
  ADD COLUMN IF NOT EXISTS meet_link       TEXT;
