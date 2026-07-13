-- ============================================================
-- ecosystem_waitlist table
-- "be the first to know" CTA on the designers Home page (Scene4_refined)
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ecosystem_waitlist (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL UNIQUE,
  user_id    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  source     TEXT        NOT NULL DEFAULT 'home_scene4',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ecosystem_waitlist ENABLE ROW LEVEL SECURITY;

-- public lead-gen form — anyone can submit, nobody can read back via anon/authenticated
-- (ON CONFLICT DO NOTHING via supabase-js's `ignoreDuplicates` upsert option only needs INSERT)
CREATE POLICY "ecosystem_waitlist: public insert"
  ON public.ecosystem_waitlist FOR INSERT
  WITH CHECK (true);
