-- supabase/migrations/20260405-gamification-v2-migrate.sql
-- Run AFTER schema + seed. Migrates V1 data to V2 structure.

-- 1. Copy points to total_xp and coins_balance
UPDATE members SET
  total_xp = COALESCE(points, 0),
  coins_balance = COALESCE(points, 0);

-- 2. Calculate current_level from total_xp
UPDATE members SET current_level = (
  SELECT COALESCE(MAX(l.level), 1)
  FROM levels l
  WHERE l.cumulative_xp <= members.total_xp
);

-- 3. Migrate badges from rewards table to member_badges
INSERT INTO member_badges (member_id, badge_id, earned_at)
SELECT r.member_id, r.reward_id, r.created_at
FROM rewards r
WHERE r.type = 'badge'
  AND EXISTS (SELECT 1 FROM badge_definitions bd WHERE bd.id = r.reward_id)
ON CONFLICT (member_id, badge_id) DO NOTHING;

-- 4. Migrate equipped badges from members.active_badges array
DO $$
DECLARE
  m RECORD;
  badge_id TEXT;
  slot_num INTEGER;
BEGIN
  FOR m IN SELECT id, active_badges FROM members WHERE active_badges IS NOT NULL AND array_length(active_badges, 1) > 0
  LOOP
    slot_num := 1;
    FOREACH badge_id IN ARRAY m.active_badges
    LOOP
      UPDATE member_badges
      SET equipped = true, equipped_slot = slot_num
      WHERE member_id = m.id AND member_badges.badge_id = badge_id;
      slot_num := slot_num + 1;
    END LOOP;
  END LOOP;
END $$;

-- 5. Migrate skins from rewards to accessory_definitions + member_accessories
INSERT INTO accessory_definitions (id, name, description, category, rarity, unlock_rule)
VALUES
  (gen_random_uuid(), 'Legacy: Default',        'OG Starter skin',     'skin', 'common',    '{"type":"level","level":1}'),
  (gen_random_uuid(), 'Legacy: Bronze',         'OG Bronze skin',      'skin', 'uncommon',  '{"type":"level","level":2}'),
  (gen_random_uuid(), 'Legacy: Silver',         'OG Silver skin',      'skin', 'uncommon',  '{"type":"level","level":3}'),
  (gen_random_uuid(), 'Legacy: Silver Matrix',  'OG Matrix skin',      'skin', 'rare',      '{"type":"level","level":3}'),
  (gen_random_uuid(), 'Legacy: Gold',           'OG Gold skin',        'skin', 'rare',      '{"type":"level","level":5}'),
  (gen_random_uuid(), 'Legacy: Platinum',       'OG Platinum skin',    'skin', 'epic',      '{"type":"level","level":8}'),
  (gen_random_uuid(), 'Legacy: Diamond',        'OG Diamond skin',     'skin', 'epic',      '{"type":"level","level":10}')
ON CONFLICT DO NOTHING;

-- 6. Insert merch definitions
INSERT INTO accessory_definitions (id, name, description, category, rarity, unlock_rule)
VALUES
  (gen_random_uuid(), 'Merch: Sticker Pack',    'SIT sticker pack',       'merch', 'common',   '{"type":"level","level":5}'),
  (gen_random_uuid(), 'Merch: Hoodie',          'SIT hoodie',             'merch', 'rare',     '{"type":"level","level":8}'),
  (gen_random_uuid(), 'Merch: Limited Edition',  'Limited edition merch',  'merch', 'legendary','{"type":"level","level":11}')
ON CONFLICT DO NOTHING;

-- 7. Migrate merch claims
INSERT INTO member_accessories (member_id, accessory_id, equipped, acquired_via, acquired_at)
SELECT r.member_id, ad.id, false, 'migration', r.created_at
FROM rewards r
JOIN accessory_definitions ad ON ad.name = CASE r.reward_id
  WHEN 'merch_sticker_pack' THEN 'Merch: Sticker Pack'
  WHEN 'merch_hoodie' THEN 'Merch: Hoodie'
  WHEN 'merch_limited_edition' THEN 'Merch: Limited Edition'
END
WHERE r.type = 'merch_claim'
ON CONFLICT (member_id, accessory_id) DO NOTHING;
