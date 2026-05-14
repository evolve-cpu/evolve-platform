-- ============================================================
-- Accelerator plan — bonus 1:1 calls after session 5
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── mentorship_accelerator_bonus ────────────────────────────
-- One row per user/batch created by admin after session 5 ends.
-- Stores the booking link (Calendly etc.) and validity window.

CREATE TABLE IF NOT EXISTS public.mentorship_accelerator_bonus (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  batch_id       UUID        NOT NULL,
  total_calls    INTEGER     NOT NULL DEFAULT 4,
  valid_until    TIMESTAMPTZ NOT NULL,          -- 6 months from session 5 end
  booking_link   TEXT,                          -- Calendly / external URL (set by admin)
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentorship_accelerator_bonus ENABLE ROW LEVEL SECURITY;

-- Users can read their own bonus record
CREATE POLICY "bonus: own read"
  ON public.mentorship_accelerator_bonus FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only service role / admin can insert and update
-- (no client INSERT/UPDATE policy — managed via Supabase dashboard or admin API)


-- ── mentorship_1on1_calls ────────────────────────────────────
-- One row per booked 1:1 call. Created by admin after a booking
-- is confirmed. User reads to see upcoming calls + join link.

CREATE TABLE IF NOT EXISTS public.mentorship_1on1_calls (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bonus_id         UUID        NOT NULL REFERENCES public.mentorship_accelerator_bonus(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  batch_id         UUID        NOT NULL,
  call_datetime    TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER     NOT NULL DEFAULT 30,
  meeting_link     TEXT,                        -- Google Meet / Zoom link
  platform         TEXT        NOT NULL DEFAULT 'google meet',
  mentor_name      TEXT,
  status           TEXT        NOT NULL DEFAULT 'scheduled'
                               CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentorship_1on1_calls ENABLE ROW LEVEL SECURITY;

-- Users can read their own calls
CREATE POLICY "1on1_calls: own read"
  ON public.mentorship_1on1_calls FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only service role / admin can insert, update, delete
-- (no client-side write policies)


-- ── Useful admin queries ─────────────────────────────────────
-- See all bonuses and remaining calls:
--   SELECT b.user_id, p.name, p.email, b.total_calls,
--          b.total_calls - COUNT(c.id) FILTER (WHERE c.status != 'cancelled') AS calls_remaining,
--          b.valid_until, b.booking_link
--   FROM mentorship_accelerator_bonus b
--   JOIN profiles p ON p.id = b.user_id
--   LEFT JOIN mentorship_1on1_calls c ON c.bonus_id = b.id
--   GROUP BY b.id, p.name, p.email;
