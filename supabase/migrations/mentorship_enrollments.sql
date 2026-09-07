-- ============================================================
-- mentorship_enrollments migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Payment/enrollment records for the new individual (1:1, not
-- batch/cohort) mentorship flow launched from the profile page's
-- Mentorship card. Deliberately separate from mentorship_payments
-- (which stays wired to the old batch flow — mentorship_sessions,
-- batch_members, the seat-counting webhook) so this new flow can't
-- accidentally trip that batch logic. Mirrors portfolio_review_payments'
-- shape — api/razorpay-create-order.js's individual-mentorship branch
-- inserts the pending row and verifies it synchronously (no dependency
-- on a webhook).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mentorship_enrollments (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  plan                 TEXT        NOT NULL CHECK (plan IN ('core', 'application_support')),

  -- pricing (store in rupees: ₹10,000 / ₹15,000)
  amount               INTEGER     NOT NULL,
  currency             TEXT        NOT NULL DEFAULT 'INR',

  -- contact + context collected at checkout
  phone                TEXT        NOT NULL,
  stream               TEXT,

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

ALTER TABLE public.mentorship_enrollments ENABLE ROW LEVEL SECURITY;

-- users can view their own enrollment/payment history
DROP POLICY IF EXISTS "mentorship_enrollments: own read" ON public.mentorship_enrollments;
CREATE POLICY "mentorship_enrollments: own read"
  ON public.mentorship_enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- users can insert their own row, but only as 'pending' — flipping a row to
-- 'success' is service-role only (the verify/devConfirm paths in
-- api/razorpay-create-order.js), so a client can never self-mark a payment
-- successful.
DROP POLICY IF EXISTS "mentorship_enrollments: own insert" ON public.mentorship_enrollments;
CREATE POLICY "mentorship_enrollments: own insert"
  ON public.mentorship_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- only service role can update status (verify endpoint uses service role key)
-- no UPDATE policy for anon/authenticated — server-side only

DROP TRIGGER IF EXISTS mentorship_enrollments_updated_at ON public.mentorship_enrollments;
CREATE TRIGGER mentorship_enrollments_updated_at
  BEFORE UPDATE ON public.mentorship_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
