-- ============================================================
-- evolve_portfolio_reviews_cycles migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Lets a user go through the Portfolio Review workspace more than
-- once: once a cycle's report is uploaded (review_report_url set),
-- paying again starts a fresh row ("review 2", "review 3", ...)
-- instead of overwriting the finished one. The original migration
-- (evolve_portfolio_reviews.sql) put a UNIQUE constraint on user_id
-- to keep the webhook's upsert idempotent for a single cycle — this
-- migration drops that so a second paid row can exist alongside the
-- first, and adds `attempt` so the UI/API can order + label cycles
-- ("review 1", "review 2", …) without guessing from created_at.
-- ============================================================

ALTER TABLE public.evolve_portfolio_reviews
  ADD COLUMN IF NOT EXISTS attempt INTEGER NOT NULL DEFAULT 1;

-- Drop the old "one row per user, ever" constraint. Its auto-generated
-- name follows Postgres's <table>_<column>_key convention; the IF
-- EXISTS guard keeps this migration safe to re-run.
ALTER TABLE public.evolve_portfolio_reviews
  DROP CONSTRAINT IF EXISTS evolve_portfolio_reviews_user_id_key;

-- Replace it with a non-unique lookup index (still fast to fetch "all
-- of this user's review cycles, latest first") plus a partial unique
-- index that only ever allows ONE open (not-yet-reported) cycle per
-- user at a time — so a webhook retry or a double-click on "pay"
-- can't spawn two simultaneous in-progress cycles.
CREATE INDEX IF NOT EXISTS evolve_portfolio_reviews_user_id_idx
  ON public.evolve_portfolio_reviews (user_id, attempt);

CREATE UNIQUE INDEX IF NOT EXISTS evolve_portfolio_reviews_one_open_cycle
  ON public.evolve_portfolio_reviews (user_id)
  WHERE review_report_url IS NULL;
