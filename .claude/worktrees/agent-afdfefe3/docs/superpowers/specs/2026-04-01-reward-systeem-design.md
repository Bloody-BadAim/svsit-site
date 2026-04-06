# Reward Systeem — Card Skins, Badges, Challenges & Skill Tracks

**Datum:** 2026-04-01
**Status:** APPROVED
**Scope:** Dynamische stats, unlockable card skins, badge collectie, skill tracks, weekly quests, challenge systeem met bewijs, progressieve level rewards met fysieke merchandise

---

## Overzicht

SIT wordt een gamified leerplatform. Leden verdienen XP en stats via drie kanalen:
1. **Events** — bestaand scan systeem (borrels, hackathons, talks)
2. **Challenges** — educatieve en sociale opdrachten met bewijs
3. **Weekly Quests** — wekelijks roterende opdrachten door admins

Bij hogere ranks unlocken ze card skins, badges, en fysieke merchandise. Stats op de kaart zijn dynamisch en reflecteren echte activiteiten.

---

## 1. Dynamische Stats (vervangt hardcoded STR/INT/SOC)

### Vier stat axes

| Stat | Naam | Hoe verdienen | Kleur |
|------|------|--------------|-------|
| `CODE` | Coding | Hackathons, coding workshops, CTF challenges, code reviews, certificates | `var(--color-accent-blue)` |
| `SOCIAL` | Social | Borrels, kroegentochten, game nights, networking events | `var(--color-accent-green)` |
| `LEARN` | Knowledge | Tech talks, lezingen, workshops, cursus milestones, certificaten | `var(--color-accent-gold)` |
| `IMPACT` | Impact | Commissiewerk, events organiseren, helpen, mentoring | `var(--color-accent-red)` |

### Berekening
- Elke event scan heeft een `category` veld: `code`, `social`, `learn`, `impact`
- Elke challenge completion geeft punten in 1+ categorien
- Stats worden berekend als som van punten per categorie
- XP (totaal) = som van alle stats
- Weergave op MemberCard en dashboard: horizontale bars per stat

### Database
Nieuwe kolom op `scans` tabel:
```sql
ALTER TABLE scans ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'social';
```

Challenges slaan ook category op (zie sectie 3).

---

## 2. Card Skins

### Rank Skins (automatisch unlocked bij rank bereiken)

| ID | Rank | Naam | Visueel |
|----|------|------|---------|
| `default` | Starter (0xp) | Default | Huidige rainbow conic-gradient border |
| `skin_bronze` | Bronze (5xp) | Koper Glow | Warm koperen border, subtiele amber glow |
| `skin_silver` | Silver (10xp) | Chrome | Zilver metallic border, koele shine |
| `skin_silver_matrix` | Silver (10xp) | Matrix | Groene border, dalende code-regen achtergrond |
| `skin_gold` | Gold (15xp) | Gold Prestige | Gouden border met pulserende glow, premium feel |
| `skin_plat` | Platinum (20xp) | Holographic | Witte iridescent border, regenboog shine effect |
| `skin_diamond` | Diamond (25xp) | Crystal | Blauwe border met animated kristal shimmer |

### Achievement Skins (unlocked via badges)

| ID | Vereiste Badge | Naam | Visueel |
|----|---------------|------|---------|
| `skin_first_event` | `badge_first_event` | First Blood | Rode accent border, "1st" corner mark |
| `skin_hackathon` | `badge_hackathon` | Hacker | Terminal groene border, code scanlines |
| `skin_borrel_5` | `badge_borrel_5` | Stamgast | Warme amber border, bierglas watermark |
| `skin_og` | `badge_og_member` | OG | Vintage goud, "EST. 2025" stamp |
| `skin_bestuur` | `badge_bestuur` | Bestuur XI | Premium goud+zwart, bestuur embleem |

### Skill Track Skins (unlocked bij track completion)

| ID | Vereiste Track | Naam | Visueel |
|----|---------------|------|---------|
| `skin_fullstack` | Fullstack Developer track | Fullstack | Blauw-groene gradient, terminal prompt |
| `skin_ai` | AI Engineer track | Neural | Paarse glow, neural network pattern |
| `skin_security` | Cyber Security track | Encrypted | Groene matrix rain, lock icoon |
| `skin_party` | Feestbeest track | Party Animal | Neon multicolor, confetti accenten |

### Implementatie
- `MemberCard` krijgt een optionele `skin` prop (string ID)
- Skin definities in `src/lib/cardSkins.ts`: border style, glow, background, speciale effecten
- `active_skin` kolom op members bepaalt welke skin getoond wordt

---

## 3. Challenge Systeem

### Database

```sql
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,             -- 'quest' (weekly), 'track_milestone', 'achievement'
  category TEXT NOT NULL,         -- 'code', 'social', 'learn', 'impact'
  points INTEGER NOT NULL,        -- XP voor deze challenge
  track_id TEXT,                  -- NULL of bijv. 'fullstack', 'ai_engineer'
  track_order INTEGER,            -- volgorde binnen track (1, 2, 3...)
  proof_required BOOLEAN DEFAULT true,
  proof_type TEXT,                -- 'link', 'screenshot', 'text', 'scan'
  active_from TIMESTAMPTZ,        -- voor weekly quests: startdatum
  active_until TIMESTAMPTZ,       -- voor weekly quests: einddatum
  created_by TEXT,                -- admin email
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  proof_url TEXT,                 -- link naar bewijs
  proof_text TEXT,                -- beschrijving/uitleg
  status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
  reviewed_by TEXT,               -- admin email
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, member_id)
);
```

### Challenge Types

#### Weekly Quests
- Admins maken wekelijks 3-5 nieuwe quests via admin panel
- Zichtbaar op /dashboard/rewards met countdown timer
- Voorbeelden:
  - "Ga naar de borrel deze week" (+2 SOCIAL)
  - "Los een HackTheBox challenge op en deel je writeup" (+3 CODE)
  - "Help een eerstejaars met hun project" (+2 IMPACT)
  - "Volg een online workshop en deel je certificaat" (+2 LEARN)
- Bewijs: lid submit link of beschrijving, admin keurt goed/af

#### Skill Track Milestones
Vaste challenges gegroepeerd in tracks. Lid doorloopt ze in volgorde.

**Track: Fullstack Developer** (CODE category)
1. "Maak een GitHub profiel en pin je beste project" (+1 CODE)
2. "Bouw een simpele website en deploy op Vercel/Netlify" (+2 CODE)
3. "Maak een REST API met Node.js of Python" (+2 CODE)
4. "Bouw een fullstack app met database" (+3 CODE)
5. "Doe mee aan een hackathon" (+3 CODE)
→ Track compleet: `badge_fullstack` + `skin_fullstack`

**Track: AI Engineer** (CODE + LEARN category)
1. "Voltooi een intro ML cursus (Kaggle/Coursera)" (+2 LEARN)
2. "Train je eerste model en deel resultaten" (+2 CODE)
3. "Bouw een chatbot of classifier" (+3 CODE)
4. "Presenteer je AI project bij een SIT event" (+2 IMPACT)
5. "Behaal een AI certificaat" (+3 LEARN)
→ Track compleet: `badge_ai_engineer` + `skin_ai`

**Track: Cyber Security** (CODE category)
1. "Maak een TryHackMe/HackTheBox account" (+1 CODE)
2. "Los 5 beginner CTF challenges op" (+2 CODE)
3. "Doe mee aan een CTF competitie" (+3 CODE)
4. "Geef een korte presentatie over een security topic" (+2 IMPACT)
5. "Behaal een security certificaat (CompTIA/CEH/etc)" (+3 LEARN)
→ Track compleet: `badge_security` + `skin_security`

**Track: Feestbeest** (SOCIAL category)
1. "Ga naar je eerste SIT borrel" (+1 SOCIAL)
2. "Ga naar 3 verschillende events" (+2 SOCIAL)
3. "Organiseer of help bij een event" (+2 IMPACT)
4. "Ga mee op kroegentocht" (+2 SOCIAL)
5. "Bezoek 10 events in totaal" (+3 SOCIAL)
→ Track compleet: `badge_party_animal` + `skin_party`

**Track: Community Builder** (IMPACT category)
1. "Help een eerstejaars met een vraag" (+1 IMPACT)
2. "Word actief in een SIT commissie" (+2 IMPACT)
3. "Organiseer een workshop of presentatie" (+3 IMPACT)
4. "Mentor een nieuw lid voor een maand" (+3 IMPACT)
5. "Draag bij aan een SIT project (website, tools, etc)" (+3 CODE)
→ Track compleet: `badge_community_builder` + speciale titel

#### One-time Achievements
Automatisch of admin-toegekend. Zie badges sectie.

### Bewijs Flow
1. Lid opent challenge op /dashboard/rewards
2. Klikt "Submit bewijs"
3. Vult link (GitHub, screenshot URL) of tekst in
4. Status wordt `pending`
5. Admin ziet pending submissions in admin panel
6. Admin keurt goed → XP + stats worden toegekend, badge unlocked
7. Admin keurt af → lid krijgt feedback, kan opnieuw proberen

---

## 4. Badges

### Achievement Badges

| ID | Naam | Hoe te verdienen | Icoon (SVG) |
|----|------|-----------------|-------------|
| `badge_joined` | Joined SIT | Automatisch bij registratie | checkmark in cirkel |
| `badge_first_event` | First Event | Eerste scan bij een event | ticket/toegangskaart |
| `badge_hackathon` | Hackathon | Deelname aan een hackathon | terminal/code brackets |
| `badge_borrel_5` | Stamgast | 5 borrel events bezocht | glas/cheers |
| `badge_borrel_10` | Borrel Veteraan | 10 borrel events | kroon op glas |
| `badge_helper` | Helpende Hand | Meehelpen bij een event (admin) | hand/hartje |
| `badge_og_member` | OG Member | Lid sinds oprichting (admin) | vintage schild |
| `badge_bestuur` | Bestuur XI | Bestuurslid (admin) | {SIT} embleem |
| `badge_streak_3` | On Fire | 3 events op rij bezocht | vlam |
| `badge_allrounder` | Allrounder | 1 event van elk type bezocht | ster met stralen |

### Skill Track Badges

| ID | Naam | Hoe te verdienen | Icoon (SVG) |
|----|------|-----------------|-------------|
| `badge_fullstack` | Fullstack Developer | Fullstack track voltooien | gestapelde layers |
| `badge_ai_engineer` | AI Engineer | AI track voltooien | neural network nodes |
| `badge_security` | Cyber Security | Security track voltooien | slot/schild |
| `badge_party_animal` | Feestbeest | Feestbeest track voltooien | feesthoedje |
| `badge_community_builder` | Community Builder | Community track voltooien | netwerk/verbindingen |

Alle badge iconen als inline SVG componenten in `src/components/badges/`. Custom SVG's in SIT brand kleuren.

### Badge Slots
- Starter: 1 slot op de kaart
- Bronze: 2 slots
- Silver: 3 slots
- Gold: 4 slots
- Platinum: 5 slots
- Diamond: 6 slots

---

## 5. Level Rewards

| Rank | Digitaal | Fysiek |
|------|----------|--------|
| Starter (0xp) | Default skin, 1 badge slot | — |
| Bronze (5xp) | Koper Glow skin, 2 badge slots, custom title | — |
| Silver (10xp) | Chrome + Matrix skins, 3 badge slots | — |
| Gold (15xp) | Gold Prestige skin, 4 badge slots | SIT Sticker Pack |
| Platinum (20xp) | Holographic skin, 5 badge slots | SIT Hoodie of T-shirt |
| Diamond (25xp) | Animated Diamond skin, 6 badge slots | Limited Edition skin + Bestuur nominatie |

### Fysieke Rewards Claim Flow
1. Lid bereikt Gold/Platinum/Diamond
2. Op /dashboard/rewards verschijnt een "Claim" button
3. Klikken zet `claimed_at` timestamp in rewards tabel
4. Admin ziet claims in admin panel, markeert als uitgereikt

---

## 6. Database Schema (volledig)

### Nieuwe tabel: `rewards`
```sql
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  type TEXT NOT NULL,            -- 'skin_unlock', 'badge', 'merch_claim'
  reward_id TEXT NOT NULL,       -- 'skin_bronze', 'badge_first_event', etc
  claimed_at TIMESTAMPTZ,        -- voor merch: wanneer geclaimed
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, reward_id)
);
```

### Nieuwe tabel: `challenges`
```sql
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,             -- 'quest', 'track_milestone', 'achievement'
  category TEXT NOT NULL,         -- 'code', 'social', 'learn', 'impact'
  points INTEGER NOT NULL,
  track_id TEXT,
  track_order INTEGER,
  proof_required BOOLEAN DEFAULT true,
  proof_type TEXT,                -- 'link', 'screenshot', 'text', 'scan'
  active_from TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Nieuwe tabel: `challenge_submissions`
```sql
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  proof_url TEXT,
  proof_text TEXT,
  status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, member_id)
);
```

### Wijzigingen op bestaande tabellen
```sql
ALTER TABLE members ADD COLUMN IF NOT EXISTS active_skin TEXT DEFAULT 'default';
ALTER TABLE members ADD COLUMN IF NOT EXISTS active_badges TEXT[] DEFAULT '{}';
ALTER TABLE scans ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'social';
```

---

## 7. UI

### Ledenpas pagina (`/dashboard/ledenpas`)
- Bestaande kaart + QR + download (ongewijzigd)
- Nieuw eronder: **Quick Skin Selector**
  - Horizontale rij skin thumbnails
  - Unlocked: klikbaar, gouden border bij active
  - Locked: grijs, lock icoon, unlock requirement

### Rewards pagina (`/dashboard/rewards`) — nieuwe route
- **Stats Overview**: 4 stat bars (CODE/SOCIAL/LEARN/IMPACT) met actuele waarden
- **Progression Tracker**: rank timeline Starter → Diamond, huidige positie
- **Weekly Quests**: actieve quests met countdown, submit bewijs button
- **Skill Tracks**: lijst van tracks met voortgang (3/5 milestones), start/continue button
- **Card Skins**: grid, unlocked/locked, "Equip" button
- **Badge Collectie**: alle badges, verdiend vs locked, slot editor
- **Fysieke Rewards**: claim status per tier
- **Nav**: nieuw item in DashboardNav

### Admin — Challenge beheer
- **Nieuwe route: `/admin/challenges`**
  - Weekly quests aanmaken/bewerken (titel, beschrijving, categorie, punten, deadline)
  - Pending submissions inbox met approve/reject
  - Track milestone beheer
- **MemberDetailModal**: badges handmatig toekennen
- **Admin leden pagina**: filter "Merch claims"

---

## 8. API Endpoints

### Rewards
- `GET /api/rewards/[memberId]` — eigen of admin
- `POST /api/rewards` — admin: handmatige badge/skin toekenning

### Challenges
- `GET /api/challenges` — actieve challenges (weekly quests + tracks)
- `GET /api/challenges/tracks` — alle skill tracks met milestones
- `POST /api/challenges` — admin: nieuwe challenge aanmaken
- `POST /api/challenges/[id]/submit` — lid: bewijs indienen
- `PATCH /api/challenges/submissions/[id]` — admin: approve/reject

### Bestaand uitbreiden
- `PATCH /api/members/[id]`: `active_skin` en `active_badges` toevoegen
- `POST /api/scans`: `category` veld + auto-grant rewards na scan

---

## 9. Auto-Grant Logic

`src/lib/rewards.ts` — `grantRewards(memberId)` helper:

1. Bereken stats per category uit scans + approved challenges
2. Bereken totaal XP en nieuwe rank
3. Grant rank skins als nog niet unlocked
4. Check automatische badges (first_event, borrel counts, streaks)
5. Check track completion (alle milestones approved?)
6. Grant achievement skins bij badge unlock
7. Grant track skins bij track completion

Wordt aangeroepen na:
- Elke scan (POST /api/scans)
- Elke challenge approval (PATCH /api/challenges/submissions)

---

## Niet in scope (later)
- Trading/gifting van skins
- Seizoens-skins (kerst, zomer)
- Leaderboard pagina
- Push notificaties bij unlocks
- Team challenges
- Discord bot integratie
