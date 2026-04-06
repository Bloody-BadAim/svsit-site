-- Shop items seed data
INSERT INTO accessory_definitions (name, description, category, rarity, shop_price, is_featured) VALUES
  -- Frames
  ('Neon Frame', 'Neon glow border voor je card', 'frame', 'uncommon', 100, false),
  ('Matrix Frame', 'Groene code rain border', 'frame', 'rare', 250, true),
  ('Gold Frame', 'Premium gouden border', 'frame', 'epic', 500, false),
  ('Ice Crystal Frame', 'Frozen crystal border', 'frame', 'rare', 300, false),
  ('Fire Frame', 'Vlammen border', 'frame', 'epic', 450, true),
  -- Effects
  ('Sparkle', 'Glitter effect op je card', 'effect', 'uncommon', 150, false),
  ('Matrix Rain', 'Groene code rain overlay', 'effect', 'rare', 300, true),
  ('Snow', 'Sneeuwvlokken effect', 'effect', 'uncommon', 125, false),
  ('Scanlines', 'Retro CRT scanlines', 'effect', 'common', 75, false),
  ('Smoke', 'Subtiele rook effect', 'effect', 'rare', 275, false),
  -- Stickers
  ('SIT Logo', 'SIT logo sticker', 'sticker', 'common', 50, false),
  ('HvA Badge', 'HvA badge sticker', 'sticker', 'common', 50, false),
  ('< / >', 'Code tag sticker', 'sticker', 'uncommon', 75, false),
  ('Amsterdam XXX', 'Amsterdam kruisen sticker', 'sticker', 'common', 50, false),
  ('Hello World', 'Hello World sticker', 'sticker', 'uncommon', 75, false),
  ('Bug Icon', 'Debug bug sticker', 'sticker', 'uncommon', 100, false),
  ('42', 'The answer to everything', 'sticker', 'rare', 200, false),
  ('Coffee', 'Koffie beker sticker', 'sticker', 'common', 50, true),
  -- Pets
  ('Debug Bug', 'Een kleine bug die over je card loopt', 'pet', 'rare', 200, true),
  ('Pixel Cat', 'Pixel art kat op je card', 'pet', 'uncommon', 150, false),
  ('Ghost', 'Spooky ghost pet', 'pet', 'rare', 250, false),
  ('Robot', 'Kleine robot buddy', 'pet', 'epic', 400, true),
  ('Rubber Duck', 'Rubber duck debugging partner', 'pet', 'uncommon', 125, false),
  ('Dragon', 'Baby dragon — groeit met je XP', 'pet', 'legendary', 1000, true)
ON CONFLICT DO NOTHING;
