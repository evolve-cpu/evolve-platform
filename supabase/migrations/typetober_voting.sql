-- ============================================================
-- Typetober — community favourite voting. Opens when submissions close
-- (31 Oct, 11:59 PM IST) and runs until the window in
-- typetober_vote_config. Each signed-in person gets `vote_limit` votes,
-- at most one per submission, never on their own work. A vote can be taken
-- back while voting is open, which frees it up again.
--
-- Every rule is enforced here, in security-definer functions; the client
-- has no insert/update/delete policies on these tables. Counts are public
-- (shown on every tile); who voted for what is only visible to the voter
-- themselves and to the admin panel (service-role client).
-- Run in Supabase SQL Editor after typetober_submissions.sql.
-- ============================================================

-- One row. Edit it in the SQL editor to move the window or change the limit;
-- the board picks the new values up on its next load.
create table if not exists typetober_vote_config (
  id boolean primary key default true check (id),
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  vote_limit int not null check (vote_limit > 0)
);

insert into typetober_vote_config (id, opens_at, closes_at, vote_limit)
values (true, '2026-11-01 00:00+05:30', '2026-11-07 00:00+05:30', 5)
on conflict (id) do nothing;

-- 5 votes per person (an earlier draft of this file used 10).
update typetober_vote_config set vote_limit = 5 where vote_limit = 10;

alter table typetober_vote_config enable row level security;

create table if not exists typetober_votes (
  submission_id uuid not null references typetober_submissions(id) on delete cascade,
  voter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (submission_id, voter_id)
);

create index if not exists typetober_votes_voter_idx on typetober_votes (voter_id);

alter table typetober_votes enable row level security;

drop policy if exists "typetober votes: read own" on typetober_votes;
create policy "typetober votes: read own"
  on typetober_votes for select
  to authenticated
  using (auth.uid() = voter_id);

-- Everything that happened, for the admin report: votes, take-backs and the
-- attempts that were turned away (own work, out of votes, voting closed).
create table if not exists typetober_vote_events (
  id bigint generated always as identity primary key,
  voter_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid references typetober_submissions(id) on delete cascade,
  action text not null check (action in ('vote', 'unvote', 'blocked_own', 'blocked_limit', 'blocked_closed')),
  created_at timestamptz not null default now()
);

create index if not exists typetober_vote_events_created_idx on typetober_vote_events (created_at);

alter table typetober_vote_events enable row level security;

-- ── everything the board needs in one call ───────────────────────────
-- Window + limit, vote count per submission, and (signed in) which
-- submissions this person has voted for.
create or replace function typetober_vote_state()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'opens_at', c.opens_at,
    'closes_at', c.closes_at,
    'vote_limit', c.vote_limit,
    'counts', coalesce((
      select json_object_agg(v.submission_id, v.n)
      from (select submission_id, count(*) as n from typetober_votes group by submission_id) v
    ), '{}'::json),
    'mine', coalesce((
      select json_agg(v.submission_id)
      from typetober_votes v
      where v.voter_id = auth.uid()
    ), '[]'::json)
  )
  from typetober_vote_config c;
$$;

revoke all on function typetober_vote_state() from public;
grant execute on function typetober_vote_state() to anon, authenticated;

-- ── cast / take back a vote ──────────────────────────────────────────
-- Returns { ok, error?, votes, used, limit }:
--   error = own_submission | limit_reached | voting_closed | not_found
--   votes = that submission's count after the change, used = this
--   person's votes in use.
create or replace function typetober_cast_vote(sub_id uuid, cast_it boolean default true)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cfg typetober_vote_config;
  owner uuid;
  used int;
  tester boolean;
  err text;
begin
  if uid is null then
    return json_build_object('ok', false, 'error', 'unauthorized');
  end if;

  -- One vote change at a time per person, so two quick taps can't both
  -- squeeze under the limit.
  perform pg_advisory_xact_lock(hashtext('typetober_vote:' || uid::text));

  select * into cfg from typetober_vote_config;

  -- Team accounts (admin_users) may vote outside the window, so the flow
  -- can be tested on dev.evolvedesign.academy before voting opens. Their
  -- early votes are cleared with the snippet at the bottom of this file.
  select exists (
    select 1 from admin_users a
    join auth.users u on lower(u.email) = a.email
    where u.id = uid
  ) into tester;
  select s.user_id into owner
  from typetober_submissions s
  where s.id = sub_id and s.status = 'success';

  if owner is null then
    err := 'not_found';
  elsif not tester and (now() < cfg.opens_at or now() >= cfg.closes_at) then
    err := 'voting_closed';
    insert into typetober_vote_events (voter_id, submission_id, action) values (uid, sub_id, 'blocked_closed');
  elsif cast_it and owner = uid then
    err := 'own_submission';
    insert into typetober_vote_events (voter_id, submission_id, action) values (uid, sub_id, 'blocked_own');
  elsif cast_it then
    if not exists (select 1 from typetober_votes where submission_id = sub_id and voter_id = uid) then
      select count(*) into used from typetober_votes where voter_id = uid;
      if used >= cfg.vote_limit then
        err := 'limit_reached';
        insert into typetober_vote_events (voter_id, submission_id, action) values (uid, sub_id, 'blocked_limit');
      else
        insert into typetober_votes (submission_id, voter_id) values (sub_id, uid);
        insert into typetober_vote_events (voter_id, submission_id, action) values (uid, sub_id, 'vote');
      end if;
    end if;
  else
    delete from typetober_votes where submission_id = sub_id and voter_id = uid;
    if found then
      insert into typetober_vote_events (voter_id, submission_id, action) values (uid, sub_id, 'unvote');
    end if;
  end if;

  return json_build_object(
    'ok', err is null,
    'error', err,
    'votes', (select count(*) from typetober_votes where submission_id = sub_id),
    'used', (select count(*) from typetober_votes where voter_id = uid),
    'limit', cfg.vote_limit
  );
end;
$$;

revoke all on function typetober_cast_vote(uuid, boolean) from public;
grant execute on function typetober_cast_vote(uuid, boolean) to authenticated;

-- ── after testing: clear the team's early test votes ─────────────────
-- Run once before voting opens (anything cast before opens_at is a test):
--   delete from typetober_votes where created_at < (select opens_at from typetober_vote_config);
--   delete from typetober_vote_events where created_at < (select opens_at from typetober_vote_config);

-- ── fix for an earlier draft ─────────────────────────────────────────
-- voter_id first referenced profiles(id). That gave the API a second
-- submissions → profiles path (through these tables), which broke the
-- wall's `profiles(...)` embed ("more than one relationship was found").
-- auth.users isn't exposed to the API, so pointing at it removes the path.
alter table typetober_votes drop constraint if exists typetober_votes_voter_id_fkey;
alter table typetober_votes add constraint typetober_votes_voter_id_fkey
  foreign key (voter_id) references auth.users(id) on delete cascade;
alter table typetober_vote_events drop constraint if exists typetober_vote_events_voter_id_fkey;
alter table typetober_vote_events add constraint typetober_vote_events_voter_id_fkey
  foreign key (voter_id) references auth.users(id) on delete cascade;
notify pgrst, 'reload schema';
