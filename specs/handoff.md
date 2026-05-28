# Handoff — SIT Website — 2026-05-28 (sessie 6)

## Doel
SIT website post-merge polish: gamification downscale, Events refactor, FAQ page, sponsor showcase

## Status
- Fase: 4 (Implement) — post-merge polish
- Taak: Sponsor showcase (homepage)
- Gate: N/A — post-overhaul improvements

## Gewijzigde files (sessie 5+6)
- 33 bestanden — gold kleur #F59E0B → #F29E18 (bulk fix)
- `src/components/Events.tsx` — 1064→346 LOC, refactored naar sub-components
- `src/components/events/` — types.ts, calendarHelpers.ts, AddToCalendarDropdown, DateStub, FeaturedCard, CompactItem
- `src/app/faq/page.tsx` + `FaqContent.tsx` — nieuwe FAQ pagina (9 vragen, accordion)
- `src/components/WhyJoin.tsx` — community-focused kopjes, €9,99
- `src/components/JoinCta.tsx` — rewrite, geen random card variants meer
- `src/components/dashboard/DashboardClient.tsx` — streak/coins verwijderd uit top bar
- `src/components/dashboard/DashboardNav.tsx` — CoinPill + Shop verwijderd
- `src/components/Navbar.tsx` — Leaderboard → FAQ
- `src/components/Footer.tsx` — Commissies + Leaderboard links

## Wat werkt
- Events refactor (7 sub-components, zelfde functionaliteit)
- FAQ pagina met brand kit styling
- Gamification downscale (dashboard, homepage, navbar)
- Gold kleur consistent #F29E18 overal

## Volgende stappen
1. Sponsor showcase component voor homepage
2. Event recaps (frontend, DB kolommen bestaan al)
3. Introweek landing page (31 aug - 4 sep, 728 eerstejaars)
4. Registratie flow versimpelen

## Key context
- Supabase ref: plgcqkbfvzwkqzkggmfh, geen staging
- ChipSoft = eerste sponsor (1.500/jaar, Sponsor tier, Charlotte de Vries)
- Sogeti = Partner start (workshops, stagemarkt)
- Sponsor tiers: Partner (750), Sponsor (1.500), Hoofdsponsor (2.500), Strategisch (op aanvraag)
- Gold kleur mismatch OPGELOST: alles nu #F29E18
