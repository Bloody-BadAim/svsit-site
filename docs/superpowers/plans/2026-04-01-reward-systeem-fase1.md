# Reward Systeem Fase 1: Data Layer + Card Skins + Badges

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Database schema voor rewards/challenges, card skin systeem met 16 skins, 15 SVG badge iconen, skin selector op ledenpas, en auto-grant logic bij scans.

**Architecture:** Nieuwe Supabase tabellen (rewards, challenges, challenge_submissions) + kolom wijzigingen op members/scans. Skin definities als pure data in `src/lib/cardSkins.ts`. Badge SVGs als React componenten. MemberCard krijgt een `skin` prop die de border/glow/achtergrond styling wijzigt. Auto-grant helper `src/lib/rewards.ts` wordt aangeroepen na elke scan.

**Tech Stack:** Supabase (PostgreSQL), Next.js 16, TypeScript, React, Framer Motion (motion/react)

---

### Task 1: Database Schema Uitbreiden

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `src/types/database.ts`

- [ ] **Step 1: Voeg nieuwe tabellen en kolommen toe aan schema.sql**

Voeg onderaan `supabase/schema.sql` toe:

```sql
-- ===== REWARD SYSTEEM =====

-- Kolom toevoegingen op bestaande tabellen
ALTER TABLE members ADD COLUMN IF NOT EXISTS active_skin TEXT DEFAULT 'default';
ALTER TABLE members ADD COLUMN IF NOT EXISTS active_badges TEXT[] DEFAULT '{}';
ALTER TABLE scans ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'social';

-- Rewards tabel: unlocked skins, badges, merch claims
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

-- Challenges tabel: quests, track milestones, achievements
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

-- Challenge submissions tabel: bewijs + review status
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

-- RLS policies
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Rewards: leden zien eigen, admin ziet alles
CREATE POLICY rewards_select_own ON rewards FOR SELECT USING (
  member_id = auth.uid() OR is_admin(current_setting('request.jwt.claims')::json->>'email')
);
CREATE POLICY rewards_insert_admin ON rewards FOR INSERT WITH CHECK (
  is_admin(current_setting('request.jwt.claims')::json->>'email')
);

-- Challenges: iedereen kan lezen
CREATE POLICY challenges_select_all ON challenges FOR SELECT USING (true);
CREATE POLICY challenges_insert_admin ON challenges FOR INSERT WITH CHECK (
  is_admin(current_setting('request.jwt.claims')::json->>'email')
);

-- Submissions: eigen of admin
CREATE POLICY submissions_select ON challenge_submissions FOR SELECT USING (
  member_id = auth.uid() OR is_admin(current_setting('request.jwt.claims')::json->>'email')
);
CREATE POLICY submissions_insert_own ON challenge_submissions FOR INSERT WITH CHECK (
  member_id = auth.uid()
);
CREATE POLICY submissions_update_admin ON challenge_submissions FOR UPDATE USING (
  is_admin(current_setting('request.jwt.claims')::json->>'email')
);
```

- [ ] **Step 2: Update TypeScript types**

Voeg toe aan `src/types/database.ts`:

```typescript
export type StatCategory = 'code' | 'social' | 'learn' | 'impact'

export type ChallengeType = 'quest' | 'track_milestone' | 'achievement'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface Reward {
  id: string
  member_id: string
  type: 'skin_unlock' | 'badge' | 'merch_claim'
  reward_id: string
  claimed_at: string | null
  created_at: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: ChallengeType
  category: StatCategory
  points: number
  track_id: string | null
  track_order: number | null
  proof_required: boolean
  proof_type: 'link' | 'screenshot' | 'text' | 'scan' | null
  active_from: string | null
  active_until: string | null
  created_by: string | null
  created_at: string
}

export interface ChallengeSubmission {
  id: string
  challenge_id: string
  member_id: string
  proof_url: string | null
  proof_text: string | null
  status: SubmissionStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}
```

Voeg ook `active_skin` en `active_badges` toe aan de bestaande `Member` interface:

```typescript
// Voeg toe aan Member interface na updated_at:
active_skin: string
active_badges: string[]
```

En `category` aan `Scan`:

```typescript
// Voeg toe aan Scan interface na event_name:
category: StatCategory
```

Update ook het `Database` type om de nieuwe tabellen op te nemen (rewards, challenges, challenge_submissions).

- [ ] **Step 3: Run schema SQL op Supabase**

Run de nieuwe SQL statements op je Supabase project via de SQL editor.

- [ ] **Step 4: Commit**

```bash
git add supabase/schema.sql src/types/database.ts
git commit -m "feat: database schema voor reward systeem (rewards, challenges, submissions tabellen)"
```

---

### Task 2: Skin Definities en Constants

**Files:**
- Create: `src/lib/cardSkins.ts`
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Maak cardSkins.ts met alle skin definities**

```typescript
// src/lib/cardSkins.ts

export interface CardSkin {
  id: string
  naam: string
  unlockType: 'rank' | 'badge' | 'track'
  unlockRequirement: string // rank naam, badge id, of track id
  border: string           // CSS border of conic-gradient
  glow: string             // box-shadow glow
  background: string       // achtergrond gradient
  accent: string           // primaire accent kleur
  animated?: boolean       // heeft CSS animatie
}

export const CARD_SKINS: CardSkin[] = [
  // Rank skins
  {
    id: 'default',
    naam: 'Default',
    unlockType: 'rank',
    unlockRequirement: 'Starter',
    border: 'conic-gradient(from 0deg, #F59E0B, #3B82F6, #EF4444, #22C55E, #F59E0B)',
    glow: '0 0 30px rgba(245, 158, 11, 0.12)',
    background: 'rgba(17, 17, 19, 0.95)',
    accent: '#F59E0B',
  },
  {
    id: 'skin_bronze',
    naam: 'Koper Glow',
    unlockType: 'rank',
    unlockRequirement: 'Bronze',
    border: 'linear-gradient(135deg, #CD7F32, #B8860B, #CD7F32)',
    glow: '0 0 30px rgba(205, 127, 50, 0.2)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(205,127,50,0.04))',
    accent: '#CD7F32',
  },
  {
    id: 'skin_silver',
    naam: 'Chrome',
    unlockType: 'rank',
    unlockRequirement: 'Silver',
    border: 'linear-gradient(135deg, #C0C0C0, #E8E8E8, #C0C0C0)',
    glow: '0 0 30px rgba(192, 192, 192, 0.15)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(192,192,192,0.03))',
    accent: '#C0C0C0',
  },
  {
    id: 'skin_silver_matrix',
    naam: 'Matrix',
    unlockType: 'rank',
    unlockRequirement: 'Silver',
    border: 'linear-gradient(180deg, #22C55E, #15803d, #22C55E)',
    glow: '0 0 30px rgba(34, 197, 94, 0.15)',
    background: 'linear-gradient(180deg, rgba(17,17,19,0.95), rgba(34,197,94,0.04))',
    accent: '#22C55E',
    animated: true,
  },
  {
    id: 'skin_gold',
    naam: 'Gold Prestige',
    unlockType: 'rank',
    unlockRequirement: 'Gold',
    border: 'linear-gradient(135deg, #F29E18, #FBBF24, #F29E18)',
    glow: '0 0 40px rgba(242, 158, 24, 0.25)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(242,158,24,0.06))',
    accent: '#F29E18',
    animated: true,
  },
  {
    id: 'skin_plat',
    naam: 'Holographic',
    unlockType: 'rank',
    unlockRequirement: 'Platinum',
    border: 'conic-gradient(from 0deg, #E5E4E2, #F59E0B, #3B82F6, #EF4444, #22C55E, #E5E4E2)',
    glow: '0 0 40px rgba(229, 228, 226, 0.15)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(229,228,226,0.04))',
    accent: '#E5E4E2',
    animated: true,
  },
  {
    id: 'skin_diamond',
    naam: 'Crystal',
    unlockType: 'rank',
    unlockRequirement: 'Diamond',
    border: 'linear-gradient(135deg, #3B82F6, #60A5FA, #93C5FD, #3B82F6)',
    glow: '0 0 50px rgba(59, 130, 246, 0.3)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(59,130,246,0.06))',
    accent: '#3B82F6',
    animated: true,
  },
  // Achievement skins
  {
    id: 'skin_first_event',
    naam: 'First Blood',
    unlockType: 'badge',
    unlockRequirement: 'badge_first_event',
    border: 'linear-gradient(135deg, #EF4444, #DC2626, #EF4444)',
    glow: '0 0 30px rgba(239, 68, 68, 0.2)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(239,68,68,0.04))',
    accent: '#EF4444',
  },
  {
    id: 'skin_hackathon',
    naam: 'Hacker',
    unlockType: 'badge',
    unlockRequirement: 'badge_hackathon',
    border: 'linear-gradient(180deg, #22C55E, #16A34A, #22C55E)',
    glow: '0 0 30px rgba(34, 197, 94, 0.2)',
    background: 'linear-gradient(180deg, rgba(17,17,19,0.95), rgba(34,197,94,0.05))',
    accent: '#22C55E',
    animated: true,
  },
  {
    id: 'skin_borrel_5',
    naam: 'Stamgast',
    unlockType: 'badge',
    unlockRequirement: 'badge_borrel_5',
    border: 'linear-gradient(135deg, #F59E0B, #D97706, #F59E0B)',
    glow: '0 0 30px rgba(245, 158, 11, 0.2)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(245,158,11,0.04))',
    accent: '#F59E0B',
  },
  {
    id: 'skin_og',
    naam: 'OG',
    unlockType: 'badge',
    unlockRequirement: 'badge_og_member',
    border: 'linear-gradient(135deg, #F29E18, #92400E, #F29E18)',
    glow: '0 0 30px rgba(242, 158, 24, 0.15)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(146,64,14,0.06))',
    accent: '#92400E',
  },
  {
    id: 'skin_bestuur',
    naam: 'Bestuur XI',
    unlockType: 'badge',
    unlockRequirement: 'badge_bestuur',
    border: 'linear-gradient(135deg, #F29E18, #111, #F29E18)',
    glow: '0 0 40px rgba(242, 158, 24, 0.2)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.98), rgba(242,158,24,0.08))',
    accent: '#F29E18',
    animated: true,
  },
  // Track skins
  {
    id: 'skin_fullstack',
    naam: 'Fullstack',
    unlockType: 'track',
    unlockRequirement: 'fullstack',
    border: 'linear-gradient(135deg, #3B82F6, #22C55E, #3B82F6)',
    glow: '0 0 30px rgba(59, 130, 246, 0.15)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(59,130,246,0.04))',
    accent: '#3B82F6',
  },
  {
    id: 'skin_ai',
    naam: 'Neural',
    unlockType: 'track',
    unlockRequirement: 'ai_engineer',
    border: 'linear-gradient(135deg, #8B5CF6, #A78BFA, #8B5CF6)',
    glow: '0 0 30px rgba(139, 92, 246, 0.2)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(139,92,246,0.04))',
    accent: '#8B5CF6',
    animated: true,
  },
  {
    id: 'skin_security',
    naam: 'Encrypted',
    unlockType: 'track',
    unlockRequirement: 'security',
    border: 'linear-gradient(180deg, #22C55E, #064E3B, #22C55E)',
    glow: '0 0 30px rgba(34, 197, 94, 0.15)',
    background: 'linear-gradient(180deg, rgba(17,17,19,0.95), rgba(6,78,59,0.06))',
    accent: '#22C55E',
    animated: true,
  },
  {
    id: 'skin_party',
    naam: 'Party Animal',
    unlockType: 'track',
    unlockRequirement: 'feestbeest',
    border: 'conic-gradient(from 0deg, #EF4444, #F59E0B, #22C55E, #3B82F6, #8B5CF6, #EF4444)',
    glow: '0 0 40px rgba(239, 68, 68, 0.15)',
    background: 'linear-gradient(135deg, rgba(17,17,19,0.95), rgba(239,68,68,0.04))',
    accent: '#EF4444',
    animated: true,
  },
]

export function getSkin(skinId: string): CardSkin {
  return CARD_SKINS.find(s => s.id === skinId) || CARD_SKINS[0]
}

export function getUnlockedSkins(rank: string, badges: string[], completedTracks: string[]): string[] {
  return CARD_SKINS
    .filter(skin => {
      if (skin.unlockType === 'rank') {
        const rankOrder = ['Starter', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
        return rankOrder.indexOf(rank) >= rankOrder.indexOf(skin.unlockRequirement)
      }
      if (skin.unlockType === 'badge') return badges.includes(skin.unlockRequirement)
      if (skin.unlockType === 'track') return completedTracks.includes(skin.unlockRequirement)
      return false
    })
    .map(s => s.id)
}
```

- [ ] **Step 2: Voeg badge en stat definities toe aan constants.ts**

Voeg onderaan `src/lib/constants.ts` toe:

```typescript
import type { StatCategory } from '@/types/database'

export interface BadgeDef {
  id: string
  naam: string
  beschrijving: string
  category: 'achievement' | 'track'
  auto: boolean // automatisch verdiend of admin-toegekend
}

export const BADGES: BadgeDef[] = [
  { id: 'badge_joined', naam: 'Joined SIT', beschrijving: 'Welkom bij de club', category: 'achievement', auto: true },
  { id: 'badge_first_event', naam: 'First Event', beschrijving: 'Eerste event bezocht', category: 'achievement', auto: true },
  { id: 'badge_hackathon', naam: 'Hackathon', beschrijving: 'Deelname aan een hackathon', category: 'achievement', auto: false },
  { id: 'badge_borrel_5', naam: 'Stamgast', beschrijving: '5 borrels bezocht', category: 'achievement', auto: true },
  { id: 'badge_borrel_10', naam: 'Borrel Veteraan', beschrijving: '10 borrels bezocht', category: 'achievement', auto: true },
  { id: 'badge_helper', naam: 'Helpende Hand', beschrijving: 'Meehelpen bij een event', category: 'achievement', auto: false },
  { id: 'badge_og_member', naam: 'OG Member', beschrijving: 'Lid sinds het eerste uur', category: 'achievement', auto: false },
  { id: 'badge_bestuur', naam: 'Bestuur XI', beschrijving: 'Bestuurslid van SIT', category: 'achievement', auto: false },
  { id: 'badge_streak_3', naam: 'On Fire', beschrijving: '3 events op rij', category: 'achievement', auto: true },
  { id: 'badge_allrounder', naam: 'Allrounder', beschrijving: 'Elk event type bezocht', category: 'achievement', auto: true },
  { id: 'badge_fullstack', naam: 'Fullstack Developer', beschrijving: 'Fullstack track voltooid', category: 'track', auto: true },
  { id: 'badge_ai_engineer', naam: 'AI Engineer', beschrijving: 'AI track voltooid', category: 'track', auto: true },
  { id: 'badge_security', naam: 'Cyber Security', beschrijving: 'Security track voltooid', category: 'track', auto: true },
  { id: 'badge_party_animal', naam: 'Feestbeest', beschrijving: 'Feestbeest track voltooid', category: 'track', auto: true },
  { id: 'badge_community_builder', naam: 'Community Builder', beschrijving: 'Community track voltooid', category: 'track', auto: true },
]

export const STAT_CATEGORIES: { id: StatCategory; naam: string; kleur: string }[] = [
  { id: 'code', naam: 'CODE', kleur: 'var(--color-accent-blue)' },
  { id: 'social', naam: 'SOCIAL', kleur: 'var(--color-accent-green)' },
  { id: 'learn', naam: 'LEARN', kleur: 'var(--color-accent-gold)' },
  { id: 'impact', naam: 'IMPACT', kleur: 'var(--color-accent-red)' },
]

export function getBadgeSlotCount(rankNaam: string): number {
  const slots: Record<string, number> = {
    Starter: 1, Bronze: 2, Silver: 3, Gold: 4, Platinum: 5, Diamond: 6,
  }
  return slots[rankNaam] || 1
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/cardSkins.ts src/lib/constants.ts
git commit -m "feat: card skin definities (16 skins) en badge/stat constants"
```

---

### Task 3: Badge SVG Componenten

**Files:**
- Create: `src/components/badges/BadgeIcon.tsx`
- Create: `src/components/badges/icons.tsx`

- [ ] **Step 1: Maak de SVG badge iconen**

Maak `src/components/badges/icons.tsx` met alle 15 badge SVGs als named exports. Elk icoon is een `(props: { size?: number; color?: string }) => JSX.Element` functie. Gebruik de SIT brand kleuren als defaults.

Iconen:
- `IconJoined` — checkmark in cirkel
- `IconFirstEvent` — ticket
- `IconHackathon` — code brackets `</>`
- `IconBorrel5` — glas
- `IconBorrel10` — kroon op glas
- `IconHelper` — hand met hart
- `IconOG` — vintage schild
- `IconBestuur` — {SIT} embleem
- `IconStreak` — vlam
- `IconAllrounder` — ster met stralen
- `IconFullstack` — gestapelde layers
- `IconAI` — neural network nodes
- `IconSecurity` — slot/schild
- `IconPartyAnimal` — feesthoedje
- `IconCommunityBuilder` — netwerk/verbindingen

Alle SVGs als inline paths, geen externe bestanden. Viewbox `0 0 24 24`, stroke-based, `currentColor` voor kleur.

- [ ] **Step 2: Maak BadgeIcon wrapper component**

```typescript
// src/components/badges/BadgeIcon.tsx
'use client'

import { BADGES } from '@/lib/constants'
import * as Icons from './icons'

const ICON_MAP: Record<string, (props: { size?: number; color?: string }) => JSX.Element> = {
  badge_joined: Icons.IconJoined,
  badge_first_event: Icons.IconFirstEvent,
  badge_hackathon: Icons.IconHackathon,
  badge_borrel_5: Icons.IconBorrel5,
  badge_borrel_10: Icons.IconBorrel10,
  badge_helper: Icons.IconHelper,
  badge_og_member: Icons.IconOG,
  badge_bestuur: Icons.IconBestuur,
  badge_streak_3: Icons.IconStreak,
  badge_allrounder: Icons.IconAllrounder,
  badge_fullstack: Icons.IconFullstack,
  badge_ai_engineer: Icons.IconAI,
  badge_security: Icons.IconSecurity,
  badge_party_animal: Icons.IconPartyAnimal,
  badge_community_builder: Icons.IconCommunityBuilder,
}

interface BadgeIconProps {
  badgeId: string
  size?: number
  locked?: boolean
}

export default function BadgeIcon({ badgeId, size = 20, locked = false }: BadgeIconProps) {
  const badge = BADGES.find(b => b.id === badgeId)
  const IconComponent = ICON_MAP[badgeId]
  if (!IconComponent || !badge) return null

  return (
    <div
      title={badge.naam}
      style={{
        width: size + 8,
        height: size + 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: locked ? '1px dashed rgba(255,255,255,0.08)' : '1px solid var(--color-accent-gold)',
        background: locked ? 'transparent' : 'rgba(242, 158, 24, 0.08)',
        opacity: locked ? 0.3 : 1,
      }}
    >
      <IconComponent size={size} color={locked ? 'rgba(255,255,255,0.2)' : 'var(--color-accent-gold)'} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/badges/
git commit -m "feat: 15 SVG badge iconen + BadgeIcon wrapper component"
```

---

### Task 4: MemberCard Skin Prop

**Files:**
- Modify: `src/components/MemberCard.tsx`

- [ ] **Step 1: Voeg skin prop toe aan MemberCard**

Wijzig de MemberCard component:

1. Import `getSkin` uit `@/lib/cardSkins`
2. Voeg `skin?: string` toe aan de props
3. Gebruik `getSkin(skin || 'default')` om de skin op te halen
4. Vervang de hardcoded `conic-gradient` border door `skinDef.border`
5. Vervang de hardcoded glow door `skinDef.glow`
6. Vervang de hardcoded background door `skinDef.background`
7. Als `skinDef.animated`, voeg een CSS class toe voor de border animatie

De bestaande `borderRotate` en `cardShine` animaties blijven. Skins met `animated: true` krijgen de roterende border + shine. Skins zonder animatie krijgen een statische border.

- [ ] **Step 2: Vervang hardcoded badges door echte badge data**

Wijzig de badges sectie in MemberCard:
1. Voeg `activeBadges?: string[]` toe aan `MemberCardData` interface
2. Import `BadgeIcon` uit `@/components/badges/BadgeIcon`
3. Vervang de `DEFAULT_BADGES` array door de `activeBadges` prop
4. Render `BadgeIcon` voor elke badge in de slots, met `locked={true}` voor lege slots

- [ ] **Step 3: Vervang hardcoded stats door dynamische data**

Wijzig de stats sectie:
1. Voeg `dynamicStats?: { code: number; social: number; learn: number; impact: number }` toe aan `MemberCardData`
2. Als `dynamicStats` is meegegeven, gebruik die i.p.v. `DEFAULT_STATS`
3. Map de stat namen naar de juiste kleuren uit `STAT_CATEGORIES`

- [ ] **Step 4: Commit**

```bash
git add src/components/MemberCard.tsx
git commit -m "feat: MemberCard skin prop, dynamische stats, echte badge rendering"
```

---

### Task 5: Rewards API Endpoints

**Files:**
- Create: `src/app/api/rewards/[memberId]/route.ts`
- Create: `src/app/api/rewards/route.ts`

- [ ] **Step 1: GET /api/rewards/[memberId]**

```typescript
// src/app/api/rewards/[memberId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const { memberId } = await params
    const isAdmin = ADMIN_EMAILS.includes(session.user.email)
    const isOwn = session.user.id === memberId

    if (!isAdmin && !isOwn) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
```

- [ ] **Step 2: POST /api/rewards (admin: handmatige badge/skin)**

```typescript
// src/app/api/rewards/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { member_id, type, reward_id } = await req.json()
    if (!member_id || !type || !reward_id) {
      return NextResponse.json({ data: null, error: 'member_id, type en reward_id zijn verplicht', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('rewards')
      .upsert({ member_id, type, reward_id }, { onConflict: 'member_id,reward_id' })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/rewards/
git commit -m "feat: rewards API endpoints (GET per member, POST admin grant)"
```

---

### Task 6: Auto-Grant Rewards Logic

**Files:**
- Create: `src/lib/rewards.ts`
- Modify: `src/app/api/scans/route.ts`

- [ ] **Step 1: Maak rewards.ts helper**

```typescript
// src/lib/rewards.ts
import { createServiceClient } from '@/lib/supabase'
import { getRank, RANKS } from '@/lib/constants'
import { CARD_SKINS } from '@/lib/cardSkins'
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

  // Stats uit scans
  const { data: scans } = await supabase
    .from('scans')
    .select('points, category')
    .eq('member_id', memberId)

  // Stats uit approved challenges
  const { data: submissions } = await supabase
    .from('challenge_submissions')
    .select('challenge_id, status')
    .eq('member_id', memberId)
    .eq('status', 'approved')

  const approvedChallengeIds = (submissions || []).map(s => s.challenge_id)

  let challengeStats = { code: 0, social: 0, learn: 0, impact: 0 }
  if (approvedChallengeIds.length > 0) {
    const { data: challenges } = await supabase
      .from('challenges')
      .select('points, category')
      .in('id', approvedChallengeIds)

    for (const c of challenges || []) {
      const cat = c.category as StatCategory
      if (cat in challengeStats) challengeStats[cat] += c.points as number
    }
  }

  const stats = { code: 0, social: 0, learn: 0, impact: 0 }
  for (const scan of scans || []) {
    const cat = (scan.category as StatCategory) || 'social'
    if (cat in stats) stats[cat] += scan.points as number
  }

  return {
    code: stats.code + challengeStats.code,
    social: stats.social + challengeStats.social,
    learn: stats.learn + challengeStats.learn,
    impact: stats.impact + challengeStats.impact,
    total: stats.code + stats.social + stats.learn + stats.impact +
           challengeStats.code + challengeStats.social + challengeStats.learn + challengeStats.impact,
  }
}

export async function grantRewards(memberId: string): Promise<void> {
  const supabase = createServiceClient()
  const stats = await calculateStats(memberId)
  const rank = getRank(stats.total)

  // Update member points
  await supabase.from('members').update({ points: stats.total }).eq('id', memberId)

  // Grant rank skins
  const rankOrder = RANKS.map(r => r.naam)
  const memberRankIndex = rankOrder.indexOf(rank.naam)

  for (const skin of CARD_SKINS) {
    if (skin.unlockType !== 'rank') continue
    const skinRankIndex = rankOrder.indexOf(skin.unlockRequirement)
    if (skinRankIndex <= memberRankIndex) {
      await supabase.from('rewards').upsert(
        { member_id: memberId, type: 'skin_unlock', reward_id: skin.id },
        { onConflict: 'member_id,reward_id' }
      )
    }
  }

  // Grant automatic badges
  const { data: scans } = await supabase
    .from('scans')
    .select('event_name, created_at, category')
    .eq('member_id', memberId)
    .order('created_at', { ascending: true })

  const scanList = scans || []
  const badgesToGrant: string[] = []

  // badge_first_event: heeft minstens 1 scan
  if (scanList.length >= 1) badgesToGrant.push('badge_first_event')

  // badge_borrel_5 / badge_borrel_10
  const borrelCount = scanList.filter(s =>
    (s.event_name as string || '').toLowerCase().includes('borrel')
  ).length
  if (borrelCount >= 5) badgesToGrant.push('badge_borrel_5')
  if (borrelCount >= 10) badgesToGrant.push('badge_borrel_10')

  // badge_allrounder: minstens 1 scan per category
  const categories = new Set(scanList.map(s => s.category as string))
  if (categories.has('code') && categories.has('social') && categories.has('learn') && categories.has('impact')) {
    badgesToGrant.push('badge_allrounder')
  }

  // badge_streak_3: 3 events in een rij (binnen 14 dagen van elkaar)
  if (scanList.length >= 3) {
    for (let i = 0; i <= scanList.length - 3; i++) {
      const first = new Date(scanList[i].created_at as string)
      const third = new Date(scanList[i + 2].created_at as string)
      const diffDays = (third.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays <= 30) {
        badgesToGrant.push('badge_streak_3')
        break
      }
    }
  }

  // Grant badges
  for (const badgeId of badgesToGrant) {
    await supabase.from('rewards').upsert(
      { member_id: memberId, type: 'badge', reward_id: badgeId },
      { onConflict: 'member_id,reward_id' }
    )

    // Grant achievement skins tied to this badge
    for (const skin of CARD_SKINS) {
      if (skin.unlockType === 'badge' && skin.unlockRequirement === badgeId) {
        await supabase.from('rewards').upsert(
          { member_id: memberId, type: 'skin_unlock', reward_id: skin.id },
          { onConflict: 'member_id,reward_id' }
        )
      }
    }
  }

  // Grant merch claims bij juiste rank
  const merchRewards: Record<string, string> = {
    Gold: 'merch_sticker_pack',
    Platinum: 'merch_hoodie',
    Diamond: 'merch_limited_edition',
  }
  if (merchRewards[rank.naam]) {
    await supabase.from('rewards').upsert(
      { member_id: memberId, type: 'merch_claim', reward_id: merchRewards[rank.naam] },
      { onConflict: 'member_id,reward_id' }
    )
  }
}
```

- [ ] **Step 2: Voeg category toe aan scan POST en roep grantRewards aan**

Wijzig `src/app/api/scans/route.ts`:
1. Voeg `category` toe aan de destructured body: `const { member_id, points, reason, event_name, category } = await req.json()`
2. Voeg `category: category || 'social'` toe aan het insert object
3. Na het updaten van member punten, roep `grantRewards(member_id)` aan
4. Import `grantRewards` uit `@/lib/rewards`

- [ ] **Step 3: Commit**

```bash
git add src/lib/rewards.ts src/app/api/scans/route.ts
git commit -m "feat: auto-grant rewards logic + category op scans"
```

---

### Task 7: Skin Selector op Ledenpas Pagina

**Files:**
- Create: `src/components/dashboard/SkinSelector.tsx`
- Modify: `src/app/dashboard/ledenpas/page.tsx`
- Modify: `src/components/dashboard/LedenpasClient.tsx`

- [ ] **Step 1: Maak SkinSelector component**

Client component met:
- Horizontale scrollbare rij van skin thumbnails (kleine kaart previews)
- Elke thumbnail toont de skin border + naam
- Unlocked skins: klikbaar, gouden border als active
- Locked skins: grijs met lock icoon + "Bereik [requirement]"
- Klik op unlocked skin → PATCH `/api/members/[id]` met `{ active_skin: skinId }`
- Props: `memberId: string`, `activeSkin: string`, `unlockedSkins: string[]`

- [ ] **Step 2: Update LedenpasClient om skin door te geven aan MemberCard**

Voeg `skin` prop toe aan de data die LedenpasClient doorgeeft aan MemberCard.

- [ ] **Step 3: Update ledenpas page om rewards data op te halen**

In de server component:
1. Haal rewards op: `supabase.from('rewards').select('reward_id').eq('member_id', userId).eq('type', 'skin_unlock')`
2. Geef `unlockedSkins`, `activeSkin`, en `activeBadges` door aan LedenpasClient
3. LedenpasClient rendert MemberCard + SkinSelector

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/SkinSelector.tsx src/components/dashboard/LedenpasClient.tsx src/app/dashboard/ledenpas/page.tsx
git commit -m "feat: skin selector op ledenpas pagina met unlock status"
```

---

### Task 8: Dashboard StatsGrid Dynamische Stats

**Files:**
- Modify: `src/components/dashboard/StatsGrid.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Update StatsGrid props**

Vervang de hardcoded `statBars` array. De component ontvangt nu:
```typescript
interface StatsGridProps {
  points: number
  role: string
  commissie: string | null
  memberSince: string | null
  dynamicStats: { code: number; social: number; learn: number; impact: number }
}
```

De stat bars gebruiken de waarden uit `dynamicStats` i.p.v. hardcoded 65/80/45. De `max` waarde per stat is het maximum van alle stats (of 10, whichever is higher) zodat de bars relatief zijn.

- [ ] **Step 2: Update dashboard page om stats te berekenen**

In `src/app/dashboard/page.tsx`:
1. Import `calculateStats` uit `@/lib/rewards`
2. Roep `calculateStats(session.user.id)` aan
3. Geef het resultaat door als `dynamicStats` prop aan StatsGrid
4. Geef het ook door als `dynamicStats` aan de MemberCard data in de ledenpas preview

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/StatsGrid.tsx src/app/dashboard/page.tsx
git commit -m "feat: dynamische stats uit scans + challenges in dashboard"
```

---

### Task 9: Members API active_skin Update

**Files:**
- Modify: `src/app/api/members/[id]/route.ts`

- [ ] **Step 1: Voeg active_skin en active_badges toe aan allowed fields**

In de PATCH handler, voeg `'active_skin'` en `'active_badges'` toe aan de `allowedFields` array voor eigen profiel updates (niet alleen admin).

```typescript
const allowedFields = isAdmin
  ? ['student_number', 'role', 'commissie', 'commissie_voorstel', 'points', 'membership_active', 'membership_expires_at', 'active_skin', 'active_badges']
  : ['student_number', 'commissie', 'active_skin', 'active_badges']
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/members/[id]/route.ts
git commit -m "feat: active_skin en active_badges updateable via profiel API"
```

---

## Fase 2 & 3 (aparte plannen)

Na Fase 1:
- **Fase 2:** Rewards dashboard pagina (`/dashboard/rewards`), challenges API, submission flow
- **Fase 3:** Admin challenges pagina (`/admin/challenges`), weekly quest CRUD, review inbox
