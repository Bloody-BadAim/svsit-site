-- SIT Events + Tickets Schema
-- Run dit in de Supabase SQL editor NA schema.sql

-- ============================================
-- TABELLEN
-- ============================================

-- Events tabel
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  category TEXT DEFAULT 'social' CHECK (category IN ('code', 'social', 'learn', 'impact')),
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  is_paid BOOLEAN DEFAULT false,
  price_members INTEGER DEFAULT 0,
  price_nonmembers INTEGER DEFAULT 0,
  capacity INTEGER,
  stripe_price_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- Tickets tabel
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES members(id),
  email TEXT NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'checked_in')),
  stripe_session_id TEXT,
  paid_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  checked_in_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_member ON tickets(member_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- FK op scans
ALTER TABLE scans ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Events: iedereen kan lezen, admin kan schrijven
CREATE POLICY events_select_all ON events FOR SELECT USING (true);
CREATE POLICY events_insert_admin ON events FOR INSERT WITH CHECK (
  is_admin(current_setting('request.jwt.claims')::json->>'email')
);
CREATE POLICY events_update_admin ON events FOR UPDATE USING (
  is_admin(current_setting('request.jwt.claims')::json->>'email')
);
CREATE POLICY events_delete_admin ON events FOR DELETE USING (
  is_admin(current_setting('request.jwt.claims')::json->>'email')
);

-- Tickets: eigen tickets zien, admin alles
CREATE POLICY tickets_select ON tickets FOR SELECT USING (
  email = current_setting('request.jwt.claims')::json->>'email'
  OR is_admin(current_setting('request.jwt.claims')::json->>'email')
);
CREATE POLICY tickets_insert ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY tickets_update ON tickets FOR UPDATE USING (
  is_admin(current_setting('request.jwt.claims')::json->>'email')
);
