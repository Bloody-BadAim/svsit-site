-- Visual redesign: new skins + pets as accessory definitions

-- New card skins
INSERT INTO accessory_definitions (name, description, category, rarity, unlock_rule, preview_data) VALUES
  ('Digital Rain', 'Matrix-style code rain skin', 'skin', 'common', '{"type":"level","level":2}', '{"skinId":"skin_digital_rain"}'),
  ('GL1TCH', 'Glitch effect met RGB split', 'skin', 'uncommon', '{"type":"level","level":4}', '{"skinId":"skin_glitch"}'),
  ('Hologram', 'Holografisch grid met lichtbreking', 'skin', 'uncommon', '{"type":"level","level":5}', '{"skinId":"skin_hologram"}'),
  ('Aurora', 'Aurora borealis wolken', 'skin', 'rare', '{"type":"level","level":6}', '{"skinId":"skin_aurora"}'),
  ('Neon City', 'Cyberpunk skyline neon', 'skin', 'epic', '{"type":"level","level":8}', '{"skinId":"skin_neon_city"}'),
  ('Frost', 'IJskristal met sneeuwval', 'skin', 'epic', '{"type":"level","level":10}', '{"skinId":"skin_frost"}'),
  ('Plasma', 'Energie orbs met elektrische bogen', 'skin', 'legendary', '{"type":"level","level":11}', '{"skinId":"skin_plasma"}'),
  ('The Void', 'Zwart gat — BDFL exclusive', 'skin', 'mythic', '{"type":"level","level":12}', '{"skinId":"skin_void"}')
ON CONFLICT DO NOTHING;

-- Update existing pets with petId in preview_data
UPDATE accessory_definitions SET preview_data = '{"petId":"pet_debug_bug"}' WHERE name = 'Debug Bug' AND category = 'pet';
UPDATE accessory_definitions SET preview_data = '{"petId":"pet_pixel_cat"}' WHERE name = 'Pixel Cat' AND category = 'pet';
UPDATE accessory_definitions SET preview_data = '{"petId":"pet_ghost"}' WHERE name = 'Ghost' AND category = 'pet';
UPDATE accessory_definitions SET preview_data = '{"petId":"pet_robot"}' WHERE name = 'Robot' AND category = 'pet';
UPDATE accessory_definitions SET preview_data = '{"petId":"pet_rubber_duck"}' WHERE name = 'Rubber Duck' AND category = 'pet';
UPDATE accessory_definitions SET preview_data = '{"petId":"pet_baby_dragon"}' WHERE name = 'Dragon' AND category = 'pet';

-- Add missing pets
INSERT INTO accessory_definitions (name, description, category, rarity, shop_price, preview_data) VALUES
  ('Octocat', 'GitHub mascotte op je card', 'pet', 'epic', 400, '{"petId":"pet_octocat"}'),
  ('Clippy', 'Paperclip assistent', 'pet', 'uncommon', 125, '{"petId":"pet_clippy"}'),
  ('Konami Snake', 'Geheime pixel snake', 'pet', 'mythic', NULL, '{"petId":"pet_konami_snake"}')
ON CONFLICT DO NOTHING;
