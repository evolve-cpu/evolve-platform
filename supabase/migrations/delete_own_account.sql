-- ============================================================
-- delete_own_account migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- "Delete account" in the avatar menu (PublicProfile.jsx) calls
-- supabase.rpc("delete_own_account"), which didn't exist — so it always
-- failed with "Couldn't delete your account right now". This adds it.
--
-- Deleting the profile cascades to every table keyed off profiles(id)
-- (registrations, purchases, reviews, mentorship, typetober, ...); the
-- auth.users row goes last so the person can't sign back into an empty
-- account. Security definer (owned by postgres) is what lets it touch
-- auth.users; it only ever deletes the caller's own id.
-- ============================================================

create or replace function public.delete_own_account()
returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;

  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
