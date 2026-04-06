# Dashboard Redesign — RPG Character Screen

> Datum: 2026-04-06
> Status: Approved

## Overzicht

Merge 7 dashboard paginas naar 3. Het dashboard wordt een RPG character screen waar je card centraal staat.

### Nieuwe structuur

| Route | Inhoud |
|-------|--------|
| `/dashboard` | Character screen: card + tabs (MY CARD, QUESTS, BADGES) |
| `/dashboard/shop` | Shop (blijft apart, te veel content) |
| `/dashboard/profiel` | Settings (email, wachtwoord, student nummer) |

### Verwijderde routes (content verplaatst)

- `/dashboard/ledenpas` → merged in dashboard MY CARD tab
- `/dashboard/xp` → merged in dashboard QUESTS tab
- `/dashboard/rewards` → merged in dashboard BADGES tab + level bar
- `/dashboard/card-editor` → CUSTOMIZE knop opent drawer/modal op dashboard

## Layout

### Persistent Top Bar (altijd zichtbaar)

```
LVL 5 DEVELOPER  ████████░░ 74/300    🔥3 streak    💰1,234 coins
```

- Level nummer + titel + XP bar spanning beschikbare breedte
- Streak counter (vuur icon + dagen)
- Coins saldo

### Tabs (onder top bar)

```
[ MY CARD ]  [ QUESTS ]  [ BADGES ]  [ SHOP → ]
```

Shop tab linkt naar `/dashboard/shop` (aparte pagina).

### Tab 1: MY CARD (default)

**Desktop: 2 kolommen**

Links (280px):
- Member card (groot), volledig gerenderd met equipped accessories, pet, frame, effects, badges
- Pet leeft op de card met idle animatie
- Equipped badges zichtbaar als kleine glowing squares op de card
- 3 actieknoppen onder de card: SCAN QR (flipt card naar QR), CUSTOMIZE (opent card editor drawer), SHARE

Rechts (flex):
- Next Unlock teaser — blurred preview thumbnail + naam + "226 XP te gaan" + progress bar
- Boss Fight widget (alleen als actief) — war room design met health bar
- Recent Activity — compact lijst met XP gains, badge unlocks (✦ marker)
- Daily stats: "0 XP VANDAAG" (rood als 0) + streak counter

**Mobile: gestackt**
- Card full width bovenaan
- Actieknoppen horizontaal
- Info panels eronder gestackt

### Tab 2: QUESTS

- Actieve weekly quests met progress bars en deadlines
- Skill track milestones met submit proof functionaliteit
- XP history log (compact, met categorie kleur dots en XP bedragen)
- "Hoe verdien ik XP" sectie (collapse/expand)

### Tab 3: BADGES

- Equipped slots bovenaan (klik om te wisselen)
- Volledige badge collectie grid met rarity effects
- Filter per rarity (all/common/uncommon/rare/epic/legendary/mythic)
- Locked badges getoond met lock icon en "hoe unlock je dit" tooltip
- Badge detail modal bij klik: groot icon, naam, beschrijving, rarity, earned date

### Card Editor (Drawer)

CUSTOMIZE knop opent een slide-in drawer (rechts, 400px breed):
- Tabbed: Skins, Frames, Pets, Effects, Stickers, Flair
- Items grid per tab
- Live preview = de actual card op de pagina update real-time
- Sluiten = drawer sluit, card blijft geüpdatet

### QR Flip

SCAN QR knop flipt de member card 180° (CSS transform rotateY) naar de achterkant die een grote QR code toont. Klik opnieuw om terug te flippen.

## Data Flow

Alle data voor het dashboard wordt in 1 server component geladen:
- Member data (level, xp, coins, role, commissie, custom_title, accent_color)
- Stats (calculateStats)
- Equipped accessories (getEquippedAccessories)
- Earned badges (member_badges)
- Active boss fight (getActiveBoss)
- Recent activity (scans + challenge_submissions, laatste 10)
- Active quests (challenges where active)
- Skill tracks + submissions

Parallel fetchen via Promise.all().

## Sidebar Navigatie Update

DashboardNav wordt vereenvoudigd:
```
Dashboard    → /dashboard
Shop         → /dashboard/shop
Profiel      → /dashboard/profiel
Admin        → /admin (als admin)
```

Van 7+ links naar 4.

## Implementatie

1. Nieuwe `/dashboard/page.tsx` met tabbed layout
2. MY CARD tab component
3. QUESTS tab component
4. BADGES tab component
5. Card editor drawer component
6. QR flip functionaliteit
7. DashboardNav simplificatie
8. Oude pagina routes redirecten of verwijderen
9. Mobile responsive
