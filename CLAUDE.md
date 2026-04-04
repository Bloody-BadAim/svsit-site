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
src/app/layout.tsx                — root layout, fonts, meta
src/app/page.tsx                  — home page (Hero, About, WhyJoin, Events, EventTicker, JoinCta)
src/app/over-ons/page.tsx         — bestuur pagina (Board component)
src/app/organisatie/page.tsx      — organisatie/commissies pagina
src/app/globals.css               — CSS vars, tailwind config, textures
src/app/login/page.tsx            — credentials + Microsoft login
src/app/lid-worden/page.tsx       — registratie flow
src/app/dashboard/               — leden dashboard (layout + paginas)
src/app/dashboard/ledenpas/       — digitale ledenpas met QR
src/app/dashboard/profiel/        — profiel instellingen
src/app/dashboard/rewards/        — rewards/badges/quests pagina
src/app/admin/                    — admin dashboard (overview, leden, scanner, events, challenges)
src/components/SitLogo.tsx        — officieel SIT logo SVG (van Figma brand kit)
src/components/BackgroundStreaks.tsx — animated diagonal color streaks (brand kit)
src/components/Events.tsx         — events orchestrator (sticky detail sidebar)
src/components/EventTicker.tsx    — dual-track CSS ticker
src/components/MemberCard.tsx     — gaming-style member card (CLASS + GUILD)
src/components/KonamiGame.tsx     — canvas easter egg mini-game
src/components/admin/             — admin UI components (MemberTable, MemberDetailModal)
src/components/dashboard/         — dashboard UI components
src/components/dashboard/rewards/ — BadgeCollection, ProgressionTracker, WeeklyQuests, SkillTracks, MerchClaims
src/components/badges/            — BadgeIcon + 15 SVG badge icons
src/hooks/useKonamiCode.ts        — Konami Code sequence detection hook
src/lib/auth.ts                   — NextAuth v5 config (credentials + Microsoft Entra ID)
src/lib/constants.ts              — rollen, commissies, ranks, badges, stat categories
src/lib/rewards.ts                — XP/stats berekening
src/lib/stripe.ts                 — Stripe client
src/lib/supabase.ts               — Supabase service client
src/types/database.ts             — alle TypeScript types
src/stores/                       — Zustand stores (admin, auth, scanner)
```

## Naming conventions

- camelCase voor bestanden en folders
- Components: PascalCase
- Geen koppeltekens of underscores in tekst content

## Roadmap

### Fase 1 t/m 2.2: Homepage Design (DONE)
Homepage compleet met Hero, About, WhyJoin, Events (sticky sidebar), EventTicker, JoinCta, Footer.
Brand kit geintegreerd, GSAP animaties, responsive, prefers-reduced-motion.

### Fase 3: Leden Portaal (DONE)
- [x] Auth: NextAuth v5 (credentials + Microsoft Entra ID)
- [x] Registratie + Stripe betaling (checkout + webhook)
- [x] Dashboard: homepage, ledenpas (QR + skins), profiel, rewards
- [x] Admin: ledenlijst, scanner, events, challenges
- [x] Reward systeem: badges, weekly quests, skill tracks, merch claims
- [x] Password reset flow (forgot + reset + SMTP via Resend)
- [x] Role systeem: member, contributor, mentor, bestuur
- [x] Commissie systeem: many-to-many via join table, admin multi-select
- [x] Admin toggle, rol wijzigen, commissie toewijzen via admin dashboard

### Fase 4: TODO
- [ ] Migratie: `supabase/admin-and-commissies.sql` uitvoeren in Supabase
- [ ] Events uit database ipv inline
- [ ] Ticket + email + check-in scanner systeem
- [ ] Organisatie pagina data uit database

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