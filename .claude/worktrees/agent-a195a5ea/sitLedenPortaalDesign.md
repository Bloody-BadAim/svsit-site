# SIT Leden Portaal: Design Prompt

## Stap 0: VERPLICHT

Lees EERST de Figma brand kit via MCP voordat je IETS styled:
- `get_metadata` nodeId `0:1`, file key `tIr6cbTBLa26HIsLkW2vyG`
- `get_variable_defs` voor design tokens
- `get_design_context` op template frames

Lees OOK de bestaande homepage componenten in het project:
- `src/components/` — bekijk alle bestaande componenten voor stijl referentie
- `src/app/globals.css` — alle CSS custom properties en Tailwind config
- De JoinCta.tsx component bevat de EXACTE member card die je moet hergebruiken

Gebruik de `ckm:design-system` en `ui-ux-pro-max` skills voor UI componenten.

## Design systeem (match de homepage EXACT)

### Kleuren (uit globals.css, NIET opnieuw definieren)

```
--color-bg: #09090B           (achtergrond)
--color-surface: #111113      (kaarten, panels)
--color-surface-hover: #1A1A1D
--color-border: rgba(255, 255, 255, 0.06)
--color-text: #FAFAFA         (hoofdtekst)
--color-text-muted: #71717A   (subtekst)
--color-accent-gold: #F59E0B  (primaire accent, CTA's, highlights)
--color-accent-blue: #3B82F6  (secondary)
--color-accent-red: #EF4444   (alerts, errors)
--color-accent-green: #22C55E (success, actief)
```

### Typografie

- **Headings:** Big Shoulders Display Bold (al geladen in layout.tsx)
- **Body:** Geist of system font (al geladen)
- **Mono/code:** JetBrains Mono (al geladen, gebruik voor {SIT} logo, code elementen, stats)
- **NOOIT:** Inter, Roboto, Arial, Space Grotesk

### UI patronen van de homepage (kopieer deze stijl)

- Surface kaarten: `bg-[#111113]` met `border border-white/[0.06]` en `rounded-lg`
- Geen `rounded-full` op grote kaarten, wel op badges en kleine elementen
- Gouden accent (`#F59E0B`) alleen voor belangrijke elementen: CTA knoppen, actieve states, highlights
- Tekst hierarchy: grote bold headings, muted subtekst, veel whitespace
- Code/terminal elementen: monospace font, lijn nummers, syntax kleuring
- De ××× (drie kruisjes) als branding element in hoeken/footers
- Sectie nummering: 01, 02, 03 in muted kleur
- Noise/grain texture op achtergrond (al in globals.css)

### Knoppen

```
Primair:  bg-[#F59E0B] text-black font-bold hover:bg-[#F59E0B]/90
          Scherpe hoeken (rounded-md, NIET rounded-full)
          
Secundair: bg-white/[0.06] text-white border border-white/[0.06]
           hover:bg-white/[0.10]

Ghost:     text-[#71717A] hover:text-white
```

## Member Card (EXACTE kopie van homepage)

De member card op de homepage (`JoinCta.tsx`) MOET hergebruikt worden in het dashboard. Dit is het EXACTE ontwerp:

```
┌─────────────────────────────────────────┐
│ {SIT}              MEMBER CARD          │
│                    Bestuur XI           │
│                                         │
│ ┌─────┐                                │
│ │?????│  Jouw Naam                      │
│ └─────┘  CLASS: [Commissie/Rol]         │
│                                         │
│ LVL [XX]    [RANK NAAM]                 │
│                                         │
│ Experience                              │
│ ████████░░░░░░░░  [punten] / [max] xp   │
│                                         │
│ Stats                                   │
│ code    [X]/10                          │
│ social  [X]/10                          │
│ chaos   [X]/10                          │
│                                         │
│ Badges                                  │
│ [badge icons]                           │
│                                         │
│ SIT-2026-2027              ×××          │
└─────────────────────────────────────────┘
```

### Member card regels

- Importeer en hergebruik het BESTAANDE MemberCard component uit de homepage als dat er is
- Als het niet als apart component bestaat: extraheer het uit JoinCta.tsx en maak er een shared component van in `src/components/shared/MemberCard.tsx`
- In de homepage: card toont placeholder data ("Jouw Naam", "?????", CLASS: Undecided)
- In het dashboard: card toont ECHTE data van de ingelogde gebruiker
- QR code vervangt de "?????" avatar placeholder op de ledenpas pagina

### Card data mapping

| Card veld | Data bron |
|---|---|
| Naam | member.email of display name |
| CLASS | member.commissie naam, of "Member" als geen commissie |
| LVL | `Math.floor(member.points / 5)` |
| Rank naam | Starter → Bronze → Silver → Gold → Platinum → Diamond |
| XP bar | `(member.points % 5) / 5 * 100` procent gevuld |
| Stats code/social/chaos | Berekend uit scan history categorien |
| Badges | Gebaseerd op achievements (eerste event, 10 punten, etc) |
| SIT-2026-2027 | Lidmaatschapsjaar |

## Pagina designs

### Login (`/login`)

- Centered card op donkere achtergrond (zoals de homepage hero)
- {SIT} logo bovenaan in JetBrains Mono
- "Log in op je account" heading
- Microsoft login knop: blauw (#3B82F6), Microsoft logo, "Inloggen met Microsoft"
- Divider: "of" lijn
- Email + wachtwoord velden (glass style inputs: bg-white/5, border-white/10)
- "Inloggen" knop in goud
- "Nog geen lid? Word lid" link onderaan
- Subtiel: code rain of grid pattern achtergrond (match homepage hero)

### Registratie (`/lid-worden`)

- Fullscreen stappen, een per scherm
- Elke stap: grote heading in Big Shoulders Display, subtekst in muted
- Achtergrond: dezelfde dark bg als homepage
- Progress indicator bovenaan: stappen als numbered dots (01, 02, 03, 04) met lijn ertussen, actieve stap in goud

**Stap "Kies je class":**
- Dit is het visuele highlight van de flow
- Commissie kaarten in een asymmetrisch grid (NIET uniform cards)
- Elke kaart: surface kleur, border, commissie naam in bold, korte beschrijving in muted
- Hover: gouden border glow
- Geselecteerd: gouden border + subtiele gouden achtergrond tint
- Elke commissie heeft een uniek code-inspired icon of ASCII art element
- "Eigen idee" kaart heeft een tekstveld dat expand on click
- "Ik ben docent" als een aparte toggle onderaan, niet als kaart

### Dashboard (`/dashboard`)

**Layout:**
- Desktop: smalle sidebar links (surface kleur, 240px breed)
  - {SIT} logo bovenaan
  - Nav items: Dashboard, Ledenpas, Profiel, [Admin als bestuur]
  - Actieve item: gouden accent lijn links
  - User email + rol badge onderaan
- Mobile: bottom navigation bar (4 icons)
  - Actief icon in goud

**Dashboard home:**
- Heading: "Welkom terug" (of naam als beschikbaar)
- Kleine member card preview (niet volledige card, compact versie)
- Stats grid (2x2):
  - Punten (met rank badge)
  - Lid sinds [datum]
  - Commissie [naam]
  - Lidmaatschap [actief/verloopt over X dagen]
- Recente activiteit lijst (laatste scans)
  - Per item: groene dot, event naam, +X punten, datum
  - Lege state: "Nog geen activiteit. Kom naar een event!"

### Ledenpas (`/dashboard/ledenpas`)

- De VOLLEDIGE member card, groot, gecentreerd
- Card bevat QR code in plaats van de "?????" placeholder
- QR code: zwart op wit, in een afgerond wit vlak binnen de card
- Onder de card: "Download QR" en "Delen" knoppen
- Tilt effect op hover/gyroscoop (zoals de huidige sitlid app had)

### Admin (`/admin`)

- Functioneel design, minder decoratief dan het leden dashboard
- Donkere tabel met hover states (bg-white/5 on hover)
- Filters als pills/chips bovenaan de tabel (gouden border als actief)
- Stats kaarten bovenaan: totaal leden, actief, inkomsten, nieuwe deze maand
- Excel export knop: secundaire button stijl
- Member detail modal: surface achtergrond, alle info, actie knoppen onderaan

## Anti-patterns (doe dit NIET)

- Geen witte of lichte achtergronden ERGENS
- Geen rounded-full op kaarten of containers
- Geen gradient knoppen
- Geen colored shadows (geen glow effecten op containers)
- Geen emoji als icons
- Geen stock foto's of illustraties
- Geen centered-everything layout op desktop
- Geen identieke kaartjes in een grid (maak het visueel interessant)
- Geen Inter, Roboto, Arial fonts
- Geen opacity hover als enige hover effect
- Geen "Welcome to your dashboard" generieke energie
- Geen light mode. Het is ALTIJD dark.

## Checklist voor elke pagina

Voordat je een pagina als klaar beschouwt, check:
- [ ] Kleuren komen uit CSS custom properties, niet hardcoded
- [ ] Fonts matchen de homepage (Big Shoulders, JetBrains Mono, Geist)
- [ ] Surface elementen gebruiken dezelfde border/bg als homepage kaarten
- [ ] Knoppen volgen het primair/secundair/ghost systeem
- [ ] Mobile responsive (dashboard mobile-first, admin desktop-first)
- [ ] Geen enkel element ziet er "generiek" uit
- [ ] Het voelt als dezelfde site als de homepage
