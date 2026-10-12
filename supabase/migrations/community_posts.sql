-- ============================================================
-- community_posts migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- The app's Community tab: messages from chosen Discord channels, synced by
-- api/_discordCommunity.js (via api/admin.js op "community_feed"). Read and
-- written only by the server (service role), so RLS is on with no policies.
-- Images are copied into the public community-media bucket because Discord's
-- own attachment links expire after about a day.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.community_posts (
  id                TEXT PRIMARY KEY,          -- Discord message id
  channel_id        TEXT NOT NULL,
  channel_name      TEXT,
  author_name       TEXT NOT NULL,
  author_avatar_url TEXT,
  content           TEXT NOT NULL DEFAULT '',
  attachments       JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{kind:"image",url,width,height,name} | {kind:"file",name}]
  reactions         JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{emoji, count}]
  jump_url          TEXT NOT NULL,
  posted_at         TIMESTAMPTZ NOT NULL,
  edited_at         TIMESTAMPTZ,
  synced_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_posts_posted_at_idx ON public.community_posts (posted_at DESC);
CREATE INDEX IF NOT EXISTS community_posts_channel_idx ON public.community_posts (channel_id, posted_at DESC);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- one row: when the feed last pulled from Discord (claimed atomically so
-- only one request syncs at a time) and the last error, if any
CREATE TABLE IF NOT EXISTS public.community_sync_state (
  id             INTEGER PRIMARY KEY CHECK (id = 1),
  last_synced_at TIMESTAMPTZ,
  last_error     TEXT
);
INSERT INTO public.community_sync_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.community_sync_state ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public)
VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;
