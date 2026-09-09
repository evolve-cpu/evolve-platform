-- ============================================================
-- mentorship_job_application_calls migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Extends the individual-mentorship flow to the application_support
-- (₹15,000) plan's 3 job-application groups, 2 calls each — modelled as
-- slot numbers 6-11 on the SAME mentorship_session_links /
-- mentorship_session_feedback_v2 tables sessions 1-5 already use (JA1
-- Call1=6, Call2=7, JA2 Call1=8, Call2=9, JA3 Call1=10, Call2=11 — see
-- src/components/programmes/mentorship/MentorshipTimeline.jsx's
-- slotToStepIndex). Widens their CHECK constraints from 1-5 to 1-11
-- accordingly.
--
-- Unlike sessions (all pre-scheduled via the one initial "Book a slot"),
-- each job-application call needs its own ad-hoc day/time preference,
-- booked one at a time as it unlocks — hence the new
-- mentorship_call_bookings table below, parallel to mentorship_bookings
-- but with a composite key (one row per user PER CALL, not one overall).
-- ============================================================

ALTER TABLE public.mentorship_session_links
  DROP CONSTRAINT IF EXISTS mentorship_session_links_session_number_check;
ALTER TABLE public.mentorship_session_links
  ADD CONSTRAINT mentorship_session_links_session_number_check
  CHECK (session_number BETWEEN 1 AND 11);

ALTER TABLE public.mentorship_session_feedback_v2
  DROP CONSTRAINT IF EXISTS mentorship_session_feedback_v2_session_number_check;
ALTER TABLE public.mentorship_session_feedback_v2
  ADD CONSTRAINT mentorship_session_feedback_v2_session_number_check
  CHECK (session_number BETWEEN 1 AND 11);

CREATE TABLE IF NOT EXISTS public.mentorship_call_bookings (
  user_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_number  SMALLINT    NOT NULL CHECK (session_number BETWEEN 6 AND 11),
  preferred_day   TEXT        NOT NULL CHECK (preferred_day IN ('Mon', 'Tue', 'Wed', 'Thu')),
  preferred_time  TEXT        NOT NULL CHECK (preferred_time IN ('9:00 PM', '10:00 PM', '11:00 PM')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, session_number)
);

ALTER TABLE public.mentorship_call_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentorship_call_bookings: own read" ON public.mentorship_call_bookings;
CREATE POLICY "mentorship_call_bookings: own read"
  ON public.mentorship_call_bookings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentorship_call_bookings: own insert" ON public.mentorship_call_bookings;
CREATE POLICY "mentorship_call_bookings: own insert"
  ON public.mentorship_call_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentorship_call_bookings: own update" ON public.mentorship_call_bookings;
CREATE POLICY "mentorship_call_bookings: own update"
  ON public.mentorship_call_bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS mentorship_call_bookings_updated_at ON public.mentorship_call_bookings;
CREATE TRIGGER mentorship_call_bookings_updated_at
  BEFORE UPDATE ON public.mentorship_call_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
