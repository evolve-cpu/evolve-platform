-- ============================================================
-- org_team_management migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Supports the team tab's add-one / csv / find-on-evolve flows:
--   - invited_name: a display name for someone invited by email who
--     doesn't have an evolve account yet (nothing to join against until
--     they accept).
--   - respond_to_org_invite: lets a signed-in evolve user accept/decline
--     a membership row that was added by user_id directly (the
--     "find on evolve" path, added without a token/email — this is what
--     "they accept in-app" means).
-- ============================================================

alter table public.organization_members
  add column if not exists invited_name text;

create or replace function public.respond_to_org_invite(p_member_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_accept then
    update public.organization_members
    set status = 'active'
    where id = p_member_id and user_id = auth.uid() and status = 'pending';
  else
    delete from public.organization_members
    where id = p_member_id and user_id = auth.uid() and status = 'pending';
  end if;
end;
$$;

grant execute on function public.respond_to_org_invite(uuid, boolean) to authenticated;
