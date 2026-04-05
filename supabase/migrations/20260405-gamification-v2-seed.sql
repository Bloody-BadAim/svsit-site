-- supabase/migrations/20260405-gamification-v2-seed.sql
-- Run AFTER schema

-- Levels (S-curve)
INSERT INTO levels (level, title, xp_required, cumulative_xp, tier) VALUES
  (1,  'Noob',         0,    0,    'onboarding'),
  (2,  'Rookie',       25,   25,   'onboarding'),
  (3,  'Script Kiddie',50,   75,   'onboarding'),
  (4,  'Hacker',       100,  175,  'onboarding'),
  (5,  'Developer',    200,  375,  'core'),
  (6,  'Engineer',     300,  675,  'core'),
  (7,  'Architect',    400,  1075, 'core'),
  (8,  'Wizard',       500,  1575, 'prestige'),
  (9,  'Sage',         700,  2275, 'prestige'),
  (10, 'Sensei',       1000, 3275, 'legendary'),
  (11, 'Legend',        1500, 4775, 'legendary'),
  (12, 'BDFL',          2500, 7275, 'bdfl')
ON CONFLICT (level) DO NOTHING;

-- Badge definitions (existing + new, with rarity)
INSERT INTO badge_definitions (id, name, description, rarity, xp_bonus, category, auto_grant_rule) VALUES
  ('badge_joined',          'Welkom bij SIT',     'Lid geworden van SIT',                         'common',    10, 'achievement', NULL),
  ('badge_first_event',     'First Blood',        'Je eerste SIT event bijgewoond',                'common',    10, 'achievement', '{"type":"scan_count","count":1}'),
  ('badge_first_purchase',  'First Buy',          'Eerste aankoop in de shop',                     'common',    10, 'achievement', '{"type":"first_purchase"}'),
  ('badge_profile_complete','Volledig Profiel',    'Alle profielvelden ingevuld',                   'common',    10, 'achievement', '{"type":"profile_complete"}'),
  ('badge_borrel_5',        'Borrel Veteran',     '5 borrels bijgewoond',                          'uncommon',  25, 'achievement', '{"type":"borrel_count","count":5}'),
  ('badge_streak_3',        'On a Roll',          '3 events in 30 dagen',                          'uncommon',  25, 'achievement', '{"type":"streak","events":3,"days":30}'),
  ('badge_helper',          'Event Helper',       'Geholpen bij het organiseren van een event',     'uncommon',  25, 'achievement', NULL),
  ('badge_streak_7',        'Unstoppable',        '7 events in 60 dagen',                          'uncommon',  25, 'achievement', '{"type":"streak_extended","events":7,"days":60}'),
  ('badge_night_owl',       'Night Owl',          'Check-in na 22:00',                             'uncommon',  25, 'achievement', NULL),
  ('badge_borrel_10',       'Borrel Legend',      '10 borrels bijgewoond',                         'rare',      50, 'achievement', '{"type":"borrel_count","count":10}'),
  ('badge_allrounder',      'All-Rounder',        'Punten in alle 4 categorien',                   'rare',      50, 'achievement', '{"type":"all_categories"}'),
  ('badge_bestuur',         'Bestuurslid',        'Actief bestuurslid van SIT',                    'rare',      50, 'achievement', NULL),
  ('badge_mentor',          'Mentor',             '3 eerstejaars geholpen',                        'rare',      50, 'achievement', NULL),
  ('badge_double_xp_day',   'XP Machine',        '100+ XP in 1 dag',                              'rare',      50, 'achievement', '{"type":"xp_in_day","amount":100}'),
  ('badge_hackathon',       'Hackathon Survivor', 'Een hackathon meegedaan',                       'epic',     100, 'achievement', NULL),
  ('badge_og_member',       'OG Member',          'Bij de heroprichting van SIT erbij geweest',     'epic',     100, 'achievement', NULL),
  ('badge_fullstack',       'Full Stack Dev',     'Full Stack Development track afgerond',          'epic',     100, 'track',       NULL),
  ('badge_ai_engineer',     'AI Engineer',        'AI Engineer track afgerond',                     'epic',     100, 'track',       NULL),
  ('badge_security',        'Security Specialist','Security track afgerond',                        'epic',     100, 'track',       NULL),
  ('badge_boss_slayer',     'Boss Slayer',        '3 boss fights gewonnen',                         'epic',     100, 'achievement', '{"type":"boss_kills","count":3}'),
  ('badge_max_category',    'Specialist',         '500+ XP in 1 categorie',                        'epic',     100, 'achievement', NULL),
  ('badge_hacker',          'Hacker',             'sudo rm -rf / in de verborgen terminal',         'epic',     100, 'easter_egg',  NULL),
  ('badge_party_animal',    'Feestbeest',         'Feestbeest track afgerond',                      'legendary', 250, 'track',      NULL),
  ('badge_community_builder','Community Builder',  'Community Builder track afgerond',               'legendary', 250, 'track',      NULL),
  ('badge_completionist',   'Completionist',      'Alle common-epic badges verzameld',              'legendary', 250, 'achievement', NULL),
  ('badge_bdfl_witness',    'Witness',            'Online toen iemand BDFL werd',                   'legendary', 250, 'achievement', NULL),
  ('badge_404',             '404',                'De site bezocht om 4:04 AM',                     'legendary', 250, 'easter_egg',  NULL),
  ('badge_no_life',         'No Life',            'Alle events van een maand bijgewoond',           'legendary', 250, 'achievement', NULL),
  ('badge_konami',          'Konami Code',        'De geheime code gevonden',                       'mythic',   500, 'easter_egg',  NULL),
  ('badge_first_bdfl',      'First BDFL',         'De allereerste BDFL van SIT',                    'mythic',   500, 'achievement', NULL),
  ('badge_founder_xi',      'Founder XI',         'Bestuur XI founding member',                     'mythic',   500, 'achievement', NULL)
ON CONFLICT (id) DO UPDATE SET
  rarity = EXCLUDED.rarity,
  xp_bonus = EXCLUDED.xp_bonus,
  category = EXCLUDED.category,
  auto_grant_rule = EXCLUDED.auto_grant_rule;
