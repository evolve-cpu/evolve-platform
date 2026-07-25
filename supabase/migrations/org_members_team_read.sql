-- ============================================================
-- org_members_team_read migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Bug: organization_members only had an "owner manage" policy (owner-only)
-- and a "self read" policy (auth.uid() = user_id, i.e. only your OWN row).
-- Non-owner members (students, faculty, admins) could therefore only ever
-- read their own membership row — so the team tab's counts/lists looked
-- empty to them even when other members existed.
--
-- Fix: any active member of an org can read ALL membership rows of that
-- org (not just their own), via the existing is_org_member() SECURITY
-- DEFINER helper (from org_invites.sql) — safe from the recursion this
-- app hit before, since the function bypasses RLS instead of re-querying
-- organization_members through its own policy.
-- ============================================================

drop policy if exists "organization_members: self read" on public.organization_members;
drop policy if exists "organization_members: team can read all" on public.organization_members;
create policy "organization_members: team can read all"
  on public.organization_members for select
  using (public.is_org_member(org_id));
