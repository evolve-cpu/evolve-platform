-- ============================================================
-- org_settings migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds the fields backing the new settings page: page visibility,
-- per-org notification toggles, and a soft-delete marker for "delete this
-- space" (kept recoverable — nothing purges it automatically yet, that's
-- a follow-up if/when it's actually needed).
-- ============================================================

alter table public.organizations
  add column if not exists visibility text not null default 'public' check (visibility in ('public', 'private')),
  add column if not exists notification_prefs jsonb not null default '{"new_member": true, "weekly_analytics": true, "billing": true, "product_updates": false}',
  add column if not exists deleted_at timestamptz;
