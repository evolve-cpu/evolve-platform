-- ============================================================
-- mentorship_sessions table
-- One row per session per batch (5 sessions per batch).
-- session_datetime stored in UTC — 9:30 PM IST = 16:00:00 UTC
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

create table if not exists public.mentorship_sessions (
  id               uuid        primary key default gen_random_uuid(),
  batch_id         uuid        not null references public.mentorship_batches(id) on delete cascade,
  session_number   int         not null check (session_number between 1 and 5),
  name             text        not null,    -- e.g. "discover", "analyse"
  description      text,                   -- paragraph shown on session detail page
  session_datetime timestamptz not null,   -- full datetime in UTC (display converted to IST on frontend)
  created_at       timestamptz default now() not null,

  unique (batch_id, session_number)
);

-- RLS
alter table public.mentorship_sessions enable row level security;

-- Enrolled users (anyone with a successful payment for this batch) can read sessions
-- For simplicity: allow any authenticated user to read sessions.
-- Tighten this later if needed (e.g. join with mentorship_payments).
create policy "authenticated users can read sessions"
  on public.mentorship_sessions for select
  to authenticated
  using (true);

-- Only service role / admin can insert, update, delete sessions
-- (no insert/update/delete policy for authenticated → only service role can write)

-- ============================================================
-- Sample insert for batch 1 (adjust batch_id and dates as needed)
-- ============================================================
-- Replace 'YOUR_BATCH_ID' with the actual uuid from mentorship_batches.
--
-- insert into public.mentorship_sessions (batch_id, session_number, name, description, session_datetime) values
--   ('YOUR_BATCH_ID', 1, 'discover',  'Getting to know you, your interests, motivations, and how you currently approach design. You''ll also gain a deeper understanding of yourself through this process.',  '2025-04-30 16:00:00+00'),
--   ('YOUR_BATCH_ID', 2, 'analyse',   'Identify your strengths and gaps. Review how you''ve defined your past experiences and sharpen how you tell your story.',                                            '2025-05-07 16:00:00+00'),
--   ('YOUR_BATCH_ID', 3, 'design',    'Apply design thinking to your own career path. Build frameworks that help you move with clarity.',                                                                 '2025-05-14 16:00:00+00'),
--   ('YOUR_BATCH_ID', 4, 'build',     'Turn insights into action. Start building the portfolio and presence you actually want.',                                                                         '2025-05-21 16:00:00+00'),
--   ('YOUR_BATCH_ID', 5, 'present',   'Share your work, get feedback, and walk away with a clear next step. Celebrate how far you''ve come.',                                                           '2025-05-28 16:00:00+00');
