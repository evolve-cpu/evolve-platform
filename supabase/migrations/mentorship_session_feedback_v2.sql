-- ============================================================
-- mentorship_session_feedback_v2 migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Post-session "How was your session?" feedback for the individual
-- mentorship flow — one row per (user, session_number). A session counts
-- as "completed" once a row exists here (whether attended or skipped via
-- "I did not attend the session") — see MentorshipWorkspaceShell.jsx's
-- currentSessionNumber derivation. Named _v2 to stay clear of the old
-- batch flow's mentorship_session_feedback table (untouched, separate).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mentorship_session_feedback_v2 (
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_number SMALLINT    NOT NULL CHECK (session_number BETWEEN 1 AND 5),
  attended       BOOLEAN     NOT NULL DEFAULT TRUE,
  rating         SMALLINT    CHECK (rating BETWEEN 1 AND 5),
  feedback_text  TEXT,
  submitted_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, session_number)
);

ALTER TABLE public.mentorship_session_feedback_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentorship_session_feedback_v2: own read" ON public.mentorship_session_feedback_v2;
CREATE POLICY "mentorship_session_feedback_v2: own read"
  ON public.mentorship_session_feedback_v2 FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentorship_session_feedback_v2: own insert" ON public.mentorship_session_feedback_v2;
CREATE POLICY "mentorship_session_feedback_v2: own insert"
  ON public.mentorship_session_feedback_v2 FOR INSERT
  WITH CHECK (auth.uid() = user_id);
