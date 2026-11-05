-- ============================================================
-- typetober_coupons migration
-- Run this in Supabase SQL Editor (or via supabase db push)
-- Run AFTER membership_plans.sql.
--
-- Typetober winners get a coupon for a free annual evolve plan. Admins add
-- winners (name + email) from the admin panel's "typetober coupons" tab,
-- which issues each one a code (op "coupon_issue", api/_typetoberCoupons.js).
-- The winner sees the code in the app's membership pop-ups and redeems it
-- there (op "coupon_redeem"); the code is also shown in the admin tab so it
-- can be DMed. One redemption per code, and only by the account signed in
-- with that email (a forwarded code does nothing for anyone else).
--
-- Redeeming writes a "manual_…" plan purchase (amount 0), so it shows in
-- Grant access → Recent manual grants and can be revoked from there.
--
-- Only the service role (api/admin.js) touches this table — RLS on, no
-- policies.
-- ============================================================

create table if not exists public.typetober_coupons (
  id            uuid        primary key default gen_random_uuid(),
  code          text        not null unique,
  name          text,
  email         text        not null unique,   -- stored lower-case
  plan          text        not null default 'annual' check (plan in ('monthly', 'annual')),
  created_at    timestamptz not null default now(),
  redeemed_at   timestamptz,
  redeemed_by   uuid        references public.profiles(id) on delete set null
);

alter table public.typetober_coupons enable row level security;
