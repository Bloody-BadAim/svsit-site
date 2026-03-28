# SIT Website

Website voor SIT (Studievereniging ICT), de studievereniging voor HBO-ICT aan de HvA.

## Project info

- **Owner**: Matin Khajehfard (voorzitter SIT)
- **Domein**: svsit.nl
- **Status**: Nieuwbouw, vervangt oude WordPress site
- **Fase**: Homepage design perfectioneren → dan CMS + functionaliteit

## Tech stack

- Next.js 16 (App Router, TypeScript, React Compiler)
- Tailwind CSS
- GSAP + ScrollTrigger (scroll animaties)
- Lenis (smooth scrolling)
- Framer Motion (motion-primitives)
- Gehost op Vercel

## Over HBO-ICT aan de HvA

HBO-ICT is een eigen vierjarige bachelor aan de Hogeschool van Amsterdam. Het is NIET hetzelfde als CMD (Communication & Multimedia Design). CMD is een aparte opleiding. HBO-ICT valt onder FDMCI (Faculty of Digital Media and Creative Industries).

### Specialisaties binnen HBO-ICT:
- Software Engineering
- Cyber Security
- Game Development
- Business IT & Management
- Technische Informatica

Plus: Ad Software Development (tweejarig)

De studenten zijn dus een mix: van hardcore programmeurs tot IT managers tot game developers tot security specialists. Niet iedereen codeert. De site moet voor allemaal toegankelijk zijn.

## Doelgroepen (in volgorde van prioriteit)

1. **HBO-ICT studenten HvA** — alle profielen. Eerstejaars die nog niks weten tot derdejaars die alles kennen. Mix van technisch en minder technisch. Ze willen: events, gezelligheid, netwerk, CV vullen, en ja: feesten en borrels.
2. **Oude leden uit eerdere besturen** — moeten zien dat SIT terug is, sterker, met een nieuw gezicht. Bestuur XI is serieus.
3. **De opleiding en HvA** — Tinka (opleidingscoordinator), Jorien (opleidingsmanager, via Michel), docenten. Ze checken of SIT een betrouwbare samenwerkingspartner is.
4. **Alle studieverenigingen van de HvA** — niet alleen FDMCI maar HvA breed. Ze vergelijken sites. SIT moet er bovenuit steken.
5. **Potentiele sponsors en bedrijven** — later relevant, maar de site moet nu al professioneel ogen.

## De balans: Tech + Fun

SIT is NIET alleen voor nerds. Het is voor alle HBO-ICT studenten. De developer/code aesthetic is goed voor sfeer en identiteit, maar:
- Code elementen zijn DECORATIE, niet structuur
- Events, "word lid", en kerninfo moeten voor iedereen leesbaar zijn
- Een eerstejaars Business IT student die nog nooit een terminal heeft gezien moet de site net zo makkelijk begrijpen als een derdejaars Software Engineer
- De fun kant (borrels, kroegentochten, gezelligheid) moet net zo prominent zijn als de career/skills kant

## Design regels

- GEEN AI slop: geen uniform card grids, geen Inter/Roboto, geen purple gradients
- Dark theme (#09090B achtergrond)
- Accenten: goud (#F59E0B), blauw (#3B82F6), rood (#EF4444)
- Alle kleuren via CSS custom properties in globals.css
- Bold typografie, asymmetrische layouts, scroll animaties
- Code/developer aesthetic als sfeer, niet als barriere
- Fonts: JetBrains Mono (mono/logo), Satoshi of Clash Display (headings), Geist (body)
- GEEN Inter, Roboto, Arial

## Structuur

```
src/app/layout.tsx              — root layout, fonts, meta
src/app/page.tsx                — home page (Hero, About, WhyJoin, Events, SocialMarquee, JoinCta)
src/app/over-ons/page.tsx       — bestuur pagina (Board component)
src/app/globals.css             — CSS vars, tailwind config, textures
src/components/*.tsx            — page secties als losse componenten
src/components/SitLogo.tsx      — officieel SIT logo SVG (van Figma brand kit)
src/components/HeroStreaks.tsx    — 4 diagonale brand-color streaks (forwardRef)
src/components/HeroCodeBlock.tsx — decoratief sit.config.ts terminal code block
src/components/HeroScrollIndicator.tsx — $ scroll down indicator
src/components/HeroBackground.tsx — epic animated hero background (5 depth layers, CSS-only)
src/components/BackgroundStreaks.tsx — animated diagonal color streaks (brand kit)
src/components/Events.tsx       — events orchestrator (8 events inline, header + timeline + sticky detail sidebar)
src/components/EventTimeline.tsx — glitch timeline met gebogen SVG energie lijn, alternerende blokken, expand/collapse
src/components/EventList.tsx    — (legacy) event list met status indicators, hover effects, keyboard nav
src/components/EventDetail.tsx  — detail panel met glitch/scan transitions, typewriter, 3D tilt (sticky sidebar op desktop)
src/components/EventTicker.tsx  — dual-track CSS ticker (vervangt SocialMarquee)
src/components/KonamiGame.tsx   — canvas easter egg mini-game (Konami Code activated)
src/hooks/useKonamiCode.ts      — Konami Code sequence detection hook
src/lib/theme.ts                — kleur constants
```

## Naming conventions

- camelCase voor bestanden en folders
- Components: PascalCase
- Geen koppeltekens of underscores in tekst content

## Roadmap

### Fase 1: Homepage Design (DONE)
- [x] Board sectie verplaatst naar /over-ons pagina
- [x] Spacing & white space gefixt (consistent verticaal ritme)
- [x] Footer verbeterd (compacter, betere hierarchie, 12-col grid)
- [x] Mobile hamburger menu toegevoegd (full-screen overlay, stagger animatie)
- [x] Section transitions verbeterd (gradient dividers)

### Fase 1.5: Brand Kit Integration (DONE)
- [x] Officieel SIT logo SVG geïmplementeerd (SitLogo component met braces + Amsterdam × marks)
- [x] Footer redesign: social media prominenter (VOLG ONS sectie met social cards), random dev jokes, betere structuur
- [x] Animated diagonal color streaks achtergrond (BackgroundStreaks component, scroll parallax via GSAP)
- [x] Cross-page routing gefixt (/#about, /#events, /#join werken nu van elke pagina)
- [x] Footer GSAP visibility fix voor grote schermen (alreadyVisible check)
- [x] Figma Brand Kit gekoppeld (fileKey: tIr6cbTBLa26HIsLkW2vyG)
- [x] Officiële brand kleuren: Goud #F29E18, Blauw #3B82F6, Rood #EF4444, Groen #22C55E

### Fase 1.7: Creative Polish & UI/UX Audit (DONE)
- [x] BackgroundStreaks creatief herontworpen: flowing SVG bezier curves met glow, forking streams, floating orbs, scroll parallax (4 energie-stromen in brand kleuren, 10 zwevende orbs, ambient aurora glows)
- [x] Amsterdam × marks in Hero gekleurd: rood, groen, blauw — matching officieel brand identity
- [x] Hero CTA links gefixt: #join → /#join, #events → /#events (werkt nu cross-page)
- [x] Focus-visible accessibility: gold outline (2px) op alle interactive elementen bij keyboard navigatie
- [x] Energy flow CSS animaties: stroke-dashoffset flowing effect op SVG curves + glow pulse
- [x] Prefers-reduced-motion: alle nieuwe animaties respecteren motion preferences

### Fase 1.8: Visual Impact & Social Prominence (DONE)
- [x] Footer gap gefixt: overflow-hidden op footer voorkomt dat decoratieve h-[150%] streaks 149px extra scroll-ruimte creëren
- [x] SocialMarquee component: dual-track infinite scrolling ticker tussen Events en JoinCta, met @svsit prominent in goud, event types (BORRELS, HACKATHONS, GAME NIGHTS, TECH TALKS, KROEGENTOCHTEN, CTF CHALLENGES), brand × separators, GSAP-powered met scroll velocity acceleratie
- [x] 3D tilt effect op event cards: mouse-following perspective tilt (max 6°) met cursor spotlight glow op hover, premium interactief gevoel
- [x] Tailwind v4 workaround: inline styles voor padding/margin waar TW4 utility classes niet compileren

### Fase 1.9: Epic Cinematic Hero (DONE)
- [x] Hero volledig herschreven: 200vh pinned scroll sectie met 3 fases (Arrival, Atmosphere, Scroll Exit)
- [x] GSAP entrance timeline: 4 lichtstralen schieten over scherm, gold flash, {SIT} logo assembleert (braces schuiven in), × marks droppen met elastic bounce, subtitle typt character-by-character, tagline word-by-word fade-in, CTAs slide up
- [x] 6 depth layers: gradient mesh (D0), glow blobs (D1), 4 diagonale streaks (D2), {SIT} logo (D3), content (D4), code block (D5)
- [x] Idle animations: streak breathing (8s cycle), code line highlight cycle (3s), tagline glow cycle, logo breathing scale
- [x] Scroll exit: logo scale 1→1.8x + fade, streaks accelereren off-screen, code block schuift rechts weg, content fades
- [x] HeroStreaks component: 4 brand-color diagonale streaks met forwardRef/useImperativeHandle
- [x] HeroCodeBlock component: decoratief sit.config.ts terminal met syntax highlighting
- [x] HeroScrollIndicator component: terminal-style $ scroll down met blinkende pipe en bouncende ▼
- [x] Geen custom cursor, geen particles, geen dots — clean en bold
- [x] Mobile: geen pinned scroll, geen code block, snellere entrance (0.6x)
- [x] Prefers-reduced-motion: toont eindstaat direct, skipt alle animaties

### Fase 2.0: Gaming Events UI (DONE)
- [x] Events sectie volledig herschreven als arcade EVENT SELECT screen
- [x] Twee-kolom layout: EventList (links) + EventDetail (rechts) op desktop, accordion op mobile
- [x] 8 events inline: ALV, Meet de OC, Get Together, Kroegentocht, Stagemarkt, Hackathon, Tech+Borrel, CERN
- [x] EventList: status indicators (completed=gevuld, upcoming=pulsend, coming_soon=dashed), hover glitch flicker, background slide-in, horizontal blip, keyboard nav (arrow/enter/home/end)
- [x] EventDetail: transition state machine (glitchOut→black→scanIn→typewriter), terminal code block met syntax highlighting, 3D tilt effect (max 4°), ambient scanline, tags, CTA per status
- [x] EventTicker: dual-track pure CSS ticker (vervangt SocialMarquee), @svsit Instagram link, event types, brand × separators
- [x] KonamiGame: canvas easter egg mini-game (15s, WASD/arrows, vallende objecten, score), desktop only
- [x] useKonamiCode hook: sequence detection, skip op touch devices
- [x] Big Shoulders Display font via Google Fonts link tags (niet next/font — niet in registry)
- [x] 8 CSS keyframe animaties: glitchFlicker, glitchOut, scanReveal, ambientScan, statusPulse, hBlip, tickerScroll, tickerScrollReverse
- [x] GSAP ScrollTrigger entrance: header stagger, list slide-in, detail fade+scale
- [x] Prefers-reduced-motion respecteert alle animaties
- [x] Contrast boost: ticker tag opacity 0.3→0.6, separator 0.5→0.7, responsive edge fades

### Fase 2.1: Glitch Energy Timeline (DONE)
- [x] EventTimeline component: vervangt twee-kolom EventList + EventDetail layout
- [x] Gebogen SVG energie lijn (Catmull-Rom → Cubic Bezier) door alle event nodes
- [x] 4-layer glow: deep ambient (blur 20px), mid glow (blur 6px), core dashed line (animated flow), bright inner line
- [x] Gradient kleurtransities langs de lijn: goud → blauw → rood → groen (per event)
- [x] Alternerende links/rechts blokken met gevarieerde horizontale offsets en verticale spacing
- [x] Branch lines (horizontale connectors) van nodes naar blokken
- [x] Compact blocks (geen expand/collapse): fixed height voorkomt wobble bij selectie
- [x] Glitch hover: RGB split flash (80ms), translateY lift, box-shadow
- [x] Status nodes: completed (filled), upcoming (pulsing border), coming_soon (dashed, 50% opacity)
- [x] Active node: larger dot (18px), outer pulse ring, intensified glow
- [x] Desktop: 3-kolom grid (1fr 80px 1fr), nodes alterneren links/rechts in center kolom
- [x] Mobile: single column, nodes links, blocks rechts
- [x] GSAP ScrollTrigger: staggered block entrance + SVG line draw-on animatie
- [x] ResizeObserver: SVG path herberekent bij layout changes
- [x] Ambient scanline op actief block, status badges (✓ DONE, ● NEXT, ○ TBA)
- [x] CSS mask-image fade op SVG lijn endpoints (geen abrupte start/einde meer)

### Fase 2.2: Sticky Detail Sidebar (DONE)
- [x] Events.tsx herschreven: twee-kolom layout op desktop (1fr 380px grid)
- [x] EventDetail verplaatst van onder timeline naar sticky sidebar rechts (position: sticky, top: 5rem)
- [x] Detail panel direct zichtbaar bij klikken op timeline block — geen verborgen panel meer
- [x] "LINKED" signal indicator: pulsende dot + gradient lijn + label bovenaan detail panel
- [x] Glowing left accent border op detail panel (event kleur, blur glow)
- [x] Console header behouden: `> event.loadDetails("eventId")` met event kleur
- [x] Glitch transitions werken in sidebar: glitchOut → black → scanIn → typewriter
- [x] GSAP entrance: desktop slide-in van rechts (x: 30→0), mobile scale (0.97→1)
- [x] Responsive breakpoints: ≥1100px twee-kolom, 768-1099px stacked alternating, <768px mobile single column
- [x] Mobile/tablet: detail panel onder timeline (stacked layout)

### Fase 3: Data Layer
- Notion als CMS voor events, bestuur data
- Database (PostgreSQL/Supabase) voor leden

### Fase 4: Functionaliteit
- Lid worden flow op dezelfde site
- Leden dashboard
- Alles mobile-first

## Dev server

```bash
npm --prefix sit-website run dev    # port 3000
```

## Commands

```bash
npm run dev
npm run build
npm run lint
```