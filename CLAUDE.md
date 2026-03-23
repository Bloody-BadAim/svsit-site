# SIT Website

Website voor SIT (Studievereniging ICT), de studievereniging voor HBO-ICT aan de HvA.

## Project info

- **Owner**: Matin Khajehfard (voorzitter SIT)
- **Domein**: svsit.nl
- **Status**: Nieuwbouw, vervangt oude WordPress site

## Tech stack

- Next.js 14+ (App Router, TypeScript)
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
src/app/layout.tsx       — root layout, fonts, meta
src/app/page.tsx         — home page
src/app/globals.css      — CSS vars, tailwind config, textures
src/components/*.tsx     — page secties als losse componenten
src/lib/theme.ts         — kleur constants
```

## Naming conventions

- camelCase voor bestanden en folders
- Components: PascalCase
- Geen koppeltekens of underscores in tekst content

## Commands

```bash
npm run dev
npm run build
npm run lint
```