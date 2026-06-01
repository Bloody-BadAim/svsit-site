# Handoff — SIT Website (svsit-site) — 2026-06-01

## Doel
SIT studievereniging website. Events, members, sponsors, ticketing. Live op svsit.nl.

## Status
- Fase: 9 Launch (live, onderhoud/fixes)
- Taak: Gratis-badge fix + SITE_CONFIG-refactor (beide klaar, gedeployed)
- Gate: merged to main 26 mei, in productie

## Gewijzigde files (deze sessie)
- `src/lib/constants.ts` — nieuw `SITE_CONFIG` (email/socials/address/stats/membership/introweek)
- `src/app/events/page.tsx` + `events/[id]/page.tsx` — Gratis-badge weg (PriceBadge return null)
- 26 files totaal refereren SITE_CONFIG i.p.v. hardcoded contact/socials/prijs/stats/datum

## Wat werkt
- Build clean (npm run build), tsc clean
- Commit `0d8fae5` (Gratis-badge) + `566c4ee` (SITE_CONFIG) gepusht main, beide live via vercel --prod
- 0 hardcoded urls/invite-codes/emails over (git grep geverifieerd)
- FAQ-bug 8→7 commissies gefixt (COMMISSIES.length)

## Wat niet werkte / geleerde lessen
- Bulk-refactor gedelegeerd aan general-purpose agent: deed alleen wat in expliciete lijst stond. Miste invite-codes RegisterFlow + email-templates (member/ticket/weeklyDigest) + EmailComposer — zelf afgemaakt. Les: email-templates apart benoemen bij contact-refactors.
- Countdown homepage was 10:00, introweek-pagina 13:00 (drift). Geünificeerd naar 13:00 via SITE_CONFIG.introweek.startIso.

## Blokkades
- Geen

## Volgende stappen
1. P3: FAQ-content nog 2x (`faq/page.tsx` JSON-LD + `FaqContent.tsx` UI) — contact/prijs nu via config, maar tekst-arrays dupliceren. Overweeg 1 source.
2. Lidprijs €9,99 in SITE_CONFIG moet matchen met Stripe-prijs (los systeem) bij wijziging.
3. Foto's Thijmen/Yusuf/Liam (photo:null in moederbord.ts)
4. NOTION_API_KEY weg uit Vercel-dashboard (niet in code, puur dashboard-actie)

## Key context (voor nieuwe sessie)
- `SITE_CONFIG` in `src/lib/constants.ts` = single source contact/socials/stats/prijs/introweek-datum. Importeer overal, niet hardcoden. Veilig in server+client+email-templates (constants importeert alleen types).
- Display-handles (`@sv.sit` marketing-copy, Navbar-tekst, Footer ariaLabel) bewust gelaten — roteren nooit.
- Events Gratis-badge = data-gedreven (events.is_paid via Supabase). Admin EventFormModal:305 kiest ticket-mode per event.
- Codebase strip diacritics (écht -> echt); anti-slop: geen em/en dashes in UI.
- Vercel deploy: `vercel --prod --yes` vanuit repo root, aliased naar svsit.nl.
