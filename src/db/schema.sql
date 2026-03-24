-- ╔══════════════════════════════════════════════════════════════╗
-- ║          evolve platform — supabase schema                  ║
-- ║  run this in supabase SQL editor (Dashboard → SQL Editor)   ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─────────────────────────────────────────────
-- 0. helper: auto-update updated_at
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ─────────────────────────────────────────────
-- 1. PROFILES
--    one row per auth user
--    created on first sign-in (Google One Tap / OTP / Google OAuth)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,                        -- from Google or user-provided in OTP form
  email       TEXT,                        -- from auth.users
  avatar_url  TEXT,                        -- from Google; null for OTP users
  phone       TEXT,                        -- collected only before payment
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- each user can only see/edit their own row
CREATE POLICY "profiles: own read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: own insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: own update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────
-- 2. MENTORSHIP PAYMENTS
--    one row per payment attempt
--    linked to profiles
--    razorpay fields populated after payment gateway integration
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentorship_payments (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- plan purchased
  plan                 TEXT        NOT NULL CHECK (plan IN ('starter', 'accelerator')),

  -- pricing  (store in paise: ₹15,000 → 1500000)
  amount               INTEGER     NOT NULL,
  currency             TEXT        NOT NULL DEFAULT 'INR',

  -- contact collected at checkout
  phone                TEXT        NOT NULL,

  -- razorpay fields (populated after integration)
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  razorpay_signature   TEXT,

  -- lifecycle
  status               TEXT        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'success', 'failed', 'refunded')),

  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentorship_payments ENABLE ROW LEVEL SECURITY;

-- users can view their own payment history
CREATE POLICY "payments: own read"
  ON public.mentorship_payments FOR SELECT
  USING (auth.uid() = user_id);

-- users can insert their own payment row (status starts as 'pending')
CREATE POLICY "payments: own insert"
  ON public.mentorship_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- only service role can update status (webhook will use service role key)
-- no UPDATE policy for anon/authenticated — server-side only

CREATE TRIGGER mentorship_payments_updated_at
  BEFORE UPDATE ON public.mentorship_payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────
-- NOTES FOR RAZORPAY INTEGRATION (when ready)
-- ─────────────────────────────────────────────
-- 1. frontend creates a payment row (status = 'pending') using user's supabase session
-- 2. frontend calls your edge function / backend to create razorpay order
--    → store razorpay_order_id in the row
-- 3. razorpay webhook (server-side, service role key) verifies signature and
--    updates status to 'success' / 'failed' + stores razorpay_payment_id
-- 4. frontend polls or listens to the row for status change

-- phone is collected at checkout, stored here and also upserted to profiles.phone
-- so future payments pre-fill the number

-- ─────────────────────────────────────────────
-- USEFUL QUERIES FOR ADMIN
-- ─────────────────────────────────────────────
-- all successful payments:
--   SELECT p.name, p.email, mp.plan, mp.amount/100 as amount_inr, mp.created_at
--   FROM mentorship_payments mp JOIN profiles p ON p.id = mp.user_id
--   WHERE mp.status = 'success' ORDER BY mp.created_at DESC;
