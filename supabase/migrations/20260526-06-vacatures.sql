-- Migration: Create vacatures table
-- T057: Vacatures/stages bij sponsoren

CREATE TABLE IF NOT EXISTS vacatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_logo TEXT,
  type TEXT NOT NULL DEFAULT 'stage', -- 'stage' | 'werkplek' | 'bijbaan' | 'afstuderen'
  description TEXT,
  requirements TEXT,
  location TEXT,
  url TEXT,
  contact_email TEXT,
  deadline TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  sponsor_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
