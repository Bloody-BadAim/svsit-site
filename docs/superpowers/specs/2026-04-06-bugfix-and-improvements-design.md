# Bugfix & Improvements Spec — 2026-04-06

Comprehensive spec voor alle openstaande bugs en verbeteringen op de SIT website.

---

## Werkpakket A: Boss Fight Fixes

### A1. Announced → Active transitie (BUG)

**Probleem**: `checkBossStatus()` in `bossEngine.ts` handelt alleen `active → defeated/failed` af. Er is geen code die een boss van `announced` naar `active` zet wanneer `startsAt` passeert. De widget toont "Verlopen" voor de countdown omdat `startsAt` in het verleden ligt maar de status nog steeds `announced` is.

**Fix**:
- In `bossEngine.ts` → `checkBossStatus()`: check als `status === 'announced'` EN `now() >= startsAt` → update status naar `'active'`
- In `getActiveBoss()`: voeg dezelfde check toe zodat de transitie ook bij het ophalen gebeurt
- In de `/api/boss` GET route: na het ophalen van de boss, roep `checkBossStatus()` aan om lazy transitie te triggeren

### A2. Events/Scans dragen bij aan boss damage (FEATURE)

**Probleem**: `/api/scans` POST geeft punten maar roept niet `grantXp()` aan. Alleen challenge completions en badge unlocks triggeren de boss fight XP contribution in `xpEngine.ts`.

**Fix**:
- In `/api/scans/route.ts`: na succesvolle scan, roep `grantXp()` aan met `source: 'scan'` en de punten als amount
- Dit triggert automatisch de boss contribution logic die al in `xpEngine.ts` zit
- Verwijder directe punten update (die omzeilt het XP systeem) en gebruik `grantXp()` als single source of truth

### A3. Admin Boss CRUD — Edit & Delete (FEATURE)

**Probleem**: `/api/admin/boss/route.ts` heeft alleen POST. Geen PATCH/DELETE. Admin UI toont alleen een create form en een readonly lijst.

**API toevoegen**:
- `PATCH /api/admin/boss` — body: `{ id, name?, description?, hp?, startsAt?, deadline?, baseRewardXp?, baseRewardBadgeId?, status? }`
  - Admin auth check
  - Partial update van boss_fights record
  - Kan ook status handmatig wijzigen (bijv. force-activate of cancel)
- `DELETE /api/admin/boss` — body: `{ id }`
  - Admin auth check
  - Verwijdert boss + gerelateerde contributions (CASCADE of manual)
  - Alleen als boss nog geen rewards heeft uitgedeeld (status !== 'defeated')

**UI toevoegen in BossManager.tsx**:
- Edit button per BossCard → opent inline edit form met huidige waarden
- Delete button → confirmation dialog → verwijdert boss
- Status change dropdown (announced/active/failed) per boss
- Refresh na elke actie

### A4. Boss Artwork in Widget (VISUAL)

**Probleem**: `artworkUrl` field bestaat in DB maar wordt nergens gerenderd.

**Fix**:
- In `BossFightWidget.tsx` ActiveState: als `boss.artworkUrl` bestaat, toon een afbeelding boven of naast de boss naam
- Fallback: als geen artwork, toon een default boss SVG icon (Swords icon is al aanwezig)
- In admin create/edit form: optioneel URL veld voor artwork
- Later: custom SVG boss illustraties (buiten scope van deze spec, komt als apart design ticket)

---

## Werkpakket B: Card Customization Fixes

### B1. Stickers tonen op kaart (BUG)

**Probleem**: `buildEquipment()` in CardEditor.tsx (regel 624-666) bouwt het equipment object maar vult het `stickers` veld NIET. Het wordt nooit aan MemberCard doorgegeven.

**Fix**:
- In CardEditor `buildEquipment()`: query alle equipped stickers uit de equippedMap (stickers zijn meervoudig, max 3)
- Bouw `stickers` array met `{ id, x, y, emoji }` uit de member_accessories data
- Pas de equippedMap aan om meerdere stickers te ondersteunen (nu: 1 per category, maar stickers zijn speciaal)
- Alternatief: houd een aparte `equippedStickers` state naast de `equippedMap`

**Sticker data flow**:
1. `equipped` prop bevat sticker rows met `position: { x, y }` en `accessory_definitions.preview_data.emoji`
2. `buildEquipment()` mapt deze naar `MemberCardEquipment.stickers[]`
3. `MemberCard` rendert ze als absolutely positioned emoji divs (code bestaat al op regel 558-574)

### B2. Frame deduplicatie (BUG)

**Probleem**: Alle frames in de grid tonen dezelfde `FramePreview` component die alleen rarity-based kleuren toont. Als er meerdere frames met dezelfde rarity zijn, zien ze er identiek uit.

**Fix**:
- Geef elke frame een unieke visuele preview: gebruik `preview_data` om een specifieke border style/kleur per frame te definiëren
- Update `FramePreview` om `preview_data` te gebruiken voor custom styling (bijv. `preview_data.borderStyle: 'neon' | 'matrix' | 'gold' | 'ice' | 'fire'`)
- Elke frame krijgt een duidelijk verschillende preview: Neon = cyan glow, Matrix = green scanlines, Gold = goud shimmer, Ice = blauw/wit, Fire = rood/oranje gradient
- Check ook of er duplicate `accessory_definitions` rows in de DB zitten met dezelfde naam

### B3. Pets op kaart fixen (BUG)

**Probleem**: Als `petId` uit `preview_data` niet matcht met een key in `PET_MAP`, valt MemberCard terug op het renderen van de string als tekst.

**Fix**:
- Verifieer dat alle pet accessory_definitions een correct `preview_data.petId` hebben dat matcht met PET_MAP keys
- In `MemberCard.tsx` regel 578: als `PET_MAP[equipment.petEmoji]` undefined is, probeer een fuzzy match (lowercase, underscores) voordat je terugvalt op tekst
- In `CardEditor.tsx` `buildEquipment()`: gebruik altijd `petDef.preview_data?.petId` als primary lookup, niet `petDef.preview_data?.emoji`
- Log een warning als een pet niet matcht zodat we het makkelijk kunnen debuggen

---

## Werkpakket C: Email Templates Redesign

### C1. Unified Email Template System

**Probleem**: Password reset gebruikt raw HTML, ticket email gebruikt React Email. Inconsistent design.

**Fix**:
- Maak een gedeelde `EmailLayout` component in `src/emails/components/EmailLayout.tsx`:
  - Consistent header met {SIT} logo
  - Top accent bar (red/gold/green/blue)
  - Bottom accent bar (reversed)
  - Footer met svsit.nl + Bestuur XI
  - Dark theme met design tokens
- Migreer password reset naar React Email met dezelfde layout
- Update member broadcast email met dezelfde layout

### C2. Ticket Email Fix

**Probleem**: Prijs kleur is `C.green` voor zowel gratis als betaald (`price === "GRATIS" ? C.green : C.green`).

**Fix**: Betaalde tickets krijgen `C.gold` als prijs kleur, gratis blijft `C.green`.

### C3. Password Reset Email Redesign

**Huidige staat**: Basic inline HTML zonder brand identity.

**Nieuw design**:
- Gebruik `EmailLayout` component
- Terminal-style code block met reset info
- CTA button met goud accent (bestaand)
- Geldigheid info (7 dagen)
- Consistent met ticket email design

---

## Werkpakket D: Admin Dashboard Improvements

### D1. Boss Management UX

Zie A3 hierboven voor de CRUD logica. Extra UX:
- Inline edit mode per boss card (toggle between view/edit)
- Contributor count wordt live opgehaald (nu hardcoded 0)
- HP progress als animated bar
- Quick actions: Activate, Force Fail, Delete

### D2. Admin Shared Styles (REFACTOR)

**Probleem**: Elke admin component definieert eigen `inputStyle`, `labelStyle`, etc.

**Fix**:
- Maak `src/components/admin/AdminStyles.ts` met gedeelde style objects
- Importeer in alle admin components
- Consistente look & feel

---

## Implementatie Volgorde

1. **B: Card fixes** (klein, geen API changes nodig, snel testbaar)
2. **A1-A2: Boss logic fixes** (backend, critical bugs)
3. **A3-A4 + D1: Boss admin CRUD** (frontend + API)
4. **C: Email redesign** (standalone, geen dependencies)

## Buiten Scope

- Ticket systeem rebuild (apart spec nodig, te groot)
- Admin dashboard volledige refactor (incrementeel)
- Custom boss SVG illustraties (design ticket)
- Events uit database ipv Notion (apart)
