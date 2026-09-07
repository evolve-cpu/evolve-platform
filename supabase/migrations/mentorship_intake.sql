-- ============================================================
-- mentorship_intake migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- The "Before we begin.." questionnaire for the new individual mentorship
-- workspace (portfolio/resume/walkthrough + expectations). One row per
-- user, editable in place (unlike mentorship_enrollments' payment history,
-- this is a draft the user can revisit and update). Separate from the old
-- batch flow's mentorship_profiles table (goal/linkedin_url, keyed to a
-- batch_id) — this is its individual-mentorship equivalent.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mentorship_intake (
  user_id            UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_id      UUID        REFERENCES public.mentorship_enrollments(id) ON DELETE SET NULL,

  portfolio_mode     TEXT        CHECK (portfolio_mode IN ('link', 'file')),
  portfolio_value    TEXT,       -- a URL (link mode) or a filename (file mode)

  resume_link        TEXT,
  walkthrough_link   TEXT,
  notes              TEXT,
  expectations       TEXT,

  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentorship_intake ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentorship_intake: own read" ON public.mentorship_intake;
CREATE POLICY "mentorship_intake: own read"
  ON public.mentorship_intake FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentorship_intake: own insert" ON public.mentorship_intake;
CREATE POLICY "mentorship_intake: own insert"
  ON public.mentorship_intake FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- unlike payment tables, the user owns this draft end-to-end — no server
-- verification step involved, so (unlike mentorship_enrollments) they can
-- update their own row directly.
DROP POLICY IF EXISTS "mentorship_intake: own update" ON public.mentorship_intake;
CREATE POLICY "mentorship_intake: own update"
  ON public.mentorship_intake FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS mentorship_intake_updated_at ON public.mentorship_intake;
CREATE TRIGGER mentorship_intake_updated_at
  BEFORE UPDATE ON public.mentorship_intake
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
