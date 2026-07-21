-- ============================================================
-- org_invites migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Adds role-partitioned invites (student / faculty / admin) for org spaces,
-- with a token-based invite-landing page that works BEFORE the invitee has
-- signed in (email → /invite/:token → sign in with that email → accept).
-- ============================================================

alter table public.organization_members
  add column if not exists member_type   text check (member_type in ('student', 'faculty', 'admin')),
  add column if not exists invite_token  uuid not null default gen_random_uuid(),
  add column if not exists invited_by    uuid references public.profiles(id) on delete set null,
  add column if not exists invite_sent_at timestamptz,
  add column if not exists intake        jsonb;

create unique index if not exists organization_members_invite_token_idx
  on public.organization_members (invite_token);

-- ─────────────────────────────────────────────
-- get_invite_by_token
-- Public-safe lookup for the invite-landing page — callable by anon,
-- before the invitee has signed in. Exposes only what the landing screen
-- needs, never the raw organizations/organization_members rows.
-- ─────────────────────────────────────────────
create or replace function public.get_invite_by_token(p_token uuid)
returns table (
  org_name text,
  org_logo_url text,
  org_bio text,
  org_location text,
  org_type text,
  org_slug text,
  role text,
  member_type text,
  status text,
  invited_email text,
  inviter_name text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    o.name, o.logo_url, o.bio, o.location, o.org_type, o.slug,
    m.role, m.member_type, m.status, m.invited_email,
    p.name as inviter_name
  from public.organization_members m
  join public.organizations o on o.id = m.org_id
  left join public.profiles p on p.id = m.invited_by
  where m.invite_token = p_token;
$$;

grant execute on function public.get_invite_by_token(uuid) to anon, authenticated;

-- ─────────────────────────────────────────────
-- accept_org_invite
-- Claims a pending invite for the currently signed-in user. Only succeeds
-- if the signed-in email matches the invited email (case-insensitive) —
-- the unguessable token (emailed only to that address) plus this check
-- keeps one person from claiming someone else's invite.
-- ─────────────────────────────────────────────
create or replace function public.accept_org_invite(p_token uuid, p_intake jsonb default null)
returns table (org_slug text, role text, member_type text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.organization_members%rowtype;
  v_email  text;
begin
  select lower(auth.email()) into v_email;

  select * into v_member
  from public.organization_members
  where invite_token = p_token
  for update;

  if v_member.id is null then
    raise exception 'invite not found';
  end if;

  if v_member.invited_email is not null and lower(v_member.invited_email) <> v_email then
    raise exception 'this invite was sent to a different email address';
  end if;

  update public.organization_members
  set user_id = auth.uid(), status = 'active', intake = coalesce(p_intake, v_member.intake)
  where id = v_member.id;

  return query
    select o.slug, v_member.role, v_member.member_type
    from public.organizations o where o.id = v_member.org_id;
end;
$$;

grant execute on function public.accept_org_invite(uuid, jsonb) to authenticated;
