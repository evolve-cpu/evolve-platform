-- ============================================================
-- portfolio_review_stream_waitlist table
-- Portfolio Review booking modal: when a learner's stream isn't one of
-- the currently-supported streams, they hit "join waitlist" instead of
-- paying — this captures that interest so we know demand/coverage gaps.
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_review_stream_waitlist (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL DEFAULT '',
  name       TEXT        NOT NULL DEFAULT '',
  phone      TEXT        NOT NULL DEFAULT '',
  stream     TEXT        NOT NULL,
  source     TEXT        NOT NULL DEFAULT 'portfolio_review',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE public.portfolio_review_stream_waitlist ENABLE ROW LEVEL SECURITY;

-- learners can add/update their own single waitlist row (upsert on user_id)
CREATE POLICY "portfolio_review_stream_waitlist: insert own"
  ON public.portfolio_review_stream_waitlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portfolio_review_stream_waitlist: update own"
  ON public.portfolio_review_stream_waitlist FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- learners can check whether they're already on the list
CREATE POLICY "portfolio_review_stream_waitlist: read own"
  ON public.portfolio_review_stream_waitlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
