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
- Gehost op Vercel

## Design regels

- GEEN AI slop: geen uniform card grids, geen Inter/Roboto, geen purple gradients, geen centered-everything layouts
- Dark theme (#09090B achtergrond)
- Accenten: goud (#F59E0B), blauw (#3B82F6), rood (#EF4444)
- Alle kleuren via CSS custom properties in globals.css (wordt later vervangen door brand kit)
- Bold typografie, asymmetrische layouts, scroll animaties
- Code/developer aesthetic ({SIT} logo gebruikt curly braces)
- Fonts: JetBrains Mono (mono/logo), Satoshi of Clash Display (headings), Geist (body). GEEN Inter, Roboto, Arial.

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
npm run dev    # development server
npm run build  # production build
npm run lint   # linting
```

## Design prompt

Zie sitWebsiteClaudeCodePrompt.md in de project root voor het volledige design briefing document.
