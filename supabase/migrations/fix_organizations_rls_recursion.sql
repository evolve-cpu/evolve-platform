-- ============================================================
-- fix_organizations_rls_recursion migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- onboarding_and_orgs.sql gave organizations and organization_members
-- policies that each query the *other* RLS-protected table directly:
--   organizations."members can read"      → queries organization_members
--   organization_members."owner manage"   → queries organizations
-- That's a cycle: evaluating one table's policy requires evaluating the
-- other table's policy, which requires the first again. Postgres detects
-- this and throws "infinite recursion detected in policy for relation
-- organizations" — hit as soon as an insert into organization_members
-- (right after creating an org) needed both policies evaluated together.
--
-- Fix: move each cross-table membership check into a SECURITY DEFINER
-- function. Such a function runs as its owner (the table owner), and
-- table owners bypass RLS on the tables they own by default — so the
-- lookup inside the function never re-triggers the calling policy,
-- breaking the cycle. This is the standard pattern for cross-table RLS
-- checks recommended by Supabase/Postgres.
-- ============================================================

create or replace function public.is_org_owner(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organizations o
    where o.id = target_org_id and o.owner_id = auth.uid()
  );
$$;

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members m
    where m.org_id = target_org_id and m.user_id = auth.uid()
  );
$$;

grant execute on function public.is_org_owner(uuid) to anon, authenticated;
grant execute on function public.is_org_member(uuid) to anon, authenticated;

-- organizations: members can read — via is_org_member() instead of a
-- direct correlated subquery into organization_members
drop policy if exists "organizations: members can read" on public.organizations;
create policy "organizations: members can read"
  on public.organizations for select
  using (public.is_org_member(id));

-- organization_members: owner manage — via is_org_owner() instead of a
-- direct correlated subquery into organizations
drop policy if exists "organization_members: owner manage" on public.organization_members;
create policy "organization_members: owner manage"
  on public.organization_members for all
  using (public.is_org_owner(org_id))
  with check (public.is_org_owner(org_id));
