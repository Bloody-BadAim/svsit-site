# Gamification V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 6-rank gamification system with a 12-level RPG system featuring badge rarity, boss fights, card accessories, a leaderboard, and a coin shop.

**Architecture:** Clean architecture with separate engines per domain (XP, level, badge, boss, shop, inventory). Each engine is a pure-ish TypeScript module that uses the Supabase service client. API routes are thin wrappers around engines. UI components read state via server components or client-side fetches.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase (Postgres), Tailwind CSS, Framer Motion, Vitest

**Spec:** `docs/superpowers/specs/2026-04-05-gamification-v2-design.md`

---

## File Structure

### New files

```
# Testing
vitest.config.ts
src/lib/__tests__/xpEngine.test.ts
src/lib/__tests__/levelEngine.test.ts
src/lib/__tests__/badgeEngine.test.ts

# Database
supabase/migrations/20260405-gamification-v2-schema.sql
supabase/migrations/20260405-gamification-v2-seed.sql
supabase/migrations/20260405-gamification-v2-migrate.sql

# Types
src/types/gamification.ts

# Engines
src/lib/xpEngine.ts
src/lib/levelEngine.ts
src/lib/badgeEngine.ts
src/lib/bossEngine.ts
src/lib/shopEngine.ts
src/lib/inventoryEngine.ts

# API routes
src/app/api/xp/route.ts
src/app/api/leaderboard/route.ts
src/app/api/boss/route.ts
src/app/api/shop/route.ts
src/app/api/inventory/route.ts
src/app/api/admin/boss/route.ts
src/app/api/admin/shop/route.ts

# Pages
src/app/leaderboard/page.tsx
src/app/dashboard/card-editor/page.tsx
src/app/dashboard/shop/page.tsx
src/app/dashboard/xp/page.tsx

# Components
src/components/dashboard/LevelUpModal.tsx
src/components/dashboard/BossFightWidget.tsx
src/components/dashboard/cardEditor/CardEditor.tsx
src/components/dashboard/cardEditor/CardPreview.tsx
src/components/dashboard/cardEditor/StickerDragLayer.tsx
src/components/dashboard/shop/ShopGrid.tsx
src/components/dashboard/shop/ShopItem.tsx
src/components/leaderboard/HallOfFame.tsx
src/components/leaderboard/BubbleRanking.tsx
```

### Modified files

```
src/types/database.ts          — Add V2 columns to Member type
src/lib/constants.ts           — Replace ranks with levels, add rarity tiers
src/lib/rewards.ts             — Rewrite using V2 engines
src/components/MemberCard.tsx  — Add accessory layers
src/components/dashboard/rewards/ProgressionTracker.tsx — 12 levels
src/components/dashboard/rewards/BadgeCollection.tsx    — Rarity visuals
src/components/badges/BadgeIcon.tsx                     — Rarity styling
src/app/dashboard/page.tsx     — Boss widget, coin balance
src/app/dashboard/profiel/page.tsx — Flair, privacy toggle
```

---

## Phase 1: Foundation

### Task 1: Vitest Setup

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add devDependencies and test script)

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest @vitejs/plugin-react
```

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Add test script to package.json**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify setup**

```bash
npx vitest run
```

Expected: 0 tests found, no errors.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add Vitest testing setup"
```

---

### Task 2: V2 TypeScript Types

**Files:**
- Create: `src/types/gamification.ts`
- Modify: `src/types/database.ts`

- [ ] **Step 1: Create gamification.ts with all V2 types**

```typescript
// src/types/gamification.ts
import type { StatCategory } from '@/types/database'

// ---------------------------------------------------------------------------
// Level system
// ---------------------------------------------------------------------------

export type LevelTier = 'onboarding' | 'core' | 'prestige' | 'legendary' | 'bdfl'

export interface LevelDef {
  level: number
  title: string
  xpRequired: number
  cumulativeXp: number
  tier: LevelTier
  color: string
}

// ---------------------------------------------------------------------------
// Badge system
// ---------------------------------------------------------------------------

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type BadgeCategory = 'achievement' | 'track' | 'easter_egg' | 'boss'

export interface BadgeDef {
  id: string
  name: string
  description: string
  rarity: BadgeRarity
  xpBonus: number
  icon: string
  category: BadgeCategory
  autoGrantRule: AutoGrantRule | null
}

export type AutoGrantRule =
  | { type: 'scan_count'; count: number }
  | { type: 'borrel_count'; count: number }
  | { type: 'streak'; events: number; days: number }
  | { type: 'all_categories' }
  | { type: 'boss_kills'; count: number }
  | { type: 'category_xp'; category: StatCategory; amount: number }
  | { type: 'all_badges_up_to'; maxRarity: BadgeRarity }
  | { type: 'profile_complete' }
  | { type: 'first_purchase' }
  | { type: 'streak_extended'; events: number; days: number }
  | { type: 'xp_in_day'; amount: number }

export interface MemberBadge {
  id: string
  memberId: string
  badgeId: string
  equipped: boolean
  equippedSlot: number | null
  earnedAt: string
}

// ---------------------------------------------------------------------------
// Accessory system
// ---------------------------------------------------------------------------

export type AccessoryCategory = 'pet' | 'frame' | 'effect' | 'sticker' | 'skin' | 'merch'

export interface AccessoryDef {
  id: string
  name: string
  description: string
  category: AccessoryCategory
  rarity: BadgeRarity
  previewData: Record<string, unknown> | null
  shopPrice: number | null
  unlockRule: UnlockRule | null
  isFeatured: boolean
  isLimitedTime: boolean
  limitedTimeEnd: string | null
  stock: number | null
  createdAt: string
}

export type UnlockRule =
  | { type: 'level'; level: number }
  | { type: 'badge'; badgeId: string }
  | { type: 'boss'; bossFightId: string }
  | { type: 'event'; eventId: string }
  | { type: 'easter_egg'; triggerId: string }

export interface MemberAccessory {
  id: string
  memberId: string
  accessoryId: string
  equipped: boolean
  position: { x: number; y: number } | null
  acquiredVia: 'shop' | 'level_up' | 'boss_fight' | 'event' | 'easter_egg' | 'badge' | 'migration'
  acquiredAt: string
}

// ---------------------------------------------------------------------------
// Boss fights
// ---------------------------------------------------------------------------

export type BossStatus = 'announced' | 'active' | 'defeated' | 'failed'

export interface BossFight {
  id: string
  name: string
  description: string
  hp: number
  currentHp: number
  artworkUrl: string | null
  status: BossStatus
  announcedAt: string | null
  startsAt: string
  deadline: string
  baseRewardXp: number
  baseRewardBadgeId: string | null
  topRewardAccessoryId: string | null
  createdAt: string
}

export interface BossFightContribution {
  id: string
  bossFightId: string
  memberId: string
  xpContributed: number
  updatedAt: string
}

// ---------------------------------------------------------------------------
// XP system
// ---------------------------------------------------------------------------

export type XpSource = 'scan' | 'challenge' | 'boss_fight' | 'badge_unlock' | 'track_completion'

export interface XpTransaction {
  id: string
  memberId: string
  amount: number
  coinsAmount: number
  source: XpSource
  sourceId: string | null
  category: StatCategory | null
  createdAt: string
}

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

export interface ShopTransaction {
  id: string
  memberId: string
  accessoryId: string
  coinsSpent: number
  purchasedAt: string
}

// ---------------------------------------------------------------------------
// Rarity config
// ---------------------------------------------------------------------------

export const RARITY_CONFIG: Record<BadgeRarity, { color: string; xpBonus: number; label: string }> = {
  common:    { color: '#888888', xpBonus: 10,  label: 'Common' },
  uncommon:  { color: '#22C55E', xpBonus: 25,  label: 'Uncommon' },
  rare:      { color: '#3B82F6', xpBonus: 50,  label: 'Rare' },
  epic:      { color: '#8B5CF6', xpBonus: 100, label: 'Epic' },
  legendary: { color: '#F59E0B', xpBonus: 250, label: 'Legendary' },
  mythic:    { color: 'rainbow', xpBonus: 500, label: 'Mythic' },
}

// ---------------------------------------------------------------------------
// Card equipment state (what's currently on the card)
// ---------------------------------------------------------------------------

export interface CardEquipment {
  skinId: string | null
  frameId: string | null
  petId: string | null
  effectId: string | null
  stickers: Array<{ accessoryId: string; x: number; y: number }>
  accentColor: string | null
  customTitle: string | null
}
```

- [ ] **Step 2: Update Member type in database.ts**

Add these fields to the `Member` interface in `src/types/database.ts`:

```typescript
// Add after existing fields:
total_xp: number
coins_balance: number
current_level: number
custom_title: string | null
accent_color: string | null
leaderboard_visible: boolean
```

- [ ] **Step 3: Verify types compile**

```bash
npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: may show existing errors but no new errors from gamification.ts.

- [ ] **Step 4: Commit**

```bash
git add src/types/gamification.ts src/types/database.ts
git commit -m "feat: add V2 gamification TypeScript types"
```

---

### Task 3: Database Schema + Seed + Migration

**Files:**
- Create: `supabase/migrations/20260405-gamification-v2-schema.sql`
- Create: `supabase/migrations/20260405-gamification-v2-seed.sql`
- Create: `supabase/migrations/20260405-gamification-v2-migrate.sql`

- [ ] **Step 1: Create schema SQL**

```sql
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
```

- [ ] **Step 2: Create seed SQL**

```sql
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
  -- Common
  ('badge_joined',          'Welkom bij SIT',     'Lid geworden van SIT',                         'common',    10, 'achievement', NULL),
  ('badge_first_event',     'First Blood',        'Je eerste SIT event bijgewoond',                'common',    10, 'achievement', '{"type":"scan_count","count":1}'),
  ('badge_first_purchase',  'First Buy',          'Eerste aankoop in de shop',                     'common',    10, 'achievement', '{"type":"first_purchase"}'),
  ('badge_profile_complete','Volledig Profiel',    'Alle profielvelden ingevuld',                   'common',    10, 'achievement', '{"type":"profile_complete"}'),
  -- Uncommon
  ('badge_borrel_5',        'Borrel Veteran',     '5 borrels bijgewoond',                          'uncommon',  25, 'achievement', '{"type":"borrel_count","count":5}'),
  ('badge_streak_3',        'On a Roll',          '3 events in 30 dagen',                          'uncommon',  25, 'achievement', '{"type":"streak","events":3,"days":30}'),
  ('badge_helper',          'Event Helper',       'Geholpen bij het organiseren van een event',     'uncommon',  25, 'achievement', NULL),
  ('badge_streak_7',        'Unstoppable',        '7 events in 60 dagen',                          'uncommon',  25, 'achievement', '{"type":"streak_extended","events":7,"days":60}'),
  ('badge_night_owl',       'Night Owl',          'Check-in na 22:00',                             'uncommon',  25, 'achievement', NULL),
  -- Rare
  ('badge_borrel_10',       'Borrel Legend',      '10 borrels bijgewoond',                         'rare',      50, 'achievement', '{"type":"borrel_count","count":10}'),
  ('badge_allrounder',      'All-Rounder',        'Punten in alle 4 categorien',                   'rare',      50, 'achievement', '{"type":"all_categories"}'),
  ('badge_bestuur',         'Bestuurslid',        'Actief bestuurslid van SIT',                    'rare',      50, 'achievement', NULL),
  ('badge_mentor',          'Mentor',             '3 eerstejaars geholpen',                        'rare',      50, 'achievement', NULL),
  ('badge_double_xp_day',   'XP Machine',        '100+ XP in 1 dag',                              'rare',      50, 'achievement', '{"type":"xp_in_day","amount":100}'),
  -- Epic
  ('badge_hackathon',       'Hackathon Survivor', 'Een hackathon meegedaan',                       'epic',     100, 'achievement', NULL),
  ('badge_og_member',       'OG Member',          'Bij de heroprichting van SIT erbij geweest',     'epic',     100, 'achievement', NULL),
  ('badge_fullstack',       'Full Stack Dev',     'Full Stack Development track afgerond',          'epic',     100, 'track',       NULL),
  ('badge_ai_engineer',     'AI Engineer',        'AI Engineer track afgerond',                     'epic',     100, 'track',       NULL),
  ('badge_security',        'Security Specialist','Security track afgerond',                        'epic',     100, 'track',       NULL),
  ('badge_boss_slayer',     'Boss Slayer',        '3 boss fights gewonnen',                         'epic',     100, 'achievement', '{"type":"boss_kills","count":3}'),
  ('badge_max_category',    'Specialist',         '500+ XP in 1 categorie',                        'epic',     100, 'achievement', NULL),
  ('badge_hacker',          'Hacker',             'sudo rm -rf / in de verborgen terminal',         'epic',     100, 'easter_egg',  NULL),
  -- Legendary
  ('badge_party_animal',    'Feestbeest',         'Feestbeest track afgerond',                      'legendary', 250, 'track',      NULL),
  ('badge_community_builder','Community Builder',  'Community Builder track afgerond',               'legendary', 250, 'track',      NULL),
  ('badge_completionist',   'Completionist',      'Alle common-epic badges verzameld',              'legendary', 250, 'achievement', NULL),
  ('badge_bdfl_witness',    'Witness',            'Online toen iemand BDFL werd',                   'legendary', 250, 'achievement', NULL),
  ('badge_404',             '404',                'De site bezocht om 4:04 AM',                     'legendary', 250, 'easter_egg',  NULL),
  ('badge_no_life',         'No Life',            'Alle events van een maand bijgewoond',           'legendary', 250, 'achievement', NULL),
  -- Mythic
  ('badge_konami',          'Konami Code',        'De geheime code gevonden',                       'mythic',   500, 'easter_egg',  NULL),
  ('badge_first_bdfl',      'First BDFL',         'De allereerste BDFL van SIT',                    'mythic',   500, 'achievement', NULL),
  ('badge_founder_xi',      'Founder XI',         'Bestuur XI founding member',                     'mythic',   500, 'achievement', NULL)
ON CONFLICT (id) DO UPDATE SET
  rarity = EXCLUDED.rarity,
  xp_bonus = EXCLUDED.xp_bonus,
  category = EXCLUDED.category,
  auto_grant_rule = EXCLUDED.auto_grant_rule;
```

- [ ] **Step 3: Create migration SQL (V1 → V2)**

```sql
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
-- For each member, set their active_badges as equipped in member_badges
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
      WHERE member_id = m.id AND badge_id = badge_id;
      slot_num := slot_num + 1;
    END LOOP;
  END LOOP;
END $$;

-- 5. Migrate skins from rewards to accessory_definitions + member_accessories
-- First insert legacy skins as accessory definitions
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

-- 6. Migrate merch claims
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
```

- [ ] **Step 4: Verify SQL files have no syntax issues**

Read through each file for obvious errors. These will be run manually against Supabase, so they don't need automated testing.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: V2 gamification database schema, seed data, and migration"
```

---

### Task 4: Level Engine

**Files:**
- Create: `src/lib/levelEngine.ts`
- Create: `src/lib/__tests__/levelEngine.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/__tests__/levelEngine.test.ts
import { describe, it, expect } from 'vitest'
import { LEVELS, getLevelForXp, getLevelProgress, getBadgeSlotCount, getNextLevel } from '@/lib/levelEngine'

describe('LEVELS', () => {
  it('has 12 levels', () => {
    expect(LEVELS).toHaveLength(12)
  })

  it('starts at level 1 with 0 cumulative XP', () => {
    expect(LEVELS[0].level).toBe(1)
    expect(LEVELS[0].cumulativeXp).toBe(0)
  })

  it('ends at level 12 (BDFL) with 7275 cumulative XP', () => {
    expect(LEVELS[11].level).toBe(12)
    expect(LEVELS[11].title).toBe('BDFL')
    expect(LEVELS[11].cumulativeXp).toBe(7275)
  })
})

describe('getLevelForXp', () => {
  it('returns level 1 for 0 XP', () => {
    expect(getLevelForXp(0)).toEqual(LEVELS[0])
  })

  it('returns level 1 for 24 XP (just under level 2)', () => {
    expect(getLevelForXp(24)).toEqual(LEVELS[0])
  })

  it('returns level 2 for exactly 25 XP', () => {
    expect(getLevelForXp(25)).toEqual(LEVELS[1])
  })

  it('returns level 5 for 375 XP', () => {
    expect(getLevelForXp(375).level).toBe(5)
  })

  it('returns level 12 for 7275 XP', () => {
    expect(getLevelForXp(7275).level).toBe(12)
  })

  it('returns level 12 for XP above max (10000)', () => {
    expect(getLevelForXp(10000).level).toBe(12)
  })
})

describe('getLevelProgress', () => {
  it('returns 0% at start of a level', () => {
    const progress = getLevelProgress(25) // exact start of L2
    expect(progress.current).toBe(0)
    expect(progress.percent).toBe(0)
  })

  it('returns 50% halfway through a level', () => {
    // L2 needs 50 XP (25 to 75). At 50 XP: 25/50 = 50%
    const progress = getLevelProgress(50)
    expect(progress.percent).toBe(50)
  })

  it('returns 100% progress for max level', () => {
    const progress = getLevelProgress(7275)
    expect(progress.percent).toBe(100)
  })
})

describe('getBadgeSlotCount', () => {
  it('returns 1 slot for levels 1-2', () => {
    expect(getBadgeSlotCount(1)).toBe(1)
    expect(getBadgeSlotCount(2)).toBe(1)
  })

  it('returns 3 slots for levels 5-6', () => {
    expect(getBadgeSlotCount(5)).toBe(3)
    expect(getBadgeSlotCount(6)).toBe(3)
  })

  it('returns 6 slots for levels 11-12', () => {
    expect(getBadgeSlotCount(11)).toBe(6)
    expect(getBadgeSlotCount(12)).toBe(6)
  })
})

describe('getNextLevel', () => {
  it('returns level 2 when on level 1', () => {
    expect(getNextLevel(1)?.level).toBe(2)
  })

  it('returns null when on level 12', () => {
    expect(getNextLevel(12)).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/__tests__/levelEngine.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement levelEngine.ts**

```typescript
// src/lib/levelEngine.ts
import type { LevelDef, LevelTier } from '@/types/gamification'

export const LEVELS: LevelDef[] = [
  { level: 1,  title: 'Noob',          xpRequired: 0,    cumulativeXp: 0,    tier: 'onboarding', color: '#22C55E' },
  { level: 2,  title: 'Rookie',        xpRequired: 25,   cumulativeXp: 25,   tier: 'onboarding', color: '#22C55E' },
  { level: 3,  title: 'Script Kiddie', xpRequired: 50,   cumulativeXp: 75,   tier: 'onboarding', color: '#22C55E' },
  { level: 4,  title: 'Hacker',        xpRequired: 100,  cumulativeXp: 175,  tier: 'onboarding', color: '#22C55E' },
  { level: 5,  title: 'Developer',     xpRequired: 200,  cumulativeXp: 375,  tier: 'core',       color: '#3B82F6' },
  { level: 6,  title: 'Engineer',      xpRequired: 300,  cumulativeXp: 675,  tier: 'core',       color: '#3B82F6' },
  { level: 7,  title: 'Architect',     xpRequired: 400,  cumulativeXp: 1075, tier: 'core',       color: '#3B82F6' },
  { level: 8,  title: 'Wizard',        xpRequired: 500,  cumulativeXp: 1575, tier: 'prestige',   color: '#8B5CF6' },
  { level: 9,  title: 'Sage',          xpRequired: 700,  cumulativeXp: 2275, tier: 'prestige',   color: '#8B5CF6' },
  { level: 10, title: 'Sensei',        xpRequired: 1000, cumulativeXp: 3275, tier: 'legendary',  color: '#EF4444' },
  { level: 11, title: 'Legend',         xpRequired: 1500, cumulativeXp: 4775, tier: 'legendary',  color: '#EF4444' },
  { level: 12, title: 'BDFL',          xpRequired: 2500, cumulativeXp: 7275, tier: 'bdfl',       color: '#F59E0B' },
]

export function getLevelForXp(totalXp: number): LevelDef {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVELS[i].cumulativeXp) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getNextLevel(currentLevel: number): LevelDef | null {
  if (currentLevel >= 12) return null
  return LEVELS[currentLevel] // LEVELS is 0-indexed, so LEVELS[currentLevel] = next level
}

export function getLevelProgress(totalXp: number): { current: number; max: number; percent: number } {
  const level = getLevelForXp(totalXp)
  const next = getNextLevel(level.level)

  if (!next) return { current: 0, max: 0, percent: 100 }

  const xpIntoLevel = totalXp - level.cumulativeXp
  const xpNeeded = next.xpRequired
  const percent = Math.round((xpIntoLevel / xpNeeded) * 100)

  return { current: xpIntoLevel, max: xpNeeded, percent }
}

export function getBadgeSlotCount(level: number): number {
  if (level <= 2) return 1
  if (level <= 4) return 2
  if (level <= 6) return 3
  if (level <= 8) return 4
  if (level <= 10) return 5
  return 6
}

export function getTierColor(tier: LevelTier): string {
  const colors: Record<LevelTier, string> = {
    onboarding: '#22C55E',
    core: '#3B82F6',
    prestige: '#8B5CF6',
    legendary: '#EF4444',
    bdfl: '#F59E0B',
  }
  return colors[tier]
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/levelEngine.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/levelEngine.ts src/lib/__tests__/levelEngine.test.ts
git commit -m "feat: level engine with 12-level S-curve progression"
```

---

### Task 5: XP Engine

**Files:**
- Create: `src/lib/xpEngine.ts`
- Create: `src/lib/__tests__/xpEngine.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/__tests__/xpEngine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateXpReward, XP_REWARDS } from '@/lib/xpEngine'

describe('XP_REWARDS', () => {
  it('has correct borrel check-in value', () => {
    expect(XP_REWARDS.borrelCheckIn).toBe(5)
  })

  it('has correct hackathon value', () => {
    expect(XP_REWARDS.hackathon).toBe(25)
  })

  it('has correct track completion value', () => {
    expect(XP_REWARDS.trackCompletion).toBe(100)
  })
})

describe('calculateXpReward', () => {
  it('returns scan XP for borrel event', () => {
    const result = calculateXpReward('scan', { eventName: 'Borrel Week 12' })
    expect(result).toBe(5)
  })

  it('returns scan XP for workshop event', () => {
    const result = calculateXpReward('scan', { eventName: 'React Workshop' })
    expect(result).toBe(10)
  })

  it('returns scan XP for hackathon event', () => {
    const result = calculateXpReward('scan', { eventName: 'SIT Hackathon 2026' })
    expect(result).toBe(25)
  })

  it('returns challenge XP directly from points', () => {
    const result = calculateXpReward('challenge', { points: 30 })
    expect(result).toBe(30)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/__tests__/xpEngine.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement xpEngine.ts**

```typescript
// src/lib/xpEngine.ts
import { createServiceClient } from '@/lib/supabase'
import { getLevelForXp } from '@/lib/levelEngine'
import type { StatCategory } from '@/types/database'
import type { XpSource } from '@/types/gamification'

export const XP_REWARDS = {
  borrelCheckIn: 5,
  workshopEvent: 10,
  hackathon: 25,
  organizeEvent: 40,
  weeklyQuestMin: 10,
  weeklyQuestMax: 25,
  trackMilestoneMin: 15,
  trackMilestoneMax: 50,
  trackCompletion: 100,
} as const

export function calculateXpReward(
  source: 'scan' | 'challenge',
  context: { eventName?: string; points?: number }
): number {
  if (source === 'challenge') return context.points ?? 0

  const name = (context.eventName ?? '').toLowerCase()
  if (name.includes('hackathon')) return XP_REWARDS.hackathon
  if (name.includes('borrel')) return XP_REWARDS.borrelCheckIn
  return XP_REWARDS.workshopEvent
}

export async function grantXp(params: {
  memberId: string
  amount: number
  source: XpSource
  sourceId?: string
  category?: StatCategory
}): Promise<{ newTotalXp: number; newLevel: number; oldLevel: number; coinsGranted: number }> {
  const supabase = createServiceClient()

  // 1. Log XP transaction
  await supabase.from('xp_transactions').insert({
    member_id: params.memberId,
    amount: params.amount,
    coins_amount: params.amount,
    source: params.source,
    source_id: params.sourceId ?? null,
    category: params.category ?? null,
  })

  // 2. Get current state
  const { data: member } = await supabase
    .from('members')
    .select('total_xp, current_level, coins_balance')
    .eq('id', params.memberId)
    .single()

  const oldXp = member?.total_xp ?? 0
  const oldLevel = member?.current_level ?? 1
  const oldCoins = member?.coins_balance ?? 0

  // 3. Calculate new state
  const newTotalXp = oldXp + params.amount
  const newLevelDef = getLevelForXp(newTotalXp)
  const newCoins = oldCoins + params.amount

  // 4. Update member
  await supabase
    .from('members')
    .update({
      total_xp: newTotalXp,
      current_level: newLevelDef.level,
      coins_balance: newCoins,
    })
    .eq('id', params.memberId)

  // 5. Update boss fight contribution if active boss
  const { data: activeBoss } = await supabase
    .from('boss_fights')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .single()

  if (activeBoss) {
    await supabase
      .from('boss_fight_contributions')
      .upsert(
        {
          boss_fight_id: activeBoss.id,
          member_id: params.memberId,
          xp_contributed: params.amount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'boss_fight_id,member_id' }
      )

    // Increment rather than replace — use RPC or raw SQL
    await supabase.rpc('increment_boss_contribution', {
      p_boss_id: activeBoss.id,
      p_member_id: params.memberId,
      p_amount: params.amount,
    })
  }

  return {
    newTotalXp,
    newLevel: newLevelDef.level,
    oldLevel,
    coinsGranted: params.amount,
  }
}

export async function getXpHistory(memberId: string, limit = 50): Promise<Array<{
  amount: number
  source: string
  category: string | null
  createdAt: string
}>> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('xp_transactions')
    .select('amount, source, category, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((row) => ({
    amount: row.amount as number,
    source: row.source as string,
    category: row.category as string | null,
    createdAt: row.created_at as string,
  }))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/xpEngine.test.ts
```

Expected: PASS (the pure function tests pass; DB functions can't be unit tested without Supabase).

- [ ] **Step 5: Create the Supabase RPC function for boss contribution increment**

Add to the end of `supabase/migrations/20260405-gamification-v2-schema.sql`:

```sql
-- RPC: atomically increment a member's boss fight contribution
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

  -- Also update the boss's current_hp
  UPDATE boss_fights
  SET current_hp = (
    SELECT COALESCE(SUM(xp_contributed), 0)
    FROM boss_fight_contributions
    WHERE boss_fight_id = p_boss_id
  )
  WHERE id = p_boss_id;
END;
$$ LANGUAGE plpgsql;
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/xpEngine.ts src/lib/__tests__/xpEngine.test.ts supabase/migrations/20260405-gamification-v2-schema.sql
git commit -m "feat: XP engine with dual currency and boss fight contribution"
```

---

### Task 6: Badge Engine

**Files:**
- Create: `src/lib/badgeEngine.ts`
- Create: `src/lib/__tests__/badgeEngine.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/lib/__tests__/badgeEngine.test.ts
import { describe, it, expect } from 'vitest'
import { BADGE_DEFS, getBadgesByRarity, getMaxEquippableSlots } from '@/lib/badgeEngine'

describe('BADGE_DEFS', () => {
  it('has at least 30 badge definitions', () => {
    expect(BADGE_DEFS.length).toBeGreaterThanOrEqual(30)
  })

  it('every badge has a valid rarity', () => {
    const validRarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']
    for (const badge of BADGE_DEFS) {
      expect(validRarities).toContain(badge.rarity)
    }
  })

  it('every badge has a positive xpBonus', () => {
    for (const badge of BADGE_DEFS) {
      expect(badge.xpBonus).toBeGreaterThan(0)
    }
  })
})

describe('getBadgesByRarity', () => {
  it('returns only common badges for common filter', () => {
    const common = getBadgesByRarity('common')
    expect(common.every((b) => b.rarity === 'common')).toBe(true)
    expect(common.length).toBeGreaterThan(0)
  })

  it('returns mythic badges', () => {
    const mythic = getBadgesByRarity('mythic')
    expect(mythic.length).toBeGreaterThanOrEqual(3)
  })
})

describe('getMaxEquippableSlots', () => {
  it('returns 1 for level 1', () => {
    expect(getMaxEquippableSlots(1)).toBe(1)
  })

  it('returns 6 for level 12', () => {
    expect(getMaxEquippableSlots(12)).toBe(6)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/__tests__/badgeEngine.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement badgeEngine.ts**

```typescript
// src/lib/badgeEngine.ts
import { createServiceClient } from '@/lib/supabase'
import { getBadgeSlotCount } from '@/lib/levelEngine'
import { RARITY_CONFIG } from '@/types/gamification'
import type { BadgeDef, BadgeRarity, MemberBadge } from '@/types/gamification'

export const BADGE_DEFS: BadgeDef[] = [
  // Common
  { id: 'badge_joined',          name: 'Welkom bij SIT',     description: 'Lid geworden van SIT',                        rarity: 'common',    xpBonus: 10,  icon: 'badge_joined',          category: 'achievement', autoGrantRule: null },
  { id: 'badge_first_event',     name: 'First Blood',        description: 'Je eerste SIT event bijgewoond',               rarity: 'common',    xpBonus: 10,  icon: 'badge_first_event',     category: 'achievement', autoGrantRule: { type: 'scan_count', count: 1 } },
  { id: 'badge_first_purchase',  name: 'First Buy',          description: 'Eerste aankoop in de shop',                    rarity: 'common',    xpBonus: 10,  icon: 'badge_first_purchase',  category: 'achievement', autoGrantRule: { type: 'first_purchase' } },
  { id: 'badge_profile_complete',name: 'Volledig Profiel',    description: 'Alle profielvelden ingevuld',                  rarity: 'common',    xpBonus: 10,  icon: 'badge_profile_complete',category: 'achievement', autoGrantRule: { type: 'profile_complete' } },
  // Uncommon
  { id: 'badge_borrel_5',        name: 'Borrel Veteran',     description: '5 borrels bijgewoond',                         rarity: 'uncommon',  xpBonus: 25,  icon: 'badge_borrel_5',        category: 'achievement', autoGrantRule: { type: 'borrel_count', count: 5 } },
  { id: 'badge_streak_3',        name: 'On a Roll',          description: '3 events in 30 dagen',                         rarity: 'uncommon',  xpBonus: 25,  icon: 'badge_streak_3',        category: 'achievement', autoGrantRule: { type: 'streak', events: 3, days: 30 } },
  { id: 'badge_helper',          name: 'Event Helper',       description: 'Geholpen bij het organiseren van een event',    rarity: 'uncommon',  xpBonus: 25,  icon: 'badge_helper',          category: 'achievement', autoGrantRule: null },
  { id: 'badge_streak_7',        name: 'Unstoppable',        description: '7 events in 60 dagen',                         rarity: 'uncommon',  xpBonus: 25,  icon: 'badge_streak_7',        category: 'achievement', autoGrantRule: { type: 'streak_extended', events: 7, days: 60 } },
  { id: 'badge_night_owl',       name: 'Night Owl',          description: 'Check-in na 22:00',                            rarity: 'uncommon',  xpBonus: 25,  icon: 'badge_night_owl',       category: 'achievement', autoGrantRule: null },
  // Rare
  { id: 'badge_borrel_10',       name: 'Borrel Legend',      description: '10 borrels bijgewoond',                        rarity: 'rare',      xpBonus: 50,  icon: 'badge_borrel_10',       category: 'achievement', autoGrantRule: { type: 'borrel_count', count: 10 } },
  { id: 'badge_allrounder',      name: 'All-Rounder',        description: 'Punten in alle 4 categorien',                  rarity: 'rare',      xpBonus: 50,  icon: 'badge_allrounder',      category: 'achievement', autoGrantRule: { type: 'all_categories' } },
  { id: 'badge_bestuur',         name: 'Bestuurslid',        description: 'Actief bestuurslid van SIT',                   rarity: 'rare',      xpBonus: 50,  icon: 'badge_bestuur',         category: 'achievement', autoGrantRule: null },
  { id: 'badge_mentor',          name: 'Mentor',             description: '3 eerstejaars geholpen',                       rarity: 'rare',      xpBonus: 50,  icon: 'badge_mentor',          category: 'achievement', autoGrantRule: null },
  { id: 'badge_double_xp_day',   name: 'XP Machine',        description: '100+ XP in 1 dag',                             rarity: 'rare',      xpBonus: 50,  icon: 'badge_double_xp_day',   category: 'achievement', autoGrantRule: { type: 'xp_in_day', amount: 100 } },
  // Epic
  { id: 'badge_hackathon',       name: 'Hackathon Survivor', description: 'Een hackathon meegedaan',                      rarity: 'epic',      xpBonus: 100, icon: 'badge_hackathon',       category: 'achievement', autoGrantRule: null },
  { id: 'badge_og_member',       name: 'OG Member',          description: 'Bij de heroprichting van SIT erbij geweest',    rarity: 'epic',      xpBonus: 100, icon: 'badge_og_member',       category: 'achievement', autoGrantRule: null },
  { id: 'badge_fullstack',       name: 'Full Stack Dev',     description: 'Full Stack Development track afgerond',         rarity: 'epic',      xpBonus: 100, icon: 'badge_fullstack',       category: 'track',       autoGrantRule: null },
  { id: 'badge_ai_engineer',     name: 'AI Engineer',        description: 'AI Engineer track afgerond',                    rarity: 'epic',      xpBonus: 100, icon: 'badge_ai_engineer',     category: 'track',       autoGrantRule: null },
  { id: 'badge_security',        name: 'Security Specialist',description: 'Security track afgerond',                       rarity: 'epic',      xpBonus: 100, icon: 'badge_security',        category: 'track',       autoGrantRule: null },
  { id: 'badge_boss_slayer',     name: 'Boss Slayer',        description: '3 boss fights gewonnen',                        rarity: 'epic',      xpBonus: 100, icon: 'badge_boss_slayer',     category: 'achievement', autoGrantRule: { type: 'boss_kills', count: 3 } },
  { id: 'badge_max_category',    name: 'Specialist',         description: '500+ XP in 1 categorie',                       rarity: 'epic',      xpBonus: 100, icon: 'badge_max_category',    category: 'achievement', autoGrantRule: null },
  { id: 'badge_hacker',          name: 'Hacker',             description: 'sudo rm -rf / in de verborgen terminal',        rarity: 'epic',      xpBonus: 100, icon: 'badge_hacker',          category: 'easter_egg',  autoGrantRule: null },
  // Legendary
  { id: 'badge_party_animal',    name: 'Feestbeest',         description: 'Feestbeest track afgerond',                     rarity: 'legendary', xpBonus: 250, icon: 'badge_party_animal',    category: 'track',       autoGrantRule: null },
  { id: 'badge_community_builder',name:'Community Builder',   description: 'Community Builder track afgerond',              rarity: 'legendary', xpBonus: 250, icon: 'badge_community_builder',category:'track',       autoGrantRule: null },
  { id: 'badge_completionist',   name: 'Completionist',      description: 'Alle common-epic badges verzameld',             rarity: 'legendary', xpBonus: 250, icon: 'badge_completionist',   category: 'achievement', autoGrantRule: { type: 'all_badges_up_to', maxRarity: 'epic' } },
  { id: 'badge_bdfl_witness',    name: 'Witness',            description: 'Online toen iemand BDFL werd',                  rarity: 'legendary', xpBonus: 250, icon: 'badge_bdfl_witness',    category: 'achievement', autoGrantRule: null },
  { id: 'badge_404',             name: '404',                description: 'De site bezocht om 4:04 AM',                    rarity: 'legendary', xpBonus: 250, icon: 'badge_404',             category: 'easter_egg',  autoGrantRule: null },
  { id: 'badge_no_life',         name: 'No Life',            description: 'Alle events van een maand bijgewoond',          rarity: 'legendary', xpBonus: 250, icon: 'badge_no_life',         category: 'achievement', autoGrantRule: null },
  // Mythic
  { id: 'badge_konami',          name: 'Konami Code',        description: 'De geheime code gevonden',                      rarity: 'mythic',    xpBonus: 500, icon: 'badge_konami',          category: 'easter_egg',  autoGrantRule: null },
  { id: 'badge_first_bdfl',      name: 'First BDFL',         description: 'De allereerste BDFL van SIT',                   rarity: 'mythic',    xpBonus: 500, icon: 'badge_first_bdfl',      category: 'achievement', autoGrantRule: null },
  { id: 'badge_founder_xi',      name: 'Founder XI',         description: 'Bestuur XI founding member',                    rarity: 'mythic',    xpBonus: 500, icon: 'badge_founder_xi',      category: 'achievement', autoGrantRule: null },
]

export function getBadgesByRarity(rarity: BadgeRarity): BadgeDef[] {
  return BADGE_DEFS.filter((b) => b.rarity === rarity)
}

export function getBadgeDef(badgeId: string): BadgeDef | undefined {
  return BADGE_DEFS.find((b) => b.id === badgeId)
}

export function getMaxEquippableSlots(level: number): number {
  return getBadgeSlotCount(level)
}

export function getRarityColor(rarity: BadgeRarity): string {
  return RARITY_CONFIG[rarity].color
}

export async function grantBadge(memberId: string, badgeId: string): Promise<boolean> {
  const supabase = createServiceClient()
  const badge = getBadgeDef(badgeId)
  if (!badge) return false

  const { error } = await supabase
    .from('member_badges')
    .upsert(
      { member_id: memberId, badge_id: badgeId },
      { onConflict: 'member_id,badge_id' }
    )

  if (error) return false

  // Grant XP bonus for earning the badge
  if (badge.xpBonus > 0) {
    const { grantXp } = await import('@/lib/xpEngine')
    await grantXp({
      memberId,
      amount: badge.xpBonus,
      source: 'badge_unlock',
      sourceId: badgeId,
    })
  }

  return true
}

export async function getEquippedBadges(memberId: string): Promise<MemberBadge[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('member_badges')
    .select('*')
    .eq('member_id', memberId)
    .eq('equipped', true)
    .order('equipped_slot', { ascending: true })

  return (data ?? []).map((row) => ({
    id: row.id as string,
    memberId: row.member_id as string,
    badgeId: row.badge_id as string,
    equipped: row.equipped as boolean,
    equippedSlot: row.equipped_slot as number | null,
    earnedAt: row.earned_at as string,
  }))
}

export async function equipBadge(memberId: string, badgeId: string, slot: number, maxSlots: number): Promise<boolean> {
  if (slot < 1 || slot > maxSlots) return false

  const supabase = createServiceClient()

  // Unequip anything in this slot
  await supabase
    .from('member_badges')
    .update({ equipped: false, equipped_slot: null })
    .eq('member_id', memberId)
    .eq('equipped_slot', slot)

  // Equip the badge
  const { error } = await supabase
    .from('member_badges')
    .update({ equipped: true, equipped_slot: slot })
    .eq('member_id', memberId)
    .eq('badge_id', badgeId)

  return !error
}

export async function unequipBadge(memberId: string, badgeId: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('member_badges')
    .update({ equipped: false, equipped_slot: null })
    .eq('member_id', memberId)
    .eq('badge_id', badgeId)

  return !error
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/__tests__/badgeEngine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/badgeEngine.ts src/lib/__tests__/badgeEngine.test.ts
git commit -m "feat: badge engine with 31 badges across 6 rarity tiers"
```

---

### Task 7: Update Constants + Rewrite Rewards

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/lib/rewards.ts`

- [ ] **Step 1: Update constants.ts**

Replace the rank-related exports in `src/lib/constants.ts`. Keep `COMMISSIES`, `ROLLEN`, `STAT_CATEGORIES`, `LIDMAATSCHAP_PRIJS`, and `ADMIN_EMAILS`. Remove: `RANKS`, `getLevel`, `getPrestige`, `getLevelProgress`, `getRank`, `getBadgeSlotCount`, `BADGES` (all moved to engines).

Add re-exports from engines:

```typescript
// Replace the old rank/badge sections with:
// V2: re-export from engines for backward compatibility
export { LEVELS, getLevelForXp, getLevelProgress, getBadgeSlotCount } from '@/lib/levelEngine'
export { BADGE_DEFS } from '@/lib/badgeEngine'
export { RARITY_CONFIG } from '@/types/gamification'
```

- [ ] **Step 2: Rewrite rewards.ts to use V2 engines**

Replace the entire `grantRewards` function body in `src/lib/rewards.ts` to use `grantXp` and `grantBadge` from the new engines. Keep `calculateStats` but update it to use `xp_transactions` table as a secondary source.

```typescript
// src/lib/rewards.ts — V2 rewrite
import { createServiceClient } from '@/lib/supabase'
import { grantXp, calculateXpReward } from '@/lib/xpEngine'
import { grantBadge, BADGE_DEFS } from '@/lib/badgeEngine'
import { getLevelForXp } from '@/lib/levelEngine'
import type { StatCategory } from '@/types/database'

export interface MemberStats {
  code: number
  social: number
  learn: number
  impact: number
  total: number
}

export async function calculateStats(memberId: string): Promise<MemberStats> {
  const supabase = createServiceClient()
  const stats: MemberStats = { code: 0, social: 0, learn: 0, impact: 0, total: 0 }

  const { data: transactions } = await supabase
    .from('xp_transactions')
    .select('amount, category')
    .eq('member_id', memberId)

  if (transactions) {
    for (const tx of transactions) {
      const cat = tx.category as StatCategory | null
      if (cat && cat in stats) {
        stats[cat] += tx.amount as number
      }
      stats.total += tx.amount as number
    }
  }

  return stats
}

export async function checkAndGrantAutoBadges(memberId: string): Promise<string[]> {
  const supabase = createServiceClient()
  const granted: string[] = []

  // Get member's scan history
  const { data: scans } = await supabase
    .from('scans')
    .select('event_name, category, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: true })

  const scanCount = scans?.length ?? 0
  const borrelCount = scans?.filter((s) =>
    ((s.event_name as string) ?? '').toLowerCase().includes('borrel')
  ).length ?? 0

  const categories = new Set(scans?.map((s) => s.category as string) ?? [])
  const allCategories = ['code', 'social', 'learn', 'impact'].every((c) => categories.has(c))

  // Streak checks
  let hasStreak3 = false
  let hasStreak7 = false
  if (scans && scans.length >= 3) {
    for (let i = 0; i <= scans.length - 3; i++) {
      const first = new Date(scans[i].created_at as string).getTime()
      const third = new Date(scans[i + 2].created_at as string).getTime()
      if ((third - first) / 86400000 <= 30) hasStreak3 = true
    }
  }
  if (scans && scans.length >= 7) {
    for (let i = 0; i <= scans.length - 7; i++) {
      const first = new Date(scans[i].created_at as string).getTime()
      const seventh = new Date(scans[i + 6].created_at as string).getTime()
      if ((seventh - first) / 86400000 <= 60) hasStreak7 = true
    }
  }

  // Auto-grant checks
  if (scanCount >= 1 && await grantBadge(memberId, 'badge_first_event')) granted.push('badge_first_event')
  if (borrelCount >= 5 && await grantBadge(memberId, 'badge_borrel_5')) granted.push('badge_borrel_5')
  if (borrelCount >= 10 && await grantBadge(memberId, 'badge_borrel_10')) granted.push('badge_borrel_10')
  if (allCategories && await grantBadge(memberId, 'badge_allrounder')) granted.push('badge_allrounder')
  if (hasStreak3 && await grantBadge(memberId, 'badge_streak_3')) granted.push('badge_streak_3')
  if (hasStreak7 && await grantBadge(memberId, 'badge_streak_7')) granted.push('badge_streak_7')

  return granted
}
```

- [ ] **Step 3: Fix any import errors across the codebase**

Search for imports from the old constants (RANKS, getRank, getLevel, getPrestige, BADGES, etc.) and update them to use the new engine imports. Common locations:

- `src/components/MemberCard.tsx`
- `src/components/dashboard/rewards/ProgressionTracker.tsx`
- `src/components/dashboard/rewards/BadgeCollection.tsx`

Update imports from `@/lib/constants` to `@/lib/levelEngine` or `@/lib/badgeEngine` as needed.

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds (or only pre-existing errors).

- [ ] **Step 5: Commit**

```bash
git add src/lib/constants.ts src/lib/rewards.ts
git commit -m "feat: rewrite constants and rewards to use V2 engines"
```

---

## Phase 2: Core UI Updates

### Task 8: ProgressionTracker — 12 Levels

**Files:**
- Modify: `src/components/dashboard/rewards/ProgressionTracker.tsx`

- [ ] **Step 1: Read current ProgressionTracker**

Read the file to understand current structure and props.

- [ ] **Step 2: Update to use 12 levels**

Replace the 6-rank timeline with 12 level nodes. Key changes:
- Import `LEVELS, getLevelForXp, getLevelProgress, getTierColor` from `@/lib/levelEngine`
- Replace `RANKS` loop with `LEVELS` loop
- Use tier colors (green/blue/purple/red/gold) instead of individual rank colors
- Show level number + title on each node
- Animated progress line spans all 12 nodes
- Active level gets pulse rings
- Show "Next level" countdown with XP remaining

- [ ] **Step 3: Verify visually**

```bash
npm run dev
```

Navigate to `/dashboard/rewards` and verify the 12-level progression tracker renders correctly.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/rewards/ProgressionTracker.tsx
git commit -m "feat: update ProgressionTracker to 12 levels with tier colors"
```

---

### Task 9: Badge Rarity Visuals

**Files:**
- Modify: `src/components/badges/BadgeIcon.tsx`
- Modify: `src/components/dashboard/rewards/BadgeCollection.tsx`

- [ ] **Step 1: Update BadgeIcon with rarity styling**

Add rarity prop to BadgeIcon. Apply rarity-based styling:
- Border color matches rarity color from `RARITY_CONFIG`
- Common: solid border, no animation
- Uncommon: subtle glow (`box-shadow: 0 0 8px`)
- Rare: glow + CSS shimmer animation
- Epic: glow + pulse animation (`@keyframes pulse`)
- Legendary: glow + rotating particle ring (CSS `conic-gradient` trick)
- Mythic: animated rainbow border (`@keyframes rainbow { 0% { filter: hue-rotate(0deg) } 100% { filter: hue-rotate(360deg) } }`)

Add a small rarity label pill below the badge icon.

- [ ] **Step 2: Update BadgeCollection to show rarity**

- Import `getBadgeDef` from `@/lib/badgeEngine`
- For each badge, look up its rarity from `getBadgeDef(badge.id)`
- Pass rarity to BadgeIcon
- Sort badges by rarity (mythic first) in the grid
- Update slot count to use `getBadgeSlotCount` from levelEngine with the member's level

- [ ] **Step 3: Verify visually**

Navigate to `/dashboard/rewards` and confirm badges show rarity colors, animations, and labels.

- [ ] **Step 4: Commit**

```bash
git add src/components/badges/BadgeIcon.tsx src/components/dashboard/rewards/BadgeCollection.tsx
git commit -m "feat: badge rarity visuals with glow, shimmer, and rainbow effects"
```

---

### Task 10: Level-Up Modal

**Files:**
- Create: `src/components/dashboard/LevelUpModal.tsx`

- [ ] **Step 1: Create the level-up celebration modal**

```typescript
// src/components/dashboard/LevelUpModal.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { getLevelForXp, getNextLevel, getTierColor } from '@/lib/levelEngine'
import { getBadgeSlotCount } from '@/lib/levelEngine'
import type { LevelDef } from '@/types/gamification'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: LevelDef
  unlockedItems?: Array<{ name: string; type: string }>
}

export function LevelUpModal({ isOpen, onClose, newLevel, unlockedItems = [] }: LevelUpModalProps) {
  const tierColor = getTierColor(newLevel.tier)
  const newSlots = getBadgeSlotCount(newLevel.level)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0c0c0e] p-8 text-center"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#F59E0B', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6'][i % 5],
                    left: `${Math.random() * 100}%`,
                  }}
                  initial={{ y: -20, opacity: 1 }}
                  animate={{ y: 500, opacity: 0, rotate: Math.random() * 720 }}
                  transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5, ease: 'easeOut' }}
                />
              ))}
            </div>

            {/* Level badge */}
            <motion.div
              className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 text-3xl font-bold font-mono"
              style={{ borderColor: tierColor, color: tierColor, boxShadow: `0 0 30px ${tierColor}40` }}
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              L{newLevel.level}
            </motion.div>

            <motion.p
              className="text-sm uppercase tracking-[4px] text-gray-500 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              LEVEL UP
            </motion.p>

            <motion.h2
              className="text-2xl font-bold font-mono mb-1"
              style={{ color: tierColor }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {newLevel.title}
            </motion.h2>

            <motion.p
              className="text-gray-400 text-sm mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {newSlots} badge slots unlocked
            </motion.p>

            {/* Unlocked items */}
            {unlockedItems.length > 0 && (
              <motion.div
                className="mb-6 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-xs uppercase tracking-[3px] text-gray-500">NIEUW UNLOCKED</p>
                {unlockedItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-center gap-2 text-sm text-gray-300">
                    <span className="text-xs text-gray-500 uppercase">{item.type}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </motion.div>
            )}

            <motion.button
              className="rounded-lg px-6 py-2.5 text-sm font-mono font-bold uppercase tracking-wider text-black transition-colors"
              style={{ backgroundColor: tierColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              NICE
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/LevelUpModal.tsx
git commit -m "feat: animated level-up modal with confetti and tier colors"
```

---

### Task 11: XP Info Page

**Files:**
- Create: `src/app/dashboard/xp/page.tsx`

- [ ] **Step 1: Create the "Hoe verdien ik XP" + history page**

Build a page with two sections:
1. **Hoe verdien ik XP** — table/grid showing all XP sources and their values from `XP_REWARDS`
2. **XP Geschiedenis** — chronological list of XP transactions fetched from `xp_transactions` table

The page uses server component to fetch data, renders a table of XP sources (static) and a list of recent transactions (dynamic).

```typescript
// src/app/dashboard/xp/page.tsx
import { createServerComponentClient } from '@/lib/supabase'
import { XP_REWARDS } from '@/lib/xpEngine'
import { STAT_CATEGORIES } from '@/lib/constants'

const XP_SOURCES = [
  { actie: 'Borrel check-in',      xp: XP_REWARDS.borrelCheckIn, categorie: 'social' },
  { actie: 'Workshop / event',     xp: XP_REWARDS.workshopEvent,  categorie: 'varies' },
  { actie: 'Hackathon',            xp: XP_REWARDS.hackathon,      categorie: 'code' },
  { actie: 'Event organiseren',    xp: XP_REWARDS.organizeEvent,  categorie: 'impact' },
  { actie: 'Weekly quest',         xp: '10-25',                   categorie: 'varies' },
  { actie: 'Skill track milestone',xp: '15-50',                   categorie: 'varies' },
  { actie: 'Track completion',     xp: XP_REWARDS.trackCompletion,categorie: 'varies' },
  { actie: 'Boss fight bonus',     xp: '20-75',                   categorie: 'n/a' },
  { actie: 'Badge unlock bonus',   xp: '10-500',                  categorie: 'n/a' },
]

export default async function XpPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  let transactions: Array<{ amount: number; source: string; category: string | null; created_at: string }> = []
  if (user) {
    const { data } = await supabase
      .from('xp_transactions')
      .select('amount, source, category, created_at')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    transactions = (data ?? []) as typeof transactions
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono text-white mb-1">HOE VERDIEN IK XP?</h1>
        <p className="text-gray-400 text-sm">Elke actie levert XP en coins op. XP bepaalt je level, coins kun je uitgeven in de shop.</p>
      </div>

      {/* XP Sources table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Actie</th>
              <th className="px-4 py-3">XP</th>
              <th className="px-4 py-3">Categorie</th>
            </tr>
          </thead>
          <tbody>
            {XP_SOURCES.map((source, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="px-4 py-3 text-white">{source.actie}</td>
                <td className="px-4 py-3 font-mono font-bold text-[var(--color-accent-gold)]">
                  {typeof source.xp === 'number' ? `+${source.xp}` : source.xp}
                </td>
                <td className="px-4 py-3 text-gray-400">{source.categorie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* XP History */}
      <div>
        <h2 className="text-lg font-bold font-mono text-white mb-4">XP GESCHIEDENIS</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">Nog geen XP verdiend. Ga naar een event!</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, i) => {
              const catDef = STAT_CATEGORIES.find((c) => c.id === tx.category)
              return (
                <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {catDef && (
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: catDef.kleur }} />
                    )}
                    <span className="text-sm text-gray-300 capitalize">{tx.source.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-[var(--color-accent-gold)]">+{tx.amount}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify page renders**

```bash
npm run dev
```

Navigate to `/dashboard/xp`.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/xp/page.tsx
git commit -m "feat: XP info and history page at /dashboard/xp"
```

---

## Phase 3: Card System

### Task 12: Inventory Engine

**Files:**
- Create: `src/lib/inventoryEngine.ts`

- [ ] **Step 1: Implement inventory engine**

```typescript
// src/lib/inventoryEngine.ts
import { createServiceClient } from '@/lib/supabase'
import type { MemberAccessory, AccessoryDef, AccessoryCategory, CardEquipment } from '@/types/gamification'

export async function getInventory(memberId: string): Promise<MemberAccessory[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('member_accessories')
    .select('*')
    .eq('member_id', memberId)
    .order('acquired_at', { ascending: false })

  return (data ?? []).map(mapAccessoryRow)
}

export async function getEquippedAccessories(memberId: string): Promise<CardEquipment> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('member_accessories')
    .select('*, accessory_definitions(*)')
    .eq('member_id', memberId)
    .eq('equipped', true)

  const equipment: CardEquipment = {
    skinId: null,
    frameId: null,
    petId: null,
    effectId: null,
    stickers: [],
    accentColor: null,
    customTitle: null,
  }

  for (const row of data ?? []) {
    const def = row.accessory_definitions as { category: string } | null
    if (!def) continue

    const accessoryId = row.accessory_id as string
    switch (def.category) {
      case 'skin': equipment.skinId = accessoryId; break
      case 'frame': equipment.frameId = accessoryId; break
      case 'pet': equipment.petId = accessoryId; break
      case 'effect': equipment.effectId = accessoryId; break
      case 'sticker': {
        const pos = row.position as { x: number; y: number } | null
        equipment.stickers.push({ accessoryId, x: pos?.x ?? 0, y: pos?.y ?? 0 })
        break
      }
    }
  }

  // Get flair from member
  const { data: member } = await supabase
    .from('members')
    .select('accent_color, custom_title')
    .eq('id', memberId)
    .single()

  equipment.accentColor = (member?.accent_color as string) ?? null
  equipment.customTitle = (member?.custom_title as string) ?? null

  return equipment
}

export async function equipAccessory(memberId: string, accessoryId: string, position?: { x: number; y: number }): Promise<boolean> {
  const supabase = createServiceClient()

  // Get the category of this accessory
  const { data: accessory } = await supabase
    .from('member_accessories')
    .select('accessory_id, accessory_definitions(category)')
    .eq('member_id', memberId)
    .eq('accessory_id', accessoryId)
    .single()

  if (!accessory) return false
  const def = accessory.accessory_definitions as { category: string } | null
  if (!def) return false

  const category = def.category as AccessoryCategory

  // For non-sticker categories, unequip the current one first
  if (category !== 'sticker') {
    // Find currently equipped item of same category
    const { data: currentEquipped } = await supabase
      .from('member_accessories')
      .select('id, accessory_definitions(category)')
      .eq('member_id', memberId)
      .eq('equipped', true)

    for (const item of currentEquipped ?? []) {
      const itemDef = item.accessory_definitions as { category: string } | null
      if (itemDef?.category === category) {
        await supabase
          .from('member_accessories')
          .update({ equipped: false, position: null })
          .eq('id', item.id as string)
      }
    }
  } else {
    // For stickers, check max 3
    const { count } = await supabase
      .from('member_accessories')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', memberId)
      .eq('equipped', true)
      .eq('accessory_definitions.category', 'sticker')

    if ((count ?? 0) >= 3) return false
  }

  // Equip the accessory
  const { error } = await supabase
    .from('member_accessories')
    .update({ equipped: true, position: position ? position : null })
    .eq('member_id', memberId)
    .eq('accessory_id', accessoryId)

  return !error
}

export async function unequipAccessory(memberId: string, accessoryId: string): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('member_accessories')
    .update({ equipped: false, position: null })
    .eq('member_id', memberId)
    .eq('accessory_id', accessoryId)

  return !error
}

export async function updateStickerPosition(memberId: string, accessoryId: string, position: { x: number; y: number }): Promise<boolean> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('member_accessories')
    .update({ position })
    .eq('member_id', memberId)
    .eq('accessory_id', accessoryId)

  return !error
}

function mapAccessoryRow(row: Record<string, unknown>): MemberAccessory {
  return {
    id: row.id as string,
    memberId: row.member_id as string,
    accessoryId: row.accessory_id as string,
    equipped: row.equipped as boolean,
    position: row.position as { x: number; y: number } | null,
    acquiredVia: row.acquired_via as MemberAccessory['acquiredVia'],
    acquiredAt: row.acquired_at as string,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/inventoryEngine.ts
git commit -m "feat: inventory engine for card accessories"
```

---

### Task 13: Card Editor Page

**Files:**
- Create: `src/app/dashboard/card-editor/page.tsx`
- Create: `src/components/dashboard/cardEditor/CardEditor.tsx`

- [ ] **Step 1: Create the card editor client component**

The card editor has:
- Left: live card preview (reuses MemberCard but with equipment overrides)
- Right: tabbed panel (Skins, Frames, Pets, Effects, Stickers, Flair)
- Each tab shows a grid of items (owned + locked with hint)
- Clicking an owned item equips/unequips it
- Stickers tab has drag & drop positioning

Build `CardEditor.tsx` as a `'use client'` component with local state for equipment, tabs, and API calls to `/api/inventory` for equip/unequip.

- [ ] **Step 2: Create the page wrapper**

```typescript
// src/app/dashboard/card-editor/page.tsx
import { createServerComponentClient } from '@/lib/supabase'
import { getInventory, getEquippedAccessories } from '@/lib/inventoryEngine'
import { CardEditor } from '@/components/dashboard/cardEditor/CardEditor'
import { redirect } from 'next/navigation'

export default async function CardEditorPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [inventory, equipment] = await Promise.all([
    getInventory(user.id),
    getEquippedAccessories(user.id),
  ])

  // Get all accessory definitions for display
  const { data: allAccessories } = await supabase
    .from('accessory_definitions')
    .select('*')
    .order('rarity', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold font-mono text-white mb-6">CARD EDITOR</h1>
      <CardEditor
        inventory={inventory}
        equipment={equipment}
        allAccessories={(allAccessories ?? []) as Record<string, unknown>[]}
        memberId={user.id}
      />
    </div>
  )
}
```

- [ ] **Step 3: Implement CardEditor with tabs, grid, and equip logic**

Build the tabbed interface. Each tab renders a grid of accessory items. Owned items are clickable (equip/unequip). Locked items show "Level X" or "Shop: 200 coins" hints. The stickers tab includes a simple drag interaction for positioning on the card preview.

API calls go to `/api/inventory` (POST to equip, DELETE to unequip, PATCH to update position).

- [ ] **Step 4: Create inventory API route**

```typescript
// src/app/api/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'
import { equipAccessory, unequipAccessory, updateStickerPosition } from '@/lib/inventoryEngine'

export async function POST(req: NextRequest) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { accessoryId, position } = body

  const success = await equipAccessory(user.id, accessoryId, position)
  return NextResponse.json({ success })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { accessoryId } = await req.json()
  const success = await unequipAccessory(user.id, accessoryId)
  return NextResponse.json({ success })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { accessoryId, position } = await req.json()
  const success = await updateStickerPosition(user.id, accessoryId, position)
  return NextResponse.json({ success })
}
```

- [ ] **Step 5: Verify page renders**

```bash
npm run dev
```

Navigate to `/dashboard/card-editor`.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/card-editor/ src/components/dashboard/cardEditor/ src/app/api/inventory/
git commit -m "feat: card editor page with tabbed accessory management"
```

---

### Task 14: MemberCard Accessory Layers

**Files:**
- Modify: `src/components/MemberCard.tsx`

- [ ] **Step 1: Read current MemberCard**

Read the file to understand current rendering.

- [ ] **Step 2: Add accessory layer rendering**

Add props for `CardEquipment`. Render layers in order:
1. Frame (outermost border, replaces skin border if equipped)
2. Skin (background, CSS variables)
3. Stickers (absolutely positioned SVG elements at x,y coords)
4. Pet (bottom-right, animated SVG)
5. Effect (full-card overlay with pointer-events: none)

Each layer is conditionally rendered based on equipment state. Default rendering (no accessories) stays the same as V1 for backward compatibility.

- [ ] **Step 3: Verify card renders with and without accessories**

```bash
npm run dev
```

Check `/dashboard/ledenpas`.

- [ ] **Step 4: Commit**

```bash
git add src/components/MemberCard.tsx
git commit -m "feat: MemberCard accessory layers (frame, pet, effect, stickers)"
```

---

## Phase 4: Leaderboard

### Task 15: Leaderboard API + Page

**Files:**
- Create: `src/app/api/leaderboard/route.ts`
- Create: `src/app/leaderboard/page.tsx`
- Create: `src/components/leaderboard/HallOfFame.tsx`
- Create: `src/components/leaderboard/BubbleRanking.tsx`

- [ ] **Step 1: Create leaderboard API**

```typescript
// src/app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = await createServerComponentClient()
  const { searchParams } = new URL(req.url)

  const period = searchParams.get('period') ?? 'alltime'
  const category = searchParams.get('category') ?? 'total'
  const memberId = searchParams.get('memberId')

  // For all-time total XP, query members directly
  if (period === 'alltime' && category === 'total') {
    const { data: top10 } = await supabase
      .from('members')
      .select('id, email, total_xp, current_level, active_skin, leaderboard_visible')
      .eq('membership_active', true)
      .order('total_xp', { ascending: false })
      .limit(10)

    let bubble = null
    if (memberId) {
      // Get member's rank
      const { data: member } = await supabase
        .from('members')
        .select('total_xp')
        .eq('id', memberId)
        .single()

      if (member) {
        const { count: rank } = await supabase
          .from('members')
          .select('id', { count: 'exact', head: true })
          .eq('membership_active', true)
          .gt('total_xp', member.total_xp as number)

        const position = (rank ?? 0) + 1

        // Get 5 above and 5 below
        const { data: above } = await supabase
          .from('members')
          .select('id, email, total_xp, current_level, leaderboard_visible')
          .eq('membership_active', true)
          .gt('total_xp', member.total_xp as number)
          .order('total_xp', { ascending: true })
          .limit(5)

        const { data: below } = await supabase
          .from('members')
          .select('id, email, total_xp, current_level, leaderboard_visible')
          .eq('membership_active', true)
          .lt('total_xp', member.total_xp as number)
          .order('total_xp', { ascending: false })
          .limit(5)

        bubble = {
          position,
          above: (above ?? []).reverse(),
          member: { id: memberId, ...member },
          below: below ?? [],
        }
      }
    }

    return NextResponse.json({ top10: top10 ?? [], bubble })
  }

  // For period-based, sum xp_transactions within the date range
  let dateFilter = ''
  const now = new Date()
  if (period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    dateFilter = weekAgo.toISOString()
  } else if (period === 'month') {
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    dateFilter = monthAgo.toISOString()
  } else if (period === 'semester') {
    const semesterAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    dateFilter = semesterAgo.toISOString()
  }

  // Sum xp_transactions within date range, grouped by member
  let query = supabase
    .from('xp_transactions')
    .select('member_id, amount')

  if (dateFilter) {
    query = query.gte('created_at', dateFilter)
  }
  if (category !== 'total') {
    query = query.eq('category', category)
  }

  const { data: txs } = await query
  const memberXp = new Map<string, number>()
  for (const tx of txs ?? []) {
    const mid = tx.member_id as string
    memberXp.set(mid, (memberXp.get(mid) ?? 0) + (tx.amount as number))
  }

  const sorted = [...memberXp.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Fetch member details for top 10
  const memberIds = sorted.map(([id]) => id)
  const { data: members } = await supabase
    .from('members')
    .select('id, email, current_level, leaderboard_visible')
    .in('id', memberIds)

  const membersMap = new Map((members ?? []).map((m) => [m.id as string, m]))
  const periodTop10 = sorted.map(([id, xp]) => ({
    ...membersMap.get(id),
    total_xp: xp,
  }))

  return NextResponse.json({ top10: periodTop10, bubble: null })
}
```

- [ ] **Step 2: Create HallOfFame component**

Client component that renders the top 10 with large cards, crown for #1, animated glow on top 3. Uses level title + tier color from `getLevelForXp`. Shows equipped badges (max 3).

- [ ] **Step 3: Create BubbleRanking component**

Client component that shows 5 above + you + 5 below. Your row is highlighted gold. Shows position, name (or "Anoniem Lid"), level, XP. Small card thumbnail on hover.

- [ ] **Step 4: Create leaderboard page**

```typescript
// src/app/leaderboard/page.tsx
import { createServerComponentClient } from '@/lib/supabase'
import { HallOfFame } from '@/components/leaderboard/HallOfFame'
import { BubbleRanking } from '@/components/leaderboard/BubbleRanking'

export default async function LeaderboardPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch initial data server-side
  const { data: top10 } = await supabase
    .from('members')
    .select('id, email, total_xp, current_level, leaderboard_visible')
    .eq('membership_active', true)
    .order('total_xp', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold font-mono mb-2">LEADERBOARD</h1>
        <p className="text-gray-400 text-sm mb-8">De meest actieve SIT leden</p>

        {/* Filter bar is a client component that re-fetches /api/leaderboard with query params */}

        <HallOfFame members={(top10 ?? []) as Record<string, unknown>[]} />

        {user && (
          <div className="mt-12">
            <h2 className="text-lg font-bold font-mono mb-4">JOUW POSITIE</h2>
            <BubbleRanking memberId={user.id} />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify page renders**

```bash
npm run dev
```

Navigate to `/leaderboard`.

- [ ] **Step 6: Commit**

```bash
git add src/app/leaderboard/ src/app/api/leaderboard/ src/components/leaderboard/
git commit -m "feat: leaderboard page with hall of fame and bubble ranking"
```

---

## Phase 5: Boss Fights

### Task 16: Boss Fight Engine + API

**Files:**
- Create: `src/lib/bossEngine.ts`
- Create: `src/app/api/boss/route.ts`

- [ ] **Step 1: Implement boss engine**

```typescript
// src/lib/bossEngine.ts
import { createServiceClient } from '@/lib/supabase'
import { grantXp } from '@/lib/xpEngine'
import { grantBadge } from '@/lib/badgeEngine'
import type { BossFight, BossFightContribution } from '@/types/gamification'

export async function getActiveBoss(): Promise<BossFight | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('boss_fights')
    .select('*')
    .in('status', ['announced', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data ? mapBossRow(data) : null
}

export async function getBossContributions(bossId: string): Promise<{
  total: number
  contributors: number
  top3: Array<{ memberId: string; xp: number }>
}> {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('boss_fight_contributions')
    .select('member_id, xp_contributed')
    .eq('boss_fight_id', bossId)
    .order('xp_contributed', { ascending: false })

  const contributions = data ?? []
  const total = contributions.reduce((sum, c) => sum + (c.xp_contributed as number), 0)

  return {
    total,
    contributors: contributions.length,
    top3: contributions.slice(0, 3).map((c) => ({
      memberId: c.member_id as string,
      xp: c.xp_contributed as number,
    })),
  }
}

export async function getMemberContribution(bossId: string, memberId: string): Promise<number> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('boss_fight_contributions')
    .select('xp_contributed')
    .eq('boss_fight_id', bossId)
    .eq('member_id', memberId)
    .single()

  return (data?.xp_contributed as number) ?? 0
}

export async function checkBossStatus(bossId: string): Promise<'active' | 'defeated' | 'failed'> {
  const supabase = createServiceClient()
  const { data: boss } = await supabase
    .from('boss_fights')
    .select('hp, current_hp, deadline, status')
    .eq('id', bossId)
    .single()

  if (!boss) return 'failed'
  if ((boss.status as string) === 'defeated') return 'defeated'

  const currentHp = boss.current_hp as number
  const targetHp = boss.hp as number
  const deadline = new Date(boss.deadline as string)

  if (currentHp >= targetHp) {
    // Boss defeated — update status and grant rewards
    await supabase
      .from('boss_fights')
      .update({ status: 'defeated' })
      .eq('id', bossId)

    await grantBossRewards(bossId)
    return 'defeated'
  }

  if (new Date() > deadline) {
    await supabase
      .from('boss_fights')
      .update({ status: 'failed' })
      .eq('id', bossId)
    return 'failed'
  }

  return 'active'
}

async function grantBossRewards(bossId: string): Promise<void> {
  const supabase = createServiceClient()
  const { data: boss } = await supabase
    .from('boss_fights')
    .select('base_reward_xp, base_reward_badge_id, top_reward_accessory_id')
    .eq('id', bossId)
    .single()

  if (!boss) return

  // Get all contributors
  const { data: contributors } = await supabase
    .from('boss_fight_contributions')
    .select('member_id, xp_contributed')
    .eq('boss_fight_id', bossId)
    .order('xp_contributed', { ascending: false })

  if (!contributors) return

  // Grant base reward to all contributors
  for (const contributor of contributors) {
    const memberId = contributor.member_id as string

    if (boss.base_reward_xp) {
      await grantXp({
        memberId,
        amount: boss.base_reward_xp as number,
        source: 'boss_fight',
        sourceId: bossId,
      })
    }

    if (boss.base_reward_badge_id) {
      await grantBadge(memberId, boss.base_reward_badge_id as string)
    }
  }

  // Grant top reward to top 3
  if (boss.top_reward_accessory_id) {
    const top3 = contributors.slice(0, 3)
    for (const contributor of top3) {
      await supabase
        .from('member_accessories')
        .upsert(
          {
            member_id: contributor.member_id as string,
            accessory_id: boss.top_reward_accessory_id as string,
            acquired_via: 'boss_fight',
          },
          { onConflict: 'member_id,accessory_id' }
        )
    }
  }
}

function mapBossRow(row: Record<string, unknown>): BossFight {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    hp: row.hp as number,
    currentHp: row.current_hp as number,
    artworkUrl: row.artwork_url as string | null,
    status: row.status as BossFight['status'],
    announcedAt: row.announced_at as string | null,
    startsAt: row.starts_at as string,
    deadline: row.deadline as string,
    baseRewardXp: row.base_reward_xp as number,
    baseRewardBadgeId: row.base_reward_badge_id as string | null,
    topRewardAccessoryId: row.top_reward_accessory_id as string | null,
    createdAt: row.created_at as string,
  }
}
```

- [ ] **Step 2: Create boss API route**

```typescript
// src/app/api/boss/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'
import { getActiveBoss, getBossContributions, getMemberContribution } from '@/lib/bossEngine'

export async function GET() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  const boss = await getActiveBoss()
  if (!boss) return NextResponse.json({ boss: null })

  const contributions = await getBossContributions(boss.id)
  const myContribution = user ? await getMemberContribution(boss.id, user.id) : 0

  return NextResponse.json({
    boss,
    contributions,
    myContribution,
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/bossEngine.ts src/app/api/boss/
git commit -m "feat: boss fight engine with reward distribution"
```

---

### Task 17: Boss Fight Widget + Admin

**Files:**
- Create: `src/components/dashboard/BossFightWidget.tsx`
- Create: `src/app/api/admin/boss/route.ts`

- [ ] **Step 1: Create the dashboard boss fight widget**

A `'use client'` component that:
- Shows boss name, artwork, and description
- Large health bar (gradient from red to green as damage increases)
- Timer countdown to deadline
- "47 leden vechten mee" count
- "Jouw bijdrage: 85 XP" personal stats
- Rank within the fight
- When status is 'defeated': confetti animation + results
- When status is 'announced': countdown to start

Fetches data from `/api/boss` on mount and polls every 30 seconds.

- [ ] **Step 2: Create admin boss management API**

```typescript
// src/app/api/admin/boss/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check admin
  const { data: member } = await supabase
    .from('members')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!member?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { name, description, hp, startsAt, deadline, baseRewardXp, baseRewardBadgeId, topRewardAccessoryId } = body

  const { data, error } = await supabase
    .from('boss_fights')
    .insert({
      name,
      description,
      hp,
      starts_at: startsAt,
      deadline,
      base_reward_xp: baseRewardXp,
      base_reward_badge_id: baseRewardBadgeId ?? null,
      top_reward_accessory_id: topRewardAccessoryId ?? null,
      announced_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ boss: data })
}
```

- [ ] **Step 3: Add boss widget to dashboard page**

In `src/app/dashboard/page.tsx`, import and render `<BossFightWidget />` at the top of the dashboard.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/BossFightWidget.tsx src/app/api/admin/boss/ src/app/dashboard/page.tsx
git commit -m "feat: boss fight dashboard widget and admin API"
```

---

## Phase 6: Shop & Easter Eggs

### Task 18: Shop Engine + API + Page

**Files:**
- Create: `src/lib/shopEngine.ts`
- Create: `src/app/api/shop/route.ts`
- Create: `src/app/dashboard/shop/page.tsx`
- Create: `src/components/dashboard/shop/ShopGrid.tsx`
- Create: `src/components/dashboard/shop/ShopItem.tsx`

- [ ] **Step 1: Implement shop engine**

```typescript
// src/lib/shopEngine.ts
import { createServiceClient } from '@/lib/supabase'
import type { AccessoryDef } from '@/types/gamification'

export async function getShopItems(memberLevel: number): Promise<Array<AccessoryDef & { canBuy: boolean; locked: boolean; lockReason: string | null }>> {
  const supabase = createServiceClient()

  const { data: items } = await supabase
    .from('accessory_definitions')
    .select('*')
    .not('shop_price', 'is', null)
    .order('rarity', { ascending: true })

  return (items ?? []).map((item) => {
    const unlockRule = item.unlock_rule as { type: string; level?: number } | null
    const locked = unlockRule?.type === 'level' && (unlockRule.level ?? 0) > memberLevel
    const lockReason = locked ? `Unlock op Level ${unlockRule?.level}` : null

    // Check limited time
    const isExpired = item.is_limited_time && item.limited_time_end && new Date(item.limited_time_end as string) < new Date()
    // Check stock
    const outOfStock = item.stock !== null && (item.stock as number) <= 0

    return {
      id: item.id as string,
      name: item.name as string,
      description: (item.description as string) ?? '',
      category: item.category as AccessoryDef['category'],
      rarity: item.rarity as AccessoryDef['rarity'],
      previewData: item.preview_data as Record<string, unknown> | null,
      shopPrice: item.shop_price as number | null,
      unlockRule: item.unlock_rule as AccessoryDef['unlockRule'],
      isFeatured: item.is_featured as boolean,
      isLimitedTime: item.is_limited_time as boolean,
      limitedTimeEnd: item.limited_time_end as string | null,
      stock: item.stock as number | null,
      createdAt: item.created_at as string,
      canBuy: !locked && !isExpired && !outOfStock,
      locked,
      lockReason,
    }
  })
}

export async function purchaseItem(memberId: string, accessoryId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  // Get item price
  const { data: item } = await supabase
    .from('accessory_definitions')
    .select('shop_price, stock')
    .eq('id', accessoryId)
    .single()

  if (!item || !item.shop_price) return { success: false, error: 'Item niet gevonden' }

  const price = item.shop_price as number

  // Check member balance
  const { data: member } = await supabase
    .from('members')
    .select('coins_balance')
    .eq('id', memberId)
    .single()

  if (!member) return { success: false, error: 'Lid niet gevonden' }
  if ((member.coins_balance as number) < price) return { success: false, error: 'Niet genoeg coins' }

  // Check already owned
  const { data: existing } = await supabase
    .from('member_accessories')
    .select('id')
    .eq('member_id', memberId)
    .eq('accessory_id', accessoryId)
    .single()

  if (existing) return { success: false, error: 'Je hebt dit item al' }

  // Deduct coins
  await supabase
    .from('members')
    .update({ coins_balance: (member.coins_balance as number) - price })
    .eq('id', memberId)

  // Add to inventory
  await supabase
    .from('member_accessories')
    .insert({
      member_id: memberId,
      accessory_id: accessoryId,
      acquired_via: 'shop',
    })

  // Log transaction
  await supabase
    .from('shop_transactions')
    .insert({
      member_id: memberId,
      accessory_id: accessoryId,
      coins_spent: price,
    })

  // Decrease stock if applicable
  if (item.stock !== null) {
    await supabase
      .from('accessory_definitions')
      .update({ stock: (item.stock as number) - 1 })
      .eq('id', accessoryId)
  }

  return { success: true }
}
```

- [ ] **Step 2: Create shop API route**

```typescript
// src/app/api/shop/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'
import { purchaseItem } from '@/lib/shopEngine'

export async function POST(req: NextRequest) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { accessoryId } = await req.json()
  const result = await purchaseItem(user.id, accessoryId)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Create shop page + components**

Build `/dashboard/shop/page.tsx` as server component that fetches shop items and member balance. Renders `ShopGrid` (client component) with tabs per category, item cards with preview/price/rarity, and buy button.

`ShopItem.tsx`: card showing item name, preview, rarity badge, price in coins, "KOPEN" button or "LOCKED" state. "Nieuw" tag for items < 2 weeks old.

- [ ] **Step 4: Commit**

```bash
git add src/lib/shopEngine.ts src/app/api/shop/ src/app/dashboard/shop/ src/components/dashboard/shop/
git commit -m "feat: accessory shop with coin purchases and stock management"
```

---

### Task 19: Easter Eggs

**Files:**
- Modify: `src/hooks/useKonamiCode.ts`
- Modify: `src/app/page.tsx` (homepage)

- [ ] **Step 1: Update Konami code hook to grant badge**

When Konami code is triggered, call `/api/xp` to grant `badge_konami` + pet unlock.

- [ ] **Step 2: Add 4:04 AM check**

In the homepage or dashboard layout, check if current time is between 4:04 and 4:05 AM. If so, show a brief ghost animation and call API to grant `badge_404` + "Ghost" effect.

- [ ] **Step 3: Add SIT logo click counter**

In `SitLogo.tsx`, add a click counter. After 10 clicks, grant sticker "SIT OG".

- [ ] **Step 4: Add hidden terminal**

Add a subtle `` indicator somewhere on the homepage. Clicking it opens a fake terminal. If user types `sudo rm -rf /`, grant `badge_hacker` + "Glitch" frame.

- [ ] **Step 5: Create Easter egg API endpoint**

```typescript
// src/app/api/xp/route.ts — add easter egg handling
// POST body: { type: 'easter_egg', triggerId: 'konami' | '404' | 'logo_click' | 'terminal' }
```

The API checks if the member already has the reward, and if not, grants the badge + accessory.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/ src/app/page.tsx src/components/SitLogo.tsx src/app/api/xp/
git commit -m "feat: easter eggs — Konami code, 4:04 AM, logo clicks, hidden terminal"
```

---

### Task 20: Dashboard + Profile Updates

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/profiel/page.tsx`

- [ ] **Step 1: Add coin balance to dashboard header**

Show coin balance (coin icon + amount) next to the member info in the dashboard header/nav. Format: "🪙 1,234".

- [ ] **Step 2: Update profile page**

Add three new fields to the profile settings:
1. **Leaderboard zichtbaarheid** — toggle (default on), saves to `members.leaderboard_visible`
2. **Custom title** — text input (max 30 chars), only enabled for L8+, saves to `members.custom_title`
3. **Accent kleur** — color picker (preset palette of 8-10 colors), only enabled for L6+, saves to `members.accent_color`

- [ ] **Step 3: Add shop admin section**

In the admin panel, add a section to manage shop items:
- List all `accessory_definitions` with shop_price
- Add new item form (name, description, category, rarity, price, featured, limited time)
- Edit/delete existing items

Create `/api/admin/shop/route.ts` with POST (create), PATCH (update), DELETE (remove) handlers.

- [ ] **Step 4: Verify all pages**

```bash
npm run dev
```

Navigate through dashboard, profile, admin, shop, leaderboard, card editor.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/ src/app/admin/ src/app/api/admin/shop/
git commit -m "feat: dashboard coins display, profile flair settings, shop admin"
```

---

## Final Phase: Cleanup

### Task 21: Run Full Build + Fix Errors

- [ ] **Step 1: Run build**

```bash
npm run build 2>&1
```

- [ ] **Step 2: Fix any TypeScript or build errors**

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "fix: resolve build errors and lint warnings for gamification V2"
```
