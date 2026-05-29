# Handoff — SIT Website — 2026-05-29

## Doel
SIT website performance, category alignment, external ticket support, homepage cleanup

## Status
- Fase: 4 (Implement) — categories aligned, external tickets done, build passing
- Gate: Build passing, NOT YET committed/pushed
- Last commit: `0badeb9` (sessie 14)

## Gewijzigde files (sessie 15)
- `src/components/admin/EventFormModal.tsx` — 3-keuze ticket mode (gratis/eigen/extern), category dropdown career/game
- `src/components/admin/EventDetailPanel.tsx` — category type + labels updated, external_ticket_url in DbEvent
- `src/app/admin/events/page.tsx` — category type + labels updated, external_ticket_url in DbEvent
- `src/components/admin/ChallengeManager.tsx` — CATEGORIES array career/game
- `src/app/events/page.tsx` — CATEGORY_CONFIG career/game
- `src/app/events/[id]/page.tsx` — CATEGORY_CONFIG career/game + conditional external ticket link
- `src/components/dashboard/tabs/QuestsTab.tsx` — CATEGORY_STYLES + XP_SOURCES_TABLE career/game
- `src/components/dashboard/tabs/OverviewTab.tsx` — CATEGORY_COLORS career/game
- `src/components/MemberCard.tsx` — dynamicStats interface + stats mapping career/game
- `src/components/JoinCta.tsx` — default dynamicStats career/game
- `src/lib/rewards.ts` — MemberStats interface + calculateStats + allCategories badge check
- `src/app/api/events/route.ts` — external_ticket_url in POST insert/select + GET select
- `src/app/api/events/[id]/route.ts` — external_ticket_url in PATCH allowedFields + all selects
- `src/app/api/events/[id]/checkin/route.ts` — category cast updated
- `src/types/database.ts` — StatCategory was already career/game (prev session)

## Wat werkt
- Categories aligned across entire codebase (learn/impact → career/game), 0 remaining references
- External ticket URL: admin form, API CRUD, event detail page conditional render
- DB migration complete (constraints + column) from previous session
- Build passing, TypeScript clean

## Wat niet werkte / geleerde lessen
- Local DbEvent types in admin pages didn't have external_ticket_url — build failed until added
- Multiple files had duplicate type definitions for event categories (not using shared SitEvent type)

## Blokkades
- Sentry: user moet `npx @sentry/wizard@latest -i nextjs` zelf runnen
- Lighthouse: handmatig via pagespeed.web.dev (WSL2 blokkade)

## Volgende stappen
1. Commit + push huidige wijzigingen
2. Sentry setup (auth token: sntryu_2b9e5e61fe...)
3. Lidmaatschap opzeggen: cancel knop op dashboard profiel pagina
4. Lighthouse draaien via pagespeed.web.dev — target Performance >85
5. Homepage visuele redesign via Claude Design
6. Recap foto's publiceren via admin panel
7. Board foto's: idil.jpeg (184KB) → WebP
8. NOTION_API_KEY verwijderen uit Vercel env vars

## Key context
- Supabase ref: plgcqkbfvzwkqzkggmfh
- DB categories: code, social, career, game (CHECK constraints on events, xp_transactions, challenges)
- Ticket mode in EventFormModal: 'own' | 'external' | 'none' — maps to is_paid + external_ticket_url
- Vercel project: bloody-badaims-projects/svsit-site
- Sentry token provided by user but wizard not yet run
- Homepage flow: Hero → About → WhyJoin → Events → EventTicker (sponsors) → JoinCta → Footer
