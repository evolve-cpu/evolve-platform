-- ============================================================
-- evolve_portfolio_reviews migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Dedicated table for the paid, evolve-tenant Portfolio Review
-- workspace (PortfolioReviewFlow.jsx) — deliberately NOT the shared
-- `portfolio_reviews` table (used by the Anant tenant + the legacy
-- multi-tenant PortfolioReviewForm.jsx + the admin "reviews" tab).
--
-- Rows are created ONLY server-side, by razorpay-webhook.js once a
-- payment is confirmed (see the payment.captured branch) — there is
-- no INSERT policy for `authenticated` on purpose, so a signed-in user
-- can never grant themselves the flow without actually paying.
-- Admin-only fields (review_report_url, meet_recording_url, remarks)
-- are similarly locked to service_role via column-level grants below,
-- so the owner can view but never spoof a "reviewed" state.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.evolve_portfolio_reviews (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  name                TEXT,
  email               TEXT,

  -- intake questionnaire (explicit columns — not a repurposed/delimited scheme)
  q1                  TEXT,
  q2                  TEXT,
  q3                  TEXT,
  q4                  TEXT,

  -- resume — either an uploaded file URL or a pasted link
  resume_mode         TEXT        CHECK (resume_mode IN ('upload', 'link')),
  resume_value        TEXT,

  -- portfolio — either an uploaded file URL or a pasted link
  portfolio_mode      TEXT        CHECK (portfolio_mode IN ('upload', 'link')),
  portfolio_value     TEXT,

  -- lifecycle. no 'done' value on purpose — "report ready" is derived
  -- from review_report_url being non-null, so there's one source of truth
  review_status       TEXT        NOT NULL DEFAULT 'draft'
                         CHECK (review_status IN ('draft', 'pending', 'in_review')),

  -- admin-only (see column grants below)
  review_report_url   TEXT,
  meet_recording_url  TEXT,
  remarks             TEXT,

  -- post-report feedback, owner-writable
  feedback_rating     INTEGER,
  feedback_text       TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.evolve_portfolio_reviews ENABLE ROW LEVEL SECURITY;

-- owner can read their own row (includes admin-only columns — the
-- student-facing UI simply never fetches/renders remarks)
DROP POLICY IF EXISTS "evolve_portfolio_reviews: own read" ON public.evolve_portfolio_reviews;
CREATE POLICY "evolve_portfolio_reviews: own read"
  ON public.evolve_portfolio_reviews FOR SELECT
  USING (auth.uid() = user_id);

-- no INSERT policy for authenticated/anon — rows are created only by
-- the webhook (service role), which bypasses RLS entirely

-- owner can update their own row, but column grants below restrict
-- which columns that actually covers
DROP POLICY IF EXISTS "evolve_portfolio_reviews: own update" ON public.evolve_portfolio_reviews;
CREATE POLICY "evolve_portfolio_reviews: own update"
  ON public.evolve_portfolio_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- column-level lockdown: authenticated may only ever touch the fields
-- the student-facing flow actually writes. review_report_url,
-- meet_recording_url, and remarks stay service_role-only (admin panel).
REVOKE UPDATE ON public.evolve_portfolio_reviews FROM authenticated;
GRANT UPDATE (
  q1, q2, q3, q4,
  resume_mode, resume_value,
  portfolio_mode, portfolio_value,
  review_status,
  feedback_rating, feedback_text
) ON public.evolve_portfolio_reviews TO authenticated;

DROP TRIGGER IF EXISTS evolve_portfolio_reviews_updated_at ON public.evolve_portfolio_reviews;
CREATE TRIGGER evolve_portfolio_reviews_updated_at
  BEFORE UPDATE ON public.evolve_portfolio_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
