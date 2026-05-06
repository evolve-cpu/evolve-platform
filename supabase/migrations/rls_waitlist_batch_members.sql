-- ============================================================
-- RLS policies for mentorship_waitlist and batch_members
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Helper: identify admin users by email domain ────────────
-- Adjust the domain check if your admin emails differ
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND email LIKE '%@evolvedesign.academy'
  );
$$;

-- ════════════════════════════════════════════════════════════
-- mentorship_waitlist
-- Has user_id column (confirmed from Payment.jsx usage)
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.mentorship_waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can submit their own waitlist entry
CREATE POLICY "users can insert own waitlist entry"
  ON public.mentorship_waitlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can check if they are on the waitlist (own row only)
-- Admins can read all rows (for admin dashboard)
CREATE POLICY "users can read own waitlist entry, admins read all"
  ON public.mentorship_waitlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.is_admin());

-- Only admins can update/delete waitlist entries
CREATE POLICY "only admins can update waitlist"
  ON public.mentorship_waitlist FOR UPDATE
  TO authenticated
  USING (auth.is_admin());

CREATE POLICY "only admins can delete waitlist entries"
  ON public.mentorship_waitlist FOR DELETE
  TO authenticated
  USING (auth.is_admin());

-- ════════════════════════════════════════════════════════════
-- batch_members
-- Not used directly in frontend — likely a DB-internal table
-- Lock it down: authenticated users read their own row, no writes from client
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.batch_members ENABLE ROW LEVEL SECURITY;

-- Users can read their own batch membership
-- (assumes batch_members has a user_id column — adjust if column is named differently)
CREATE POLICY "users can read own batch membership"
  ON public.batch_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.is_admin());

-- No client-side INSERT/UPDATE/DELETE — managed by DB functions or admin only
-- (service role key bypasses RLS, so admin server-side ops still work)
