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
src/components/BackgroundStreaks.tsx — animated diagonal color streaks (brand kit)
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

### Fase 2: Data Layer
- Notion als CMS voor events, bestuur data
- Database (PostgreSQL/Supabase) voor leden

### Fase 3: Functionaliteit
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