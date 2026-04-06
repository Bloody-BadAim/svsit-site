# Gamification V2 — Design Spec

> SIT Studievereniging ICT — Bestuur XI
> Datum: 2026-04-05
> Status: Approved

## Overzicht

Gamification V2 vervangt het huidige 6-rank systeem met een dieper, breder progressiesysteem. Het doel: "Heb jij al level 10?" moet een ding worden op school. Pokemon meets GitHub achievements meets Duolingo streaks.

**6 subsystemen:**
1. XP & Levels (12 levels, S-curve, dual currency)
2. Badge Rarity (6 tiers, XP bonus)
3. Boss Fights (gezamenlijke health bar)
4. Card Accessories (pets, frames, effects, stickers, flair)
5. Leaderboard (bubbel ranking + hall of fame)
6. Shop & Easter Eggs (coins, rotatie, verborgen rewards)

**Architectuur:** Clean architecture — aparte tabellen per concept, duidelijke scheiding tussen XP engine, level engine, inventory, shop, en boss fight manager.

**Migratie:** Het huidige rank systeem (Starter → Diamond) wordt volledig vervangen door levels. Bestaande skins worden een "OG/Legacy collection" voor leden die ze al hadden.

---

## 1. XP & Level Systeem

### 12 Levels (S-curve progressie)

| Level | Titel | XP nodig | Cumulatief | Tier |
|-------|-------|----------|------------|------|
| 1 | Noob | 0 | 0 | Onboarding |
| 2 | Rookie | 25 | 25 | Onboarding |
| 3 | Script Kiddie | 50 | 75 | Onboarding |
| 4 | Hacker | 100 | 175 | Onboarding |
| 5 | Developer | 200 | 375 | Core |
| 6 | Engineer | 300 | 675 | Core |
| 7 | Architect | 400 | 1075 | Core |
| 8 | Wizard | 500 | 1575 | Prestige |
| 9 | Sage | 700 | 2275 | Prestige |
| 10 | Sensei | 1000 | 3275 | Legendary |
| 11 | Legend | 1500 | 4775 | Legendary |
| 12 | BDFL | 2500 | 7275 | Legendary |

**Tier kleuren:**
- Onboarding (L1-L4): Groen `#22C55E`
- Core (L5-L7): Blauw `#3B82F6`
- Prestige (L8-L9): Paars `#8B5CF6`
- Legendary (L10-L11): Rood `#EF4444`
- BDFL (L12): Goud `#F59E0B`

**Pacing indicatie:**
- L1-L4: ~2 weken actief lid zijn
- L5-L7: ~2-4 maanden actief
- L8-L9: ~half jaar actief
- L10-L12: heel studiejaar, alleen de meest actieve leden
- BDFL: max 1-3 leden per jaar

### Dual Currency

- **XP** — permanent, bepaalt je level, gaat nooit omlaag
- **Coins** — spendable in de shop, 1 XP verdiend = 1 coin verdiend, uitgeven trekt niet af van level

### XP Bronnen

**Events & Scans:**
| Actie | XP |
|-------|-----|
| Borrel check-in | 5 |
| Workshop/event | 10 |
| Hackathon | 25 |
| Organiseren van event | 40 |

**Challenges & Quests:**
| Actie | XP |
|-------|-----|
| Weekly quest | 10-25 |
| Skill track milestone | 15-50 |
| Boss fight bijdrage | 20-75 |
| Track completion | 100 |

### Kernregels

- XP is permanent — level gaat nooit omlaag
- Coins worden apart bijgehouden, parallel aan XP
- Elke XP transactie wordt gelogd met bron, categorie (Code/Social/Learn/Impact), en timestamp
- Level-up triggert een animated modal met confetti, nieuw skin unlock info, en nieuwe shop items
- BDFL = Benevolent Dictator For Life (Python referentie)

---

## 2. Badge Rarity Systeem

### 6 Rarity Tiers

| Rarity | Kleur | XP Bonus | Visueel |
|--------|-------|----------|---------|
| Common | Grijs `#888888` | +10 XP | Simpele border, geen animatie |
| Uncommon | Groen `#22C55E` | +25 XP | Groene glow |
| Rare | Blauw `#3B82F6` | +50 XP | Blauwe glow + shimmer |
| Epic | Paars `#8B5CF6` | +100 XP | Paarse glow + pulse animatie |
| Legendary | Goud `#F59E0B` | +250 XP | Gouden glow + particle ring |
| Mythic | Rainbow gradient | +500 XP | Animated rainbow border + sparkles |

### Bestaande Badges (herverdeeld)

**Common:**
- `badge_joined` — Welkom bij SIT (auto, eerste login)
- `badge_first_event` — First Blood (auto, 1 event)

**Uncommon:**
- `badge_borrel_5` — Borrel Veteran (auto, 5 borrels)
- `badge_streak_3` — On a Roll (auto, 3 events in 30 dagen)
- `badge_helper` — Event Helper (manual)

**Rare:**
- `badge_borrel_10` — Borrel Legend (auto, 10 borrels)
- `badge_allrounder` — All-Rounder (auto, punten in alle 4 categorien)
- `badge_bestuur` — Bestuurslid (manual)

**Epic:**
- `badge_hackathon` — Hackathon Survivor (manual)
- `badge_og_member` — OG Member (manual, founding members)
- `badge_fullstack` — Full Stack Dev (track completion)
- `badge_ai_engineer` — AI Engineer (track completion)
- `badge_security` — Security Specialist (track completion)

**Legendary:**
- `badge_party_animal` — Feestbeest (track completion)
- `badge_community_builder` — Community Builder (track completion)

### Nieuwe Badges (V2)

**Common:**
- `badge_first_purchase` — First Buy (eerste shop aankoop)
- `badge_profile_complete` — Volledig Profiel (alles ingevuld)

**Uncommon:**
- `badge_streak_7` — Unstoppable (7 events in 60 dagen)
- `badge_night_owl` — Night Owl (check-in na 22:00)

**Rare:**
- `badge_mentor` — Mentor (3 eerstejaars geholpen)
- `badge_double_xp_day` — XP Machine (100+ XP in 1 dag)

**Epic:**
- `badge_boss_slayer` — Boss Slayer (3 boss fights gewonnen)
- `badge_max_category` — Specialist (500+ XP in 1 categorie)

**Legendary:**
- `badge_completionist` — Completionist (alle common-epic badges)
- `badge_bdfl_witness` — Witness (online toen iemand BDFL werd)

**Mythic:**
- `badge_konami` — Konami Code (easter egg)
- `badge_first_bdfl` — First BDFL (allereerste BDFL ooit)
- `badge_founder_xi` — Founder XI (Bestuur XI founding members)

### Badge Slots (gekoppeld aan levels)

| Level | Slots |
|-------|-------|
| L1-L2 | 1 |
| L3-L4 | 2 |
| L5-L6 | 3 |
| L7-L8 | 4 |
| L9-L10 | 5 |
| L11-L12 | 6 |

---

## 3. Boss Fights

### Concept

Een boss is een gezamenlijke challenge met een XP health bar. Alle leden dragen bij door actief te zijn (events, challenges, quests). Alle XP die leden verdienen tijdens de boss fight periode telt automatisch mee. Als de groep genoeg XP verzamelt voor de deadline, is de boss verslagen.

### Boss Structuur

| Veld | Type | Voorbeeld |
|------|------|-----------|
| Naam | string | "De Deadline Dragon" |
| HP | integer | 5000 |
| Beschrijving | text | "Een monster dat elke student kent..." |
| Start datum | timestamp | 2026-05-01 |
| Deadline | timestamp | 2026-05-14 |
| Artwork | SVG | Uniek per boss |
| Base reward | XP + badge | 50 XP + exclusive badge |
| Top 3 reward | accessory | Legendary pet/effect |

### Lifecycle

1. **Announced** — Boss verschijnt op dashboard, countdown start over 24u
2. **Active** — Health bar zichtbaar, XP telt mee, live counter
3. **Defeated** — Confetti animatie, rewards uitgedeeld, hall of fame voor top 3 bijdragers
4. **Failed** — Boss ontsnapt, geen rewards

### XP Bijdrage

- Alle XP die een lid verdient tijdens de active periode telt automatisch als bijdrage
- Geen aparte acties nodig — gewoon events bezoeken, challenges doen, etc.
- XP gaat naar je eigen level EN telt als boss fight bijdrage (geen dubbele boekhouding, gewoon meegeteld)
- De `base_reward_xp` (bijv. 50 XP) is een BONUS die iedereen krijgt als de boss verslagen is, bovenop normaal verdiende XP
- Bijdrage per lid wordt getoond: "Jij: 85 XP van 5000"

### Dashboard Widget

- Grote health bar (rood → groen naarmate HP daalt)
- Timer countdown
- Deelnemers count ("47 leden vechten mee")
- Jouw bijdrage + rank binnen de fight
- Boss artwork (SVG, uniek per boss)

### Admin Panel

- Boss aanmaken: naam, HP, deadline, beschrijving, artwork, rewards
- Live stats: totale bijdrage, deelnemers, gemiddelde per lid
- Handmatig afsluiten of verlengen

### Cadans

~1 boss per maand, gelanceerd door bestuur via admin panel.

### Voorbeeld Bosses

- "De Deadline Dragon" — tentamenweek, 5000 HP
- "The Bug Kraken" — hackathon maand, 8000 HP
- "Kernel Panic" — security awareness week, 3000 HP
- "404 Not Found" — intro periode eerstejaars, 2000 HP

---

## 4. Card Accessories & Personalisatie

### 6 Accessory Categorien

#### 1. Pets
- Kleine animated SVG creatures, rechtsonder op de card
- Idle animatie (wiebelen, knipperen)
- Sommige reageren op stats (dragon groeit bij meer XP)
- Unlock: shop, boss rewards, easter eggs
- Voorbeelden: pixel cat, ghost, robot, dragon, rubber duck, clippy

#### 2. Frames
- Border rond de hele card, vervangt standaard border
- Sommige animated (neon pulseert, fire flikkert)
- Unlock: level milestones (L3, L5, L7, L9, L11)
- Voorbeelden: circuit board, glitch, neon, vine/nature, fire, ice crystal

#### 3. Effects
- Subtiele animated overlay over de card
- Unlock: shop, achievement badges
- Voorbeelden: falling code (matrix), sparkles, rain, snow, smoke, scanlines, confetti

#### 4. Stickers
- Kleine SVG icons, max 3 per card, vrij positioneerbaar (drag & drop)
- Unlock: events (elke borrel/event kan een exclusive sticker droppen)
- Voorbeelden: Amsterdam XXX, "Hello World", koffie beker, bug icon, 42, HvA logo

#### 5. Skins (V2)
- Nieuwe level skins: 12 skins, een per level, unlocken automatisch
- Progressief vetter: L1 = clean minimal, L6 = animated accenten, L12 = full animated rainbow chaos
- Skins zijn apart van accessories — je kiest een skin als basis, accessories gaan eroverheen
- Legacy V1 skins staan in een apart "OG" tabblad in de editor

#### 6. Flair
- Custom accent kleur voor XP bar en stat bars (unlock L6+)
- Custom title text onder je naam, bijv. "The Bug Whisperer" (unlock L8+)

### Card Layers (van buiten naar binnen)

```
Frame (border) → Skin (achtergrond) → Stickers (positioned) → Pet (rechtsonder) → Effect (overlay)
```

### Card Editor

Nieuwe pagina: `/dashboard/card-editor`

- Live preview van je card
- Tabbladen: Skins, Frames, Pets, Effects, Stickers, Flair
- Drag & drop voor sticker plaatsing
- Locked items getoond met "Unlock op Level X" of "Koop voor 200 coins" hint
- "Share card" knop — genereert screenshot-ready versie of deelbare link

### Legacy Skins

Bestaande 13 skins worden "OG Collection". Leden die ze al hadden behouden ze. Nieuwe leden kunnen ze niet meer krijgen. Badge `badge_og_member` relevant hier.

### Unlock Verdeling

| Bron | Wat |
|------|-----|
| Level up | 1 frame per oneven level (L3, L5, L7, L9, L11) |
| Level 6 | Accent kleur kiezen |
| Level 8 | Custom title text |
| Shop (coins) | Pets, effects, stickers, extra frames |
| Boss fight reward | Exclusive pets en effects (niet in shop) |
| Event attendance | Exclusive sticker per event |
| Badge unlock | Sommige badges unlocken een matching effect |
| Easter egg | Mythic-tier pets en stickers |

---

## 5. Leaderboard

### Pagina: `/leaderboard` (publiek, geen login nodig)

### Bubbel Ranking

- Ingelogd: je eigen positie + 5 boven en 5 onder je, eigen rij highlighted met gouden accent
- Niet ingelogd: alleen de top 10 zichtbaar

### Top 10 Hall of Fame

- Bovenaan de pagina
- Grotere cards met avatar, level, titel, equipped badges
- Nr 1: crown icon + grotere card
- Top 3: animated glow

### Filters

| Filter | Opties |
|--------|--------|
| Periode | Deze week, deze maand, dit semester, all-time |
| Categorie | Totaal XP, Code, Social, Learn, Impact |
| Scope | Alle leden, mijn commissie, mijn jaarlaag |

### Per Rij

- Positie (#1, #2, etc)
- Naam (of "Anoniem Lid" bij opt-out)
- Level + titel (bijv. "L7 Architect")
- XP voor de geselecteerde periode
- Equipped badges (max 3 getoond)
- Kleine member card thumbnail

### Privacy

- Leden kiezen in profiel: "Toon mij op leaderboard" (default aan)
- Opt-out: verschijnt als "Anoniem Lid" zonder card preview

### Highlights

- "Grootste stijger deze week" — badge naast naam
- "On fire" indicator — 3+ weken op rij in top 10

---

## 6. Shop & Easter Eggs

### Shop (pagina: `/dashboard/shop`)

**Coin saldo** altijd zichtbaar in dashboard header.

**Layout:**
- Grid van items per categorie tab (Pets, Effects, Stickers, Frames)
- Per item: preview, naam, prijs in coins, rarity badge
- Locked items (level-gated): "Unlock op Level X"
- "Nieuw" tag op items < 2 weken oud

**Prijsindicatie:**

| Rarity | Prijsrange (coins) |
|--------|--------------------|
| Common | 25-50 |
| Uncommon | 75-150 |
| Rare | 200-400 |
| Epic | 500-800 |
| Legendary | 1000-2000 |

**Rotatie:**
- Vaste collectie (altijd beschikbaar)
- Featured items (wisselen maandelijks)
- Seizoensitems (kerst, zomer) als limited time
- Bestuur beheert inventory via admin panel

### Admin Tools (Shop)

- Items toevoegen/bewerken (naam, beschrijving, prijs, rarity, categorie, preview)
- Markeren als featured/limited time
- Voorraad instellen (optional, voor exclusive items)
- Verkoop statistieken per item

### Easter Eggs

| Trigger | Reward |
|---------|--------|
| Konami code op homepage | `badge_konami` (mythic) + pet "Konami Snake" |
| Bezoek site om 4:04 AM | `badge_404` (legendary) + "Ghost" effect |
| Klik 10x op SIT logo | Sticker "SIT OG" |
| Eerste lid dat BDFL bereikt | `badge_first_bdfl` (mythic) + "Crown" pet |
| Type "sudo rm -rf /" in verborgen terminal | `badge_hacker` (epic) + "Glitch" frame |
| Check in op alle events van een maand | `badge_no_life` (legendary) + "Flame" pet |

---

## 7. Database Schema (V2)

### Nieuwe Tabellen

```sql
-- XP transactie log
xp_transactions (
  id UUID PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  amount INTEGER NOT NULL,
  coins_amount INTEGER NOT NULL,        -- altijd gelijk aan amount
  source TEXT NOT NULL,                  -- 'scan', 'challenge', 'boss_fight', 'badge_unlock', 'track_completion'
  source_id UUID,                        -- referentie naar scan/challenge/boss/badge
  category TEXT,                         -- 'code', 'social', 'learn', 'impact'
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Level definities (seed data)
levels (
  level INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  xp_required INTEGER NOT NULL,
  cumulative_xp INTEGER NOT NULL,
  tier TEXT NOT NULL                     -- 'onboarding', 'core', 'prestige', 'legendary'
)

-- Badge definities (seed data)
badge_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL,                  -- 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'
  xp_bonus INTEGER NOT NULL,
  icon TEXT,                             -- SVG reference
  auto_grant_rule JSONB,                 -- null = manual, anders auto-grant conditie
  category TEXT                          -- 'achievement', 'track', 'easter_egg', 'boss'
)

-- Lid badges (many-to-many)
member_badges (
  id UUID PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  badge_id TEXT REFERENCES badge_definitions(id),
  equipped BOOLEAN DEFAULT false,
  equipped_slot INTEGER,                 -- 1-6, null als niet equipped
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, badge_id)
)

-- Accessory definities (seed + admin managed)
accessory_definitions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,                -- 'pet', 'frame', 'effect', 'sticker', 'skin', 'merch'
  rarity TEXT NOT NULL,
  preview_data JSONB,                    -- SVG/animatie data of referentie
  shop_price INTEGER,                    -- null = niet in shop
  unlock_rule JSONB,                     -- level requirement, badge requirement, etc.
  is_featured BOOLEAN DEFAULT false,
  is_limited_time BOOLEAN DEFAULT false,
  limited_time_end TIMESTAMPTZ,
  stock INTEGER,                         -- null = unlimited
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Lid accessories (inventory)
member_accessories (
  id UUID PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  accessory_id UUID REFERENCES accessory_definitions(id),
  equipped BOOLEAN DEFAULT false,
  position JSONB,                        -- voor stickers: {x, y} coordinaten
  acquired_via TEXT NOT NULL,            -- 'shop', 'level_up', 'boss_fight', 'event', 'easter_egg', 'badge'
  acquired_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, accessory_id)
)

-- Boss fights
boss_fights (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  hp INTEGER NOT NULL,
  current_hp INTEGER NOT NULL DEFAULT 0, -- oplopend, boss verslagen als current_hp >= hp
  artwork_url TEXT,
  status TEXT NOT NULL DEFAULT 'announced', -- 'announced', 'active', 'defeated', 'failed'
  announced_at TIMESTAMPTZ,
  starts_at TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  base_reward_xp INTEGER NOT NULL,
  base_reward_badge_id TEXT REFERENCES badge_definitions(id),
  top_reward_accessory_id UUID REFERENCES accessory_definitions(id),
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Boss fight bijdragen (automatisch bijgehouden)
boss_fight_contributions (
  id UUID PRIMARY KEY,
  boss_fight_id UUID REFERENCES boss_fights(id),
  member_id UUID REFERENCES members(id),
  xp_contributed INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(boss_fight_id, member_id)
)

-- Shop transacties
shop_transactions (
  id UUID PRIMARY KEY,
  member_id UUID REFERENCES members(id),
  accessory_id UUID REFERENCES accessory_definitions(id),
  coins_spent INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now()
)
```

### Wijzigingen aan `members` tabel

```sql
ALTER TABLE members ADD COLUMN total_xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE members ADD COLUMN coins_balance INTEGER NOT NULL DEFAULT 0;
ALTER TABLE members ADD COLUMN current_level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE members ADD COLUMN custom_title TEXT;
ALTER TABLE members ADD COLUMN accent_color TEXT;
ALTER TABLE members ADD COLUMN leaderboard_visible BOOLEAN NOT NULL DEFAULT true;
-- active_skin blijft (voor legacy + nieuwe skins)
-- active_badges verhuist naar member_badges tabel (equipped boolean)
-- points kolom wordt deprecated, vervangen door total_xp
```

### Verwijderde/Deprecated Tabellen

- `rewards` tabel — wordt vervangen door `member_accessories` + `member_badges`
- `members.points` — vervangen door `members.total_xp`
- `members.active_badges` — vervangen door `member_badges` met `equipped = true`

### Merch Claims

Het V1 merch systeem (sticker pack bij Gold, hoodie bij Platinum, limited edition bij Diamond) wordt gekoppeld aan levels in plaats van ranks:
- Sticker Pack: Level 5 (Developer)
- Hoodie: Level 8 (Wizard)
- Limited Edition: Level 11 (Legend)

Merch claims blijven in `member_accessories` met `category = 'merch'` en `acquired_via = 'level_up'`.

### Migratie

Een migratiescript zet V1 data om naar V2:
1. `members.points` → `members.total_xp` + `members.coins_balance`
2. Bereken `current_level` op basis van `total_xp`
3. Bestaande badges uit `rewards` → `member_badges`
4. Bestaande skins markeren als "legacy" in `accessory_definitions`
5. `members.active_badges` array → `member_badges` equipped rows
6. Bestaande merch claims uit `rewards` → `member_accessories` met `category = 'merch'`

---

## 8. Nieuwe Paginas & UI Wijzigingen

### Nieuwe Paginas

| Route | Beschrijving | Auth |
|-------|-------------|------|
| `/leaderboard` | Publiek leaderboard | Nee (beperkt), Ja (volledig) |
| `/dashboard/card-editor` | Card customization | Ja |
| `/dashboard/shop` | Accessory shop | Ja |
| `/dashboard/xp` | "Hoe verdien ik XP" + XP history | Ja |

### Gewijzigde Paginas

| Route | Wijziging |
|-------|-----------|
| `/dashboard` | Boss fight widget toevoegen, coin saldo in header |
| `/dashboard/rewards` | ProgressionTracker updaten naar 12 levels, BadgeCollection updaten met rarity visuals |
| `/dashboard/ledenpas` | Card renderen met accessories (pet, frame, effect, stickers) |
| `/dashboard/profiel` | Leaderboard opt-out toggle, custom title (L8+), accent kleur (L6+) |
| `/admin` | Boss fight management, shop item management |

---

## 9. Implementatievolgorde

1. Database schema migratie + seed data
2. XP engine (transacties, dual currency, level berekening)
3. Level systeem UI (ProgressionTracker update, level-up modal)
4. Badge rarity systeem (definities, visuals, auto-grant updates)
5. "Hoe verdien ik XP" pagina
6. Card accessories engine (inventory, equip/unequip)
7. Card editor pagina
8. Card rendering update (layers: frame, skin, stickers, pet, effect)
9. Shop pagina + admin
10. Leaderboard pagina
11. Boss fights (engine + dashboard widget + admin)
12. Easter eggs
13. Legacy skin migratie
