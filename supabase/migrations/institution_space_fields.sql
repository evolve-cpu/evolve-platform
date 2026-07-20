-- ============================================================
-- institution_space_fields migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds the fields the institution self-serve onboarding (Door 2)
-- collects: rich organization profile data (fetched from the
-- institute's link or entered manually), the admin's org-facing
-- title/role, and their personal portfolio/LinkedIn link.
-- Purely additive — safe to run on top of onboarding_and_orgs.sql.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. ORGANIZATIONS — space profile fields
-- ─────────────────────────────────────────────
alter table public.organizations
  add column if not exists website            text,
  add column if not exists logo_url           text,
  add column if not exists bio                text,
  add column if not exists location           text,
  add column if not exists year_founded       text,
  add column if not exists setup_mode         text,   -- e.g. online / offline (in-person) / hybrid
  add column if not exists expected_members   text,   -- e.g. "11–25" — a range, not a hard count
  add column if not exists programme_details  text,   -- institute: programmes offered; company: focus area
  add column if not exists source_url         text;   -- the link the admin gave us to fetch details from

-- ─────────────────────────────────────────────
-- 2. ORGANIZATION_MEMBERS — org-facing title
--    distinct from `role` (owner/admin/member permission level) —
--    this is the human-readable designation, e.g. "head of department"
-- ─────────────────────────────────────────────
alter table public.organization_members
  add column if not exists title text;

-- ─────────────────────────────────────────────
-- 3. PROFILES — personal portfolio / LinkedIn link
--    collected once, on the admin-profile step of team onboarding
-- ─────────────────────────────────────────────
alter table public.profiles
  add column if not exists portfolio_url text;
