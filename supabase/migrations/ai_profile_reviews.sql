-- ============================================================
-- AI profile review dataset — the raw material for Evolve's own
-- profile model. Two tables:
--
--   ai_profile_reviews       one human review of one AI profile (who, when,
--                            overall accuracy) with its own copy of the input
--                            and output, so it stays replayable even if the
--                            user later rebuilds their profile.
--   ai_profile_review_items  one verdict per field / list item: agree,
--                            disagree or missing — with what it should be,
--                            gap type, severity and the reviewer's REASONING.
--
-- Admin-only: RLS on with no policies, so only the service role (api/admin.js
-- for evolve admins) can read or write. Same trust
-- boundary as the other admin tables.
-- Run in Supabase SQL Editor (or via supabase db push).
-- ============================================================

create table if not exists public.ai_profile_reviews (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references public.profiles(id) on delete cascade,
  run_id             uuid,                    -- reserved for per-run logging (not used yet)
  reviewer_id        uuid,
  reviewer_email     text,
  profile_source     text        check (profile_source in ('self_built', 'team_built')),
  model              text,
  prompt_version     text,
  profile_generated_at timestamptz,
  input_snapshot     jsonb,
  ai_output          jsonb       not null,
  overall_accuracy   smallint    check (overall_accuracy between 1 and 5),
  overall_notes      text,
  agree_count        integer     not null default 0,
  disagree_count     integer     not null default 0,
  missing_count      integer     not null default 0,
  created_at         timestamptz not null default now()
);
create index if not exists ai_profile_reviews_user_idx on public.ai_profile_reviews (user_id, created_at desc);
alter table public.ai_profile_reviews enable row level security;


create table if not exists public.ai_profile_review_items (
  id                 uuid        primary key default gen_random_uuid(),
  review_id          uuid        not null references public.ai_profile_reviews(id) on delete cascade,
  field_path         text        not null,   -- e.g. 'stage.level', 'skills[2]', 'skills[+]' (missing item)
  field_label        text,
  verdict            text        not null check (verdict in ('agree', 'disagree', 'missing')),
  ai_value           jsonb,                  -- what the AI said (null for 'missing')
  human_value        text,                   -- what it should be
  gap_type           text        check (gap_type in (
                       'missed_info', 'made_up', 'overrated', 'underrated',
                       'wrong_interpretation', 'bad_input', 'wording'
                     )),
  severity           text        check (severity in ('minor', 'major', 'wrong')),
  reasoning          text,
  evidence           text,
  created_at         timestamptz not null default now(),
  -- a disagreement without a reason is useless as training data
  constraint ai_profile_review_items_reason_required
    check (verdict = 'agree' or (coalesce(btrim(reasoning), '') <> '' and gap_type is not null))
);
create index if not exists ai_profile_review_items_review_idx on public.ai_profile_review_items (review_id);
create index if not exists ai_profile_review_items_field_idx on public.ai_profile_review_items (field_path, verdict);
alter table public.ai_profile_review_items enable row level security;
