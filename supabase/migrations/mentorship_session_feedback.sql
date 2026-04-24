-- ============================================================
-- mentorship_session_feedback table
-- One row per user per session. Stores 1-5 heart rating + comment.
-- avg_rating column on mentorship_sessions is updated after each insert.
-- Run this in Supabase SQL Editor
-- ============================================================

create table if not exists public.mentorship_session_feedback (
  id             uuid        primary key default gen_random_uuid(),
  session_id     uuid        not null references public.mentorship_sessions(id) on delete cascade,
  user_id        uuid        not null references public.profiles(id) on delete cascade,
  user_name      text,
  session_name   text,
  session_number int,
  rating         int         not null check (rating between 1 and 5),
  comment        text,
  created_at     timestamptz default now() not null,

  unique (session_id, user_id)
);

-- RLS
alter table public.mentorship_session_feedback enable row level security;

create policy "users can insert own session feedback"
  on public.mentorship_session_feedback for insert
  with check (auth.uid() = user_id);

create policy "users can update own session feedback"
  on public.mentorship_session_feedback for update
  using (auth.uid() = user_id);

create policy "users can read own session feedback"
  on public.mentorship_session_feedback for select
  using (auth.uid() = user_id);

-- Allow admins/service role to read all feedback
-- (no extra policy needed — service role bypasses RLS)

-- ============================================================
-- Add avg_rating to mentorship_sessions
-- ============================================================

alter table public.mentorship_sessions
  add column if not exists avg_rating numeric(3,2);

-- ============================================================
-- Trigger: recalculate avg_rating on mentorship_sessions
-- whenever feedback is inserted or updated
-- ============================================================

create or replace function public.update_session_avg_rating()
returns trigger language plpgsql as $$
begin
  update public.mentorship_sessions
  set avg_rating = (
    select round(avg(rating)::numeric, 2)
    from public.mentorship_session_feedback
    where session_id = NEW.session_id
  )
  where id = NEW.session_id;
  return NEW;
end;
$$;

create trigger mentorship_session_feedback_avg
  after insert or update on public.mentorship_session_feedback
  for each row execute function public.update_session_avg_rating();
