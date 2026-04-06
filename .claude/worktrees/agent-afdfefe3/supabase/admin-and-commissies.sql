-- SIT — Admin flag + Commissies migration
-- Run dit in de Supabase SQL editor
-- Gebruik IF NOT EXISTS en ON CONFLICT DO NOTHING zodat het idempotent is

-- ============================================
-- 1. ADMIN FLAG OP MEMBERS
-- ============================================

ALTER TABLE members ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Bootstrap bestaande admins
UPDATE members SET is_admin = true
WHERE email IN ('matin.khajehfard@hva.nl', 'voorzitter@svsit.nl');

-- ============================================
-- 2. COMMISSIES TABEL
-- ============================================

CREATE TABLE IF NOT EXISTS commissies (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT    UNIQUE NOT NULL,
  naam        TEXT    NOT NULL,
  beschrijving TEXT,
  emoji       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed de 6 commissies
INSERT INTO commissies (slug, naam, beschrijving, emoji) VALUES
  ('gameit',     'GameIT',        'Organiseert game nights, LAN-parties en alles rondom gaming bij SIT.',              '🎮'),
  ('ai4hva',     'AI4HvA',        'Onderzoekt en deelt AI-toepassingen voor HBO-ICT studenten aan de HvA.',            '🤖'),
  ('pr-socials',  'PR & Socials',  'Beheert de social media kanalen, ontwerpt content en promoot SIT naar buiten.',     '📣'),
  ('fun-events',  'Fun & Events',  'Regelt borrels, kroegentochten, uitjes en andere gezellige activiteiten.',          '🎉'),
  ('educatie',   'Educatie',      'Organiseert workshops, tech talks, hackathons en studierelevante evenementen.',      '📚'),
  ('sponsoring', 'Sponsoring',    'Bouwt relaties met bedrijven op, regelt sponsordeals en bedrijfspresentaties.',      '🤝')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. MEMBER_COMMISSIES JOIN TABEL
-- ============================================

CREATE TABLE IF NOT EXISTS member_commissies (
  id                UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id         UUID    NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  commissie_id      UUID    NOT NULL REFERENCES commissies(id) ON DELETE CASCADE,
  role_in_commissie TEXT    NOT NULL DEFAULT 'lid',
  joined_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (member_id, commissie_id)
);

CREATE INDEX IF NOT EXISTS idx_member_commissies_member    ON member_commissies(member_id);
CREATE INDEX IF NOT EXISTS idx_member_commissies_commissie ON member_commissies(commissie_id);

-- ============================================
-- 4. MIGREER BESTAANDE DATA
-- ============================================

-- Koppel leden met een ingevuld commissie-veld aan de juiste commissie
INSERT INTO member_commissies (member_id, commissie_id)
SELECT m.id, c.id
FROM   members m
JOIN   commissies c ON c.slug = m.commissie
WHERE  m.commissie IS NOT NULL
ON CONFLICT (member_id, commissie_id) DO NOTHING;

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE commissies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_commissies ENABLE ROW LEVEL SECURITY;

-- Commissies: leesbaar voor iedereen
DROP POLICY IF EXISTS "commissies_select_all" ON commissies;
CREATE POLICY "commissies_select_all" ON commissies
  FOR SELECT USING (true);

-- Commissies: schrijven alleen via service role
DROP POLICY IF EXISTS "commissies_insert_service" ON commissies;
CREATE POLICY "commissies_insert_service" ON commissies
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "commissies_update_service" ON commissies;
CREATE POLICY "commissies_update_service" ON commissies
  FOR UPDATE USING (false);

DROP POLICY IF EXISTS "commissies_delete_service" ON commissies;
CREATE POLICY "commissies_delete_service" ON commissies
  FOR DELETE USING (false);

-- Member_commissies: leesbaar voor iedereen
DROP POLICY IF EXISTS "member_commissies_select_all" ON member_commissies;
CREATE POLICY "member_commissies_select_all" ON member_commissies
  FOR SELECT USING (true);

-- Member_commissies: schrijven alleen via service role
DROP POLICY IF EXISTS "member_commissies_insert_service" ON member_commissies;
CREATE POLICY "member_commissies_insert_service" ON member_commissies
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "member_commissies_delete_service" ON member_commissies;
CREATE POLICY "member_commissies_delete_service" ON member_commissies
  FOR DELETE USING (false);
