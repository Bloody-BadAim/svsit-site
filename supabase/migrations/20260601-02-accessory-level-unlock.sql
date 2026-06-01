-- Migration: cosmetics ontgrendelen via level i.p.v. shop
--
-- De shop bestaat niet als unlock-route. Frames/pets/effects/stickers waren
-- shop-only (geen unlock_rule, alleen shop_price) en dus onbereikbaar. Skins
-- waren al level-gated maar startten op level 2, dus level-1 leden kregen niks.
--
-- Deze migratie zet alle cosmetics op een level-rule op basis van rariteit,
-- zodat XP -> level -> ontgrendeling werkt (lazy grant gebeurt in equipAccessory).
-- Iedereen krijgt een starterset op level 1.
--
-- Mapping: common=1, uncommon=3, rare=5, epic=8, legendary=11, mythic=12.

UPDATE accessory_definitions
SET unlock_rule = jsonb_build_object('type','level','level',
  CASE rarity
    WHEN 'common' THEN 1
    WHEN 'uncommon' THEN 3
    WHEN 'rare' THEN 5
    WHEN 'epic' THEN 8
    WHEN 'legendary' THEN 11
    WHEN 'mythic' THEN 12
    ELSE 1
  END)
WHERE category IN ('frame','pet','effect','sticker');

-- Laagste skin als level-1 starter, zodat ook level-1 leden een card-design hebben
UPDATE accessory_definitions
SET unlock_rule = jsonb_build_object('type','level','level',1)
WHERE category = 'skin' AND name = 'Digital Rain';
