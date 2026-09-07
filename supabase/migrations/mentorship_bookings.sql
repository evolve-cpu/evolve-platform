-- ============================================================
-- mentorship_bookings migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- The "Book a slot" step's day/time preference for the individual
-- mentorship workspace — a preference, not a live calendar booking (the
-- real meeting is scheduled manually by an admin in Calendly, see
-- mentorship_session_links). One row per user; presence of a row is what
-- unlocks "Session 1" in the workspace timeline (see
-- src/components/programmes/mentorship/MentorshipWorkspaceShell.jsx).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mentorship_bookings (
  user_id         UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_day   TEXT        NOT NULL CHECK (preferred_day IN ('Mon', 'Tue', 'Wed', 'Thu')),
  preferred_time  TEXT        NOT NULL CHECK (preferred_time IN ('9:00 PM', '10:00 PM', '11:00 PM')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentorship_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentorship_bookings: own read" ON public.mentorship_bookings;
CREATE POLICY "mentorship_bookings: own read"
  ON public.mentorship_bookings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentorship_bookings: own insert" ON public.mentorship_bookings;
CREATE POLICY "mentorship_bookings: own insert"
  ON public.mentorship_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentorship_bookings: own update" ON public.mentorship_bookings;
CREATE POLICY "mentorship_bookings: own update"
  ON public.mentorship_bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS mentorship_bookings_updated_at ON public.mentorship_bookings;
CREATE TRIGGER mentorship_bookings_updated_at
  BEFORE UPDATE ON public.mentorship_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
