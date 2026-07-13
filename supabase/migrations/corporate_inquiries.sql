-- ============================================================
-- corporate_inquiries table + widen institute_inquiries.programme
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- The generic /institutions audience page (and its nav/footer "get in
-- touch") isn't tied to a specific programme like the two existing
-- /for-institutes/* pages are, so it needs its own catch-all value.
ALTER TABLE public.institute_inquiries DROP CONSTRAINT IF EXISTS institute_inquiries_programme_check;
ALTER TABLE public.institute_inquiries ADD CONSTRAINT institute_inquiries_programme_check
  CHECK (programme IN ('find-your-niche', 'portfolio-review', 'institutions'));

CREATE TABLE IF NOT EXISTS public.corporate_inquiries (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  company_name   TEXT        NOT NULL,
  email          TEXT        NOT NULL,
  phone          TEXT        NOT NULL,
  looking_for    TEXT,
  programme      TEXT        NOT NULL DEFAULT 'corporates' CHECK (programme IN ('corporates')),
  intent         TEXT        NOT NULL DEFAULT 'contact' CHECK (intent IN ('contact', 'handbook')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY;

-- public lead-gen form — anyone can submit, nobody can read back via anon/authenticated
CREATE POLICY "corporate_inquiries: public insert"
  ON public.corporate_inquiries FOR INSERT
  WITH CHECK (true);
