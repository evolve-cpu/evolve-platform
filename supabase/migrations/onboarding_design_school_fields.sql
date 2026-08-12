-- ============================================================
-- onboarding_design_school_fields migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds school_name / standard / stream to profiles, captured by the chat
-- onboarding only when the person identifies as a "Design school student".
-- Used later to route portfolio-review Calendly links by stream/topic.
-- ============================================================

alter table public.profiles
  add column if not exists school_name text,
  add column if not exists standard    text,
  add column if not exists stream      text;
