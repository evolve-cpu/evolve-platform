-- ============================================================
-- portfolio_review_payments migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Payment records for the paid 1:1 Portfolio Review programme
-- (₹1,400 flat, one-time). Mirrors mentorship_payments' shape —
-- razorpay-create-order-portfolio.js inserts the pending row,
-- razorpay-webhook.js flips it to success/failed.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.portfolio_review_payments (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- user details
  name                 TEXT        NOT NULL,
  email                TEXT        NOT NULL,

  -- pricing (store in paise: ₹1,400 → 140000)
  amount               INTEGER     NOT NULL,
  currency             TEXT        NOT NULL DEFAULT 'INR',

  -- contact collected at checkout
  phone                TEXT        NOT NULL,

  -- razorpay fields
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,

  -- lifecycle
  status               TEXT        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'success', 'failed', 'refunded')),

  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- table already existed without these columns on some environments —
-- patch it in place so re-running this file is safe either way
ALTER TABLE public.portfolio_review_payments ADD COLUMN IF NOT EXISTS name  TEXT NOT NULL DEFAULT '';
ALTER TABLE public.portfolio_review_payments ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE public.portfolio_review_payments ALTER COLUMN name  DROP DEFAULT;
ALTER TABLE public.portfolio_review_payments ALTER COLUMN email DROP DEFAULT;

ALTER TABLE public.portfolio_review_payments ENABLE ROW LEVEL SECURITY;

-- users can view their own payment history
DROP POLICY IF EXISTS "portfolio_review_payments: own read" ON public.portfolio_review_payments;
CREATE POLICY "portfolio_review_payments: own read"
  ON public.portfolio_review_payments FOR SELECT
  USING (auth.uid() = user_id);

-- users can insert their own payment row (status starts as 'pending')
DROP POLICY IF EXISTS "portfolio_review_payments: own insert" ON public.portfolio_review_payments;
CREATE POLICY "portfolio_review_payments: own insert"
  ON public.portfolio_review_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- only service role can update status (webhook uses service role key)
-- no UPDATE policy for anon/authenticated — server-side only

DROP TRIGGER IF EXISTS portfolio_review_payments_updated_at ON public.portfolio_review_payments;
CREATE TRIGGER portfolio_review_payments_updated_at
  BEFORE UPDATE ON public.portfolio_review_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
