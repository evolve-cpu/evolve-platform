-- ============================================================
-- Recording + content fields on mentorship_sessions
-- Run in Supabase SQL Editor
-- ============================================================

alter table public.mentorship_sessions
  add column if not exists recording_url  text,
  add column if not exists summary        text,
  add column if not exists next_steps     text,
  add column if not exists transcript     text;

-- ============================================================
-- mentorship_session_comments
-- Supports top-level comments and one level of replies (parent_id)
-- ============================================================

create table if not exists public.mentorship_session_comments (
  id         uuid        primary key default gen_random_uuid(),
  session_id uuid        not null references public.mentorship_sessions(id) on delete cascade,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  user_name  text,
  avatar_url text,
  body       text        not null,
  parent_id  uuid        references public.mentorship_session_comments(id) on delete cascade,
  created_at timestamptz default now() not null
);

alter table public.mentorship_session_comments enable row level security;

-- Any enrolled/authenticated user can read all comments on a session
create policy "authenticated can read session comments"
  on public.mentorship_session_comments for select
  to authenticated using (true);

create policy "users can insert own comments"
  on public.mentorship_session_comments for insert
  with check (auth.uid() = user_id);

create policy "users can delete own comments"
  on public.mentorship_session_comments for delete
  using (auth.uid() = user_id);
