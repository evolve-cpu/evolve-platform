-- ============================================================
-- admin_users migration
-- Run this in Supabase SQL Editor (or via supabase db push)
--
-- Who may use the Evolve admin panel. Replaces the 4-digit PIN
-- (VITE_ADMIN_PIN / VITE_ANANT_ADMIN_PIN), which shipped inside the
-- public JS bundle along with the service-role key.
--
-- Admins sign in with their normal Evolve account (any sign-in method);
-- api/admin.js checks the signed-in, email-verified address against this
-- table before running anything with the service-role key. Anant staff
-- are recognised from anu_admins / anu_faculty as before.
--
-- RLS on, no policies: only the service role (api/admin.js) can read it.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  email      TEXT PRIMARY KEY CHECK (email = lower(email)),
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Add every internal team member who needs the admin panel (lowercase):
INSERT INTO public.admin_users (email, note) VALUES
  ('content@evolvedesign.academy', 'initial admin'),
  ('sonam@evolvedesign.academy', null),
  ('arnabmajumdar399@gmail.com', null),
  ('arnab@evolvedesign.academy', null),
  ('sakshi@evolvedesign.academy', null),
  ('yash@evolvedesign.academy', null),
  ('chesna@paperclip.design', null),
  ('yagnesh@paperclip.design', null)
ON CONFLICT (email) DO NOTHING;
