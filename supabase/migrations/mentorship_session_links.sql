-- ============================================================
-- mentorship_session_links migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Per-user, per-session meeting details set by an admin after they've
-- manually scheduled the real meeting in Calendly (there is no live
-- Calendly API integration — this mirrors the existing "calendly / booking
-- link" pattern admins already use for mentorship_accelerator_bonus.
-- booking_link in src/pages/admn/AdminDashboard.jsx's AcceleratorTab).
-- Client-side this is read-only — only src/pages/admn/MentorshipV2Tab.jsx,
-- writing via the service-role src/supabaseAdminClient.js, ever inserts or
-- updates a row.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mentorship_session_links (
  user_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_number   SMALLINT    NOT NULL CHECK (session_number BETWEEN 1 AND 5),
  session_datetime TIMESTAMPTZ,
  join_link        TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, session_number)
);

ALTER TABLE public.mentorship_session_links ENABLE ROW LEVEL SECURITY;

-- users can read their own session links; only the service-role admin
-- client writes them, so no insert/update policy exists for anon/authenticated.
DROP POLICY IF EXISTS "mentorship_session_links: own read" ON public.mentorship_session_links;
CREATE POLICY "mentorship_session_links: own read"
  ON public.mentorship_session_links FOR SELECT
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS mentorship_session_links_updated_at ON public.mentorship_session_links;
CREATE TRIGGER mentorship_session_links_updated_at
  BEFORE UPDATE ON public.mentorship_session_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
