-- Migration: Create projects table
-- T052: Projecten showcase feature

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'community', -- 'hackathon' | 'community' | 'game' | 'tool'
  repo_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  creators TEXT[],
  member_ids UUID[],
  tech_stack TEXT[],
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
