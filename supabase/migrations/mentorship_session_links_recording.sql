-- ============================================================
-- mentorship_session_links_recording migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds the recording + mentor notes fields to mentorship_session_links
-- (created in mentorship_session_links.sql) so the same admin-set row that
-- carries a session's join link can also carry its post-session recording
-- link and summary — set by an admin once the call's happened (see
-- src/pages/admn/MentorshipV2Tab.jsx). Session number is no longer capped
-- at 1 — all 5 sessions use this table now.
-- ============================================================

ALTER TABLE public.mentorship_session_links
  ADD COLUMN IF NOT EXISTS recording_url TEXT,
  ADD COLUMN IF NOT EXISTS session_notes TEXT;
