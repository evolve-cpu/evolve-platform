-- ============================================================
-- mentorship_stream_skill_tracker migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- The "Stream skill tracker" self-assessment, filled before Session 2 (see
-- src/components/programmes/mentorship/streamSkillTrackerTaxonomy.js for
-- the fixed category/skill list). Same shape as mentorship_skill_tracker
-- (the Session 1 "Foundation" tracker) — kept as a separate table since the
-- two are shown/tracked independently ("Your skill trackers" lists both
-- once submitted).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mentorship_stream_skill_tracker (
  user_id       UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  ratings       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  submitted_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentorship_stream_skill_tracker ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentorship_stream_skill_tracker: own read" ON public.mentorship_stream_skill_tracker;
CREATE POLICY "mentorship_stream_skill_tracker: own read"
  ON public.mentorship_stream_skill_tracker FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentorship_stream_skill_tracker: own insert" ON public.mentorship_stream_skill_tracker;
CREATE POLICY "mentorship_stream_skill_tracker: own insert"
  ON public.mentorship_stream_skill_tracker FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentorship_stream_skill_tracker: own update" ON public.mentorship_stream_skill_tracker;
CREATE POLICY "mentorship_stream_skill_tracker: own update"
  ON public.mentorship_stream_skill_tracker FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS mentorship_stream_skill_tracker_updated_at ON public.mentorship_stream_skill_tracker;
CREATE TRIGGER mentorship_stream_skill_tracker_updated_at
  BEFORE UPDATE ON public.mentorship_stream_skill_tracker
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
