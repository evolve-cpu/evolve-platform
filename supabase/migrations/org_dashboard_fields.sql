-- ============================================================
-- org_dashboard_fields migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds the extra profile-editing fields needed for the org space's new
-- dashboard-style overview page (institute profile / about / social links
-- / awards & accreditation sections, each independently editable+savable).
-- ============================================================

alter table public.organizations
  add column if not exists about_short  text,
  add column if not exists social_links jsonb not null default '[]',
  add column if not exists awards       jsonb not null default '[]';
