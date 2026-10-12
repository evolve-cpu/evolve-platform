-- ============================================================
-- profiles_welcome_email migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Stamped by api/admin.js (op "welcome_email") when the welcome email goes
-- out, so each person gets it once even if sign-up runs twice.
-- Existing accounts are marked as already welcomed so nobody who signed up
-- before this shipped gets a surprise "Welcome to Evolve".
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

UPDATE public.profiles
SET welcome_email_sent_at = now()
WHERE welcome_email_sent_at IS NULL;
