-- Migration: Remove boss fight system
-- T005-T008: Drop boss tables, functions, and related constraints

-- 1. Drop boss_fight_contributions first (FK to boss_fights)
DROP TABLE IF EXISTS boss_fight_contributions CASCADE;

-- 2. Drop boss_fights table
DROP TABLE IF EXISTS boss_fights CASCADE;

-- 3. Drop increment_boss_contribution RPC function
DROP FUNCTION IF EXISTS increment_boss_contribution(UUID, UUID, INTEGER);
DROP FUNCTION IF EXISTS increment_boss_contribution(p_boss_id UUID, p_member_id UUID, p_amount INTEGER);

-- 4. Remove boss_fight from xp_transactions source CHECK if exists
-- (Supabase may use CHECK constraints on the source column)
DO $$
BEGIN
  -- Try to drop and recreate the CHECK constraint without boss_fight
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name LIKE '%xp_transactions%source%'
  ) THEN
    ALTER TABLE xp_transactions DROP CONSTRAINT IF EXISTS xp_transactions_source_check;
    ALTER TABLE xp_transactions ADD CONSTRAINT xp_transactions_source_check
      CHECK (source IN ('scan', 'challenge', 'badge_unlock', 'track_completion'));
  END IF;
END $$;

-- 5. Remove boss_fight from member_accessories acquired_via CHECK if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name LIKE '%member_accessories%acquired_via%'
  ) THEN
    ALTER TABLE member_accessories DROP CONSTRAINT IF EXISTS member_accessories_acquired_via_check;
    ALTER TABLE member_accessories ADD CONSTRAINT member_accessories_acquired_via_check
      CHECK (acquired_via IN ('shop', 'level_up', 'event', 'easter_egg', 'badge', 'migration'));
  END IF;
END $$;

-- 6. Remove badge_boss_slayer from member_badges if any members had it
DELETE FROM member_badges WHERE badge_id = 'badge_boss_slayer';
