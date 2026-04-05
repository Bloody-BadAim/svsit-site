-- supabase/migrations/20260405-gamification-v2-schema.sql
-- Gamification V2 schema — run BEFORE seed and migrate

-- 1. Add new columns to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS total_xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS coins_balance INTEGER NOT NULL DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS current_level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE members ADD COLUMN IF NOT EXISTS custom_title TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS accent_color TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS leaderboard_visible BOOLEAN NOT NULL DEFAULT true;

-- 2. Levels (seed data, reference table)
CREATE TABLE IF NOT EXISTS levels (
  level INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  xp_required INTEGER NOT NULL,
  cumulative_xp INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('onboarding', 'core', 'prestige', 'legendary', 'bdfl'))
);

-- 3. Badge definitions
CREATE TABLE IF NOT EXISTS badge_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
  xp_bonus INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  auto_grant_rule JSONB,
  category TEXT NOT NULL CHECK (category IN ('achievement', 'track', 'easter_egg', 'boss'))
);

-- 4. Member badges (many-to-many, replaces rewards table for badges)
CREATE TABLE IF NOT EXISTS member_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badge_definitions(id),
  equipped BOOLEAN NOT NULL DEFAULT false,
  equipped_slot INTEGER CHECK (equipped_slot >= 1 AND equipped_slot <= 6),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, badge_id)
);
CREATE INDEX IF NOT EXISTS idx_member_badges_member ON member_badges(member_id);

-- 5. Accessory definitions
CREATE TABLE IF NOT EXISTS accessory_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('pet', 'frame', 'effect', 'sticker', 'skin', 'merch')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
  preview_data JSONB,
  shop_price INTEGER,
  unlock_rule JSONB,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_limited_time BOOLEAN NOT NULL DEFAULT false,
  limited_time_end TIMESTAMPTZ,
  stock INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Member accessories (inventory)
CREATE TABLE IF NOT EXISTS member_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  accessory_id UUID NOT NULL REFERENCES accessory_definitions(id),
  equipped BOOLEAN NOT NULL DEFAULT false,
  position JSONB,
  acquired_via TEXT NOT NULL CHECK (acquired_via IN ('shop', 'level_up', 'boss_fight', 'event', 'easter_egg', 'badge', 'migration')),
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, accessory_id)
);
CREATE INDEX IF NOT EXISTS idx_member_accessories_member ON member_accessories(member_id);

-- 7. XP transactions
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  coins_amount INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('scan', 'challenge', 'boss_fight', 'badge_unlock', 'track_completion')),
  source_id UUID,
  category TEXT CHECK (category IN ('code', 'social', 'learn', 'impact')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_member ON xp_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created ON xp_transactions(created_at);

-- 8. Boss fights
CREATE TABLE IF NOT EXISTS boss_fights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  hp INTEGER NOT NULL,
  current_hp INTEGER NOT NULL DEFAULT 0,
  artwork_url TEXT,
  status TEXT NOT NULL DEFAULT 'announced' CHECK (status IN ('announced', 'active', 'defeated', 'failed')),
  announced_at TIMESTAMPTZ,
  starts_at TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  base_reward_xp INTEGER NOT NULL DEFAULT 0,
  base_reward_badge_id TEXT REFERENCES badge_definitions(id),
  top_reward_accessory_id UUID REFERENCES accessory_definitions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Boss fight contributions
CREATE TABLE IF NOT EXISTS boss_fight_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_fight_id UUID NOT NULL REFERENCES boss_fights(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  xp_contributed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(boss_fight_id, member_id)
);

-- 10. Shop transactions
CREATE TABLE IF NOT EXISTS shop_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  accessory_id UUID NOT NULL REFERENCES accessory_definitions(id),
  coins_spent INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. RPC: atomically increment a member's boss fight contribution
CREATE OR REPLACE FUNCTION increment_boss_contribution(
  p_boss_id UUID,
  p_member_id UUID,
  p_amount INTEGER
) RETURNS void AS $$
BEGIN
  INSERT INTO boss_fight_contributions (boss_fight_id, member_id, xp_contributed, updated_at)
  VALUES (p_boss_id, p_member_id, p_amount, now())
  ON CONFLICT (boss_fight_id, member_id)
  DO UPDATE SET
    xp_contributed = boss_fight_contributions.xp_contributed + p_amount,
    updated_at = now();

  UPDATE boss_fights
  SET current_hp = (
    SELECT COALESCE(SUM(xp_contributed), 0)
    FROM boss_fight_contributions
    WHERE boss_fight_id = p_boss_id
  )
  WHERE id = p_boss_id;
END;
$$ LANGUAGE plpgsql;
