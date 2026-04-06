-- SIT Leden Portaal — Database Schema
-- Run dit in de Supabase SQL editor

-- ============================================
-- TABELLEN
-- ============================================

CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  student_number TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'contributor', 'mentor', 'bestuur')),
  commissie TEXT,
  commissie_voorstel TEXT,
  points INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  membership_active BOOLEAN DEFAULT false,
  membership_started_at TIMESTAMPTZ,
  membership_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  scanned_by TEXT,
  event_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_stripe_customer ON members(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_scans_member ON scans(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(stripe_session_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS members_updated_at ON members;
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Admin emails configureerbaar via een functie
-- Voeg hier bestuur emails toe
CREATE OR REPLACE FUNCTION is_admin(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN check_email IN (
    'matin.khajehfard@hva.nl',
    'voorzitter@svsit.nl'
    -- Voeg meer bestuur emails toe
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Members policies
DROP POLICY IF EXISTS "members_select_own" ON members;
CREATE POLICY "members_select_own" ON members
  FOR SELECT USING (
    auth.uid()::text = id::text
    OR is_admin(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "members_update_own" ON members;
CREATE POLICY "members_update_own" ON members
  FOR UPDATE USING (
    auth.uid()::text = id::text
    OR is_admin(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "members_delete_admin" ON members;
CREATE POLICY "members_delete_admin" ON members
  FOR DELETE USING (
    is_admin(auth.jwt()->>'email')
  );

-- Scans policies
DROP POLICY IF EXISTS "scans_select" ON scans;
CREATE POLICY "scans_select" ON scans
  FOR SELECT USING (
    member_id::text = auth.uid()::text
    OR is_admin(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "scans_insert_admin" ON scans;
CREATE POLICY "scans_insert_admin" ON scans
  FOR INSERT WITH CHECK (
    is_admin(auth.jwt()->>'email')
  );

-- Payments policies
DROP POLICY IF EXISTS "payments_select" ON payments;
CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (
    member_id::text = auth.uid()::text
    OR is_admin(auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "payments_update" ON payments;
CREATE POLICY "payments_update" ON payments
  FOR UPDATE USING (
    is_admin(auth.jwt()->>'email')
  );

-- ===== REWARD SYSTEEM =====

ALTER TABLE members ADD COLUMN IF NOT EXISTS active_skin TEXT DEFAULT 'default';
ALTER TABLE members ADD COLUMN IF NOT EXISTS active_badges TEXT[] DEFAULT '{}';
ALTER TABLE scans ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'social';

CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('skin_unlock', 'badge', 'merch_claim')),
  reward_id TEXT NOT NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, reward_id)
);

CREATE INDEX IF NOT EXISTS idx_rewards_member ON rewards(member_id);
CREATE INDEX IF NOT EXISTS idx_rewards_type ON rewards(type);

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quest', 'track_milestone', 'achievement')),
  category TEXT NOT NULL CHECK (category IN ('code', 'social', 'learn', 'impact')),
  points INTEGER NOT NULL CHECK (points > 0),
  track_id TEXT,
  track_order INTEGER,
  proof_required BOOLEAN DEFAULT true,
  proof_type TEXT CHECK (proof_type IN ('link', 'screenshot', 'text', 'scan')),
  active_from TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_track ON challenges(track_id);

CREATE TABLE IF NOT EXISTS challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) NOT NULL,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  proof_url TEXT,
  proof_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_member ON challenge_submissions(member_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON challenge_submissions(status);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Events schema: see supabase/events-schema.sql
