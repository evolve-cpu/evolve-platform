-- ============================================================
-- Typetober — a 26-day (Oct 1–26) design challenge. One letter unlocks
-- per calendar day; a user may submit any number of illustrations per
-- letter, ₹10 each (every paid row counts as one submission toward the
-- 10 / 18 / 26 certificates). Table stores each attempt (pending until paid, success once
-- Razorpay verifies), bucket stores the illustration itself.
--
-- Payment writes (insert pending row / flip to success) happen only from
-- api/razorpay-create-order.js using the service-role key, which bypasses
-- RLS entirely — same pattern as mentorship_enrollments. RLS below only
-- has to gate what a signed-in participant can *read* directly from the
-- client (their own rows + everyone's paid-and-live rows for the wall).
-- Run in Supabase SQL Editor.
-- ============================================================

create table if not exists typetober_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  letter_index smallint not null check (letter_index >= 0 and letter_index <= 25),
  image_path text,
  caption text,
  amount numeric not null default 10,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamptz not null default now()
);

-- Earlier drafts allowed one submission per letter. If that version was
-- already run, drop the constraint so repeat submissions can be inserted.
alter table typetober_submissions
  drop constraint if exists typetober_submissions_user_id_letter_index_key;

create index if not exists typetober_submissions_letter_idx
  on typetober_submissions (letter_index)
  where status = 'success';

create index if not exists typetober_submissions_user_idx
  on typetober_submissions (user_id);

alter table typetober_submissions enable row level security;

drop policy if exists "typetober: read own rows" on typetober_submissions;
create policy "typetober: read own rows"
  on typetober_submissions for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "typetober: read the live wall" on typetober_submissions;
create policy "typetober: read the live wall"
  on typetober_submissions for select
  to authenticated
  using (status = 'success');

-- No insert/update policies for anon/authenticated — every write goes
-- through api/razorpay-create-order.js with the service-role key, which
-- bypasses RLS. This keeps "pending → success" a server-verified step,
-- never something the client can flip on its own.

-- ── storage bucket for the illustrations themselves ──────────────────
insert into storage.buckets (id, name, public)
values ('typetober-submissions', 'typetober-submissions', true)
on conflict (id) do nothing;

drop policy if exists "typetober images: public read" on storage.objects;
create policy "typetober images: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'typetober-submissions');

drop policy if exists "typetober images: users upload to own folder" on storage.objects;
create policy "typetober images: users upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'typetober-submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── public share links (/typetober?s=<submission id>) ────────────────
-- A shared link must open for anyone, signed in or not. Rather than open
-- the whole table to anon (it holds payment ids), expose exactly one live
-- submission's public fields through a security-definer function.
create or replace function typetober_public_submission(sub_id uuid)
returns table (
  id uuid,
  user_id uuid,
  letter_index smallint,
  image_path text,
  created_at timestamptz,
  name text,
  username text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.user_id, s.letter_index, s.image_path, s.created_at,
         p.name, p.username, p.avatar_url
  from typetober_submissions s
  left join profiles p on p.id = s.user_id
  where s.id = sub_id and s.status = 'success';
$$;

revoke all on function typetober_public_submission(uuid) from public;
grant execute on function typetober_public_submission(uuid) to anon, authenticated;

-- Friendly share links: /typetober/<username>/<letter>[-n], e.g.
-- /typetober/arnab/a (their first A) or /typetober/arnab/a-2 (second A).
-- n counts that user's paid submissions for the letter, oldest first.
create or replace function typetober_submission_by_handle(handle text, letter smallint, n int default 1)
returns table (
  id uuid,
  user_id uuid,
  letter_index smallint,
  image_path text,
  created_at timestamptz,
  name text,
  username text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.user_id, s.letter_index, s.image_path, s.created_at,
         p.name, p.username, p.avatar_url
  from typetober_submissions s
  join profiles p on p.id = s.user_id
  where lower(p.username) = lower(handle)
    and s.letter_index = letter
    and s.status = 'success'
  order by s.created_at, s.id
  offset greatest(n, 1) - 1
  limit 1;
$$;

revoke all on function typetober_submission_by_handle(text, smallint, int) from public;
grant execute on function typetober_submission_by_handle(text, smallint, int) to anon, authenticated;

-- ── admin examples: up to two sample illustrations per letter ────────
-- Uploaded from the admin panel (service-role client). They show as the
-- first tiles of a letter's grid once that letter unlocks. Images live in
-- the typetober-submissions bucket under examples/.
create table if not exists typetober_examples (
  id uuid primary key default gen_random_uuid(),
  letter_index smallint not null check (letter_index >= 0 and letter_index <= 25),
  slot smallint not null check (slot in (1, 2)),
  image_path text not null,
  credit text,
  created_at timestamptz not null default now(),
  unique (letter_index, slot)
);

alter table typetober_examples enable row level security;

drop policy if exists "typetober examples: public read" on typetober_examples;
create policy "typetober examples: public read"
  on typetober_examples for select
  to anon, authenticated
  using (true);

-- ── daily streaks ─────────────────────────────────────────────────────
-- One row per participant, kept up to date by a trigger whenever a
-- submission becomes paid ("success"), so every write path (Razorpay
-- verify, local dev bypass) counts. Days are India calendar days. A day
-- counts once however many submissions land on it.
create table if not exists typetober_streaks (
  user_id uuid primary key references profiles(id) on delete cascade,
  current_streak int not null default 0,
  best_streak int not null default 0,
  last_day date,
  updated_at timestamptz not null default now()
);

alter table typetober_streaks enable row level security;

drop policy if exists "typetober streaks: read own" on typetober_streaks;
create policy "typetober streaks: read own"
  on typetober_streaks for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function typetober_bump_streak()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if new.status <> 'success' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status = 'success' then
    return new;
  end if;

  insert into typetober_streaks as s (user_id, current_streak, best_streak, last_day, updated_at)
  values (new.user_id, 1, 1, today, now())
  on conflict (user_id) do update set
    current_streak = case
      when s.last_day = today then s.current_streak
      when s.last_day = today - 1 then s.current_streak + 1
      else 1
    end,
    best_streak = greatest(s.best_streak, case
      when s.last_day = today then s.current_streak
      when s.last_day = today - 1 then s.current_streak + 1
      else 1
    end),
    last_day = today,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists typetober_streak_on_success on typetober_submissions;
create trigger typetober_streak_on_success
  after insert or update of status on typetober_submissions
  for each row execute function typetober_bump_streak();
