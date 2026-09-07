-- ============================================================
-- mentorship_skill_tracker migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- The "Foundation skill tracker" self-assessment gating Session 1's "Join
-- session" button (see src/components/programmes/mentorship/
-- MentorshipSkillTracker.jsx + skillTrackerTaxonomy.js for the fixed
-- category/skill list this rates against). One row per user, editable —
-- ratings stored as JSONB keyed by skill id: {"<skillId>": {"current": 1-5,
-- "goal": 1-5}}. `submitted_at` is set the first time it's saved and is
-- what the workspace checks for the skill-tracker gate; later re-saves
-- don't need to null it back out.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mentorship_skill_tracker (
  user_id       UUID        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  ratings       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  submitted_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentorship_skill_tracker ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentorship_skill_tracker: own read" ON public.mentorship_skill_tracker;
CREATE POLICY "mentorship_skill_tracker: own read"
  ON public.mentorship_skill_tracker FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentorship_skill_tracker: own insert" ON public.mentorship_skill_tracker;
CREATE POLICY "mentorship_skill_tracker: own insert"
  ON public.mentorship_skill_tracker FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentorship_skill_tracker: own update" ON public.mentorship_skill_tracker;
CREATE POLICY "mentorship_skill_tracker: own update"
  ON public.mentorship_skill_tracker FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS mentorship_skill_tracker_updated_at ON public.mentorship_skill_tracker;
CREATE TRIGGER mentorship_skill_tracker_updated_at
  BEFORE UPDATE ON public.mentorship_skill_tracker
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
