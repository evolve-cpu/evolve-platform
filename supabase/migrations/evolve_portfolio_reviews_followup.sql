-- ============================================================
-- evolve_portfolio_reviews_followup migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds a free follow-up call to the Portfolio Review flow, offered
-- to the learner once they've viewed the report/session and submitted
-- feedback (see PortfolioReviewFlow.jsx). Booking reuses the same
-- Calendly widget as the initial call; `followup_status` is flipped
-- to 'booked' by the learner's own Calendly-confirmation listener
-- (mirrors how review_status becomes 'in_review' for the first call).
-- `followup_recording_url` stays admin-only, same pattern as
-- meet_recording_url/review_report_url in the base migration.
-- ============================================================

ALTER TABLE public.evolve_portfolio_reviews
  ADD COLUMN IF NOT EXISTS followup_status TEXT NOT NULL DEFAULT 'not_booked'
    CHECK (followup_status IN ('not_booked', 'booked')),
  ADD COLUMN IF NOT EXISTS followup_recording_url TEXT;

-- column grants are additive in Postgres, so this doesn't need to repeat
-- the full authenticated column list from evolve_portfolio_reviews.sql
GRANT UPDATE (followup_status) ON public.evolve_portfolio_reviews TO authenticated;
