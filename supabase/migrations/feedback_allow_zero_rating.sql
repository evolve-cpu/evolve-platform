-- ============================================================
-- Allow rating = 0 in mentorship_session_feedback
-- rating 0 means "I did not attend the session"
-- rating 1-5 = actual star/heart rating
-- Run this in Supabase SQL Editor
-- ============================================================

ALTER TABLE public.mentorship_session_feedback
  DROP CONSTRAINT IF EXISTS mentorship_session_feedback_rating_check;

ALTER TABLE public.mentorship_session_feedback
  ADD CONSTRAINT mentorship_session_feedback_rating_check
  CHECK (rating >= 0 AND rating <= 5);
