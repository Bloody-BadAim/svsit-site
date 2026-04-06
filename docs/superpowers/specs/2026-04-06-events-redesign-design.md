# Events Redesign: Hybrid Featured + Compact List

**Datum:** 2026-04-06
**Status:** Goedgekeurd

## Samenvatting

Vervanging van de huidige Events component door een hybrid layout: volgende event groot uitgelicht met directe ticket CTA, daaronder een compacte event lijst met energy line aan de zijkant. Wow element: "Signal Pulse" — energy line tekent zichzelf, text scramble op featured titel, stagger-in op lijst items.

## Data source

Notion event database via bestaande `/api/events/public` route (net gefixed: `dataSources.query()` met correct data source ID). Properties beschikbaar: Name, Date (met optioneel time), Location, Status (Gepland/In voorbereiding/Afgerond/Geannuleerd), Type (SIT eigen/SVO gezamenlijk/Samenwerking/Extern). Tags worden afgeleid van Type.

## Layout structuur

### 1. Section header
- Monospace label `// EVENTS` met corner brackets (SIT stijl)
- Filter pills: ALLES (default), SOCIAL, TECH, EDUCATIE — filtert zowel featured als lijst
- Als actieve filter geen events heeft: "Geen events voor dit filter" melding

### 2. Featured card (volgende aankomende event)
- Groot, prominente card met categorie-kleur accent (border-left + subtle bg tint)
- Bovenaan: `● VOLGENDE EVENT` label in groen
- Event naam: groot, bold, met text scramble animatie bij scroll-in
- Datum, tijd, locatie op een rij (monospace)
- Tag pills (kleur per categorie)
- CTA button met ticket status:
  - `TICKETS OPEN →` (groen bg, #22C55E) — link naar aanmeldpagina/extern
  - `BINNENKORT` (goud border, #F59E0B) — niet klikbaar, info wanneer tickets opengaan
  - `GRATIS · AANMELDEN →` (groen bg) — directe aanmeld link
  - `UITVERKOCHT` (rood border, #EF4444, dimmed) — niet klikbaar
- Als er geen aankomend event is: placeholder card "Meer events worden binnenkort aangekondigd"

### 3. Energy line
- Verticale lijn links van de hele sectie (2px breed)
- Gradient van featured event kleur naar lijst kleuren
- Nodes (dots) bij elk event:
  - Featured: grotere dot (12px) met glow, solid
  - Lijst items: kleinere dots (8px), solid in categorie kleur
  - TBA: dashed border dot, geen fill
- Wow: line tekent zichzelf via CSS `clip-path: inset(100% 0 0 0)` → `inset(0)` getriggerd door GSAP ScrollTrigger

### 4. Compact event lijst
- Onder het featured card
- Label: `BINNENKORT` (monospace, dimmed)
- Per event een rij:
  - Categorie dot (kleur)
  - Datum (monospace, categorie kleur)
  - Event naam (bold, wit)
  - Type tag pill (rechts)
  - Subtekst: ticket status of "Gratis voor leden"
- Hover: subtle background tint in categorie kleur
- Klik: inline expand met beschrijving, exacte details, CTA, ICS download
- Afgeronde events: onderaan, dimmed (opacity 0.4), of verborgen achter "Toon afgeronde events" toggle

### 5. Responsive
- Desktop: energy line links, featured card breed, lijst items in full width rijen
- Tablet: zelfde layout, iets smaller
- Mobile: energy line verdwijnt, featured card stacked, lijst items compact (datum + naam + tag)

## Wow element: Signal Pulse

### Text scramble (featured titel)
- Bij scroll-in: titel toont random karakters die een voor een "decoderen" naar de echte letters
- Duur: ~600ms, van links naar rechts
- Charset: mix van ASCII en katakana (past bij SIT tech vibe)
- Implementatie: `requestAnimationFrame` loop, stopt na volledige decode
- ~20 regels JS, geen externe dependency

### Energy line draw
- CSS `clip-path` animatie getriggerd door GSAP ScrollTrigger `once: true`
- Duur: 800ms ease-out
- Bij elke node: korte CSS glow pulse (`@keyframes nodeGlow`, 400ms)
- GPU composited (clip-path + opacity), geen layout thrash

### Lijst stagger
- Framer Motion `staggerChildren: 0.06` op de lijst container
- Elk item: `opacity: 0, y: 12` → `opacity: 1, y: 0`
- Al bestaand patroon in de codebase

### Reduced motion
- `prefers-reduced-motion: reduce`: alle animaties uit, instant render
- Framer Motion `useReducedMotion()` hook (al in gebruik)

## Kleuren per categorie

| Type | Tags | Kleur | Hex |
|------|------|-------|-----|
| SIT eigen | SIT, SOCIAL | Goud | #F59E0B |
| SVO gezamenlijk | SVO, SOCIAL | Goud | #F59E0B |
| Samenwerking | COLLAB | Blauw | #3B82F6 |
| Extern | EXTERN | Grijs | #6B7280 |

Fallback: goud (#F59E0B)

## Notion property mapping

| Notion property | Type | Gebruik |
|----------------|------|---------|
| Name | title | Event naam |
| Date | date | Datum + optioneel tijd (als datetime) |
| Date.end | date | Einddatum (optioneel) |
| Location | rich_text | Locatie |
| Status | select | Gepland/In voorbereiding/Afgerond/Geannuleerd |
| Type | select | Categorie → tags + kleur |

Properties die NIET bestaan en NIET nodig zijn: Tags, Tijd, Beschrijving, Tonen op site. Eventueel later toevoegen in Notion als nodig.

## Bestanden

### Nieuw
- `src/components/Events.tsx` — **vervangt** huidige file volledig (geen aanvulling)

### Hergebruik
- `src/lib/notion.ts` — net gefixed, werkt met `dataSources.query()`
- `src/app/api/events/public/route.ts` — ongewijzigd, 60s ISR
- `src/app/globals.css` — voeg keyframes toe voor `nodeGlow`
- Framer Motion patterns uit bestaande components
- GSAP ScrollTrigger (al geinstalleerd)
- Lenis smooth scroll (al actief)

### Verwijderen
- `src/components/EventList.tsx` — wordt overbodig (functionaliteit in nieuwe Events.tsx)
- Fallback hardcoded events in Events.tsx — niet meer nodig als Notion werkt

## Performance

- Geen continue animaties (alles eenmalig bij scroll-in)
- CSS `clip-path` + `opacity` voor energy line (GPU composited)
- `will-change: clip-path` alleen tijdens animatie (verwijderen na afloop)
- Text scramble stopt na decode (geen ongoing rAF)
- Framer Motion `viewport={{ once: true }}` voor stagger
- Geen extra dependencies
- ISR caching op API route (60s)
