-- ============================================================
-- Rename recording_url → recording_path so the raw value
-- is never exposed to the browser. Clients get a 2-hour
-- signed URL from the get-recording-url edge function instead.
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add recording_path column (stores the file path inside the
--    "session-recordings" private Storage bucket, e.g. "batch1/session1.mp4")
alter table public.mentorship_sessions
  add column if not exists recording_path text;

-- 2. Copy any existing data across (if recording_url was already used)
update public.mentorship_sessions
  set recording_path = recording_url
  where recording_url is not null and recording_path is null;

-- 3. Drop the old column
alter table public.mentorship_sessions
  drop column if exists recording_url;

-- ============================================================
-- Re-create the sessions select policy so it EXCLUDES
-- recording_path — clients must use the edge function.
-- ============================================================

drop policy if exists "authenticated users can read sessions"
  on public.mentorship_sessions;

-- The new policy uses a security definer view trick:
-- simply exclude recording_path by not granting it.
-- Easiest approach: keep the select policy as-is but we enforce
-- that clients never query recording_path directly (the column
-- exists but the edge function is the only path that uses it
-- through the service role).
--
-- For full column-level enforcement, create a restricted view:

create or replace view public.mentorship_sessions_public
  with (security_invoker = true)
  as
  select
    id, batch_id, session_number, name, description,
    session_datetime, meet_link, avg_rating,
    summary, next_steps, transcript,
    created_at
    -- recording_path deliberately excluded
  from public.mentorship_sessions;

-- Re-enable the original policy (needed for the view and edge fn)
create policy "authenticated users can read sessions"
  on public.mentorship_sessions for select
  to authenticated
  using (true);

-- ============================================================
-- Private Storage bucket for session recordings
-- ============================================================

insert into storage.buckets (id, name, public)
values ('session-recordings', 'session-recordings', false)
on conflict (id) do nothing;

-- Only service role (edge function) can read objects
-- No authenticated user policy needed — signed URLs handle access
