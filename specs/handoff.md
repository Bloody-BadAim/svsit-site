# Handoff — SIT Website (svsit-site) — 2026-06-04

## Doel
SIT website, live op svsit.nl. Homepage partner-sectie premium maken (sponsoren betalen ervoor) + recap-foto showcase toevoegen bij events.

## Status
- Fase 9 Launch, productie. HEAD `886c307` = origin/main (bestuursfoto's Thijmen/Yusuf gepusht, Yusuf vz Community).
- Homepage-werk deze sessie = NOG NIET GECOMMIT (working tree dirty). Build groen (60/60), prod-build (`next start`) visueel geverifieerd via Playwright. Wacht op go voor commit + deploy.

## Gewijzigde files (deze sessie, nog niet gecommit)
- `src/components/SponsorShowcase.tsx` + `sponsorShowcase.css` — NIEUW concept "Sponsor-bus": chips op PCB-databus, auto-scroll marquee, tier-sizing + glow, stromende current. Nummer 06.
- `src/components/EventRecap.tsx` + `eventRecap.css` — NIEUW: recap filmstrip-marquee (sectie 04), trekt foto's uit nieuwe API, elke frame linkt naar /events#terugblik.
- `src/app/api/events/recaps/route.ts` — NIEUW: platte recap-foto feed (status=completed + recap_published, limit 8 events / 16 foto's, envelope {data,error,meta}).
- `src/app/events/page.tsx` — `id="terugblik"` + `scroll-mt-28` op recap-blok (deep-link target).
- `src/app/page.tsx` — `<EventRecap />` gewired na `<Events />` + divider.
- `src/components/Testimonials.tsx` 04→05, `src/components/JoinCta.tsx` 06→07 (spine hernummerd).

## Wat werkt (prod-build geverifieerd: next build + next start + Playwright)
- Sponsor-bus desktop: marquee scrollt (translateX bewogen -284→-408px), alle 9 sponsors cyclen, niks permanent geclipt. Reduced-motion = start-aligned (HBO-ICT/CERN strategisch eerst). Mobiel = swipe-marquee. Premium PCB-look, on-brand met /partners.
- Recap filmstrip: empty-state correct (lokaal geen Supabase). Sectie rendert ALTIJD zodat spine 01-07 intact blijft.
- Spine uniek: 01 About,02 WhyJoin,03 Events,04 Recap,05 Testimonials,06 Sponsors,07 JoinCta. HboIct+FemIt = numberless interstitials (`>`-eyebrows).

## Wat niet werkte / lessen
- `next dev` hot-reloadde agent-CSS-edits NIET → stale screenshots (oude statische bus). Oplossing: `next build` + `next start` + Playwright tegen prod-build (dev-server niet vertrouwen voor agent-edits).
- recaps API type-error: `event.category` is `string|null`, kan niet als index → normaliseer naar `''`.
- Lokaal geen Supabase-env → recap-API leeg → empty-state. Echte foto's + #terugblik pas op prod.

## Blokkades
- Geen code-blokkade. Recap toont pas echte foto's als events met `recap_published=true` + `recap_photos` in DB staan.

## Volgende stappen
1. Go/no-go: `git add` homepage-files + commit + push.
2. DEPLOY: per oude conventie `vercel --prod --yes` vanuit repo root (NIET zeker of git-push auto-deployt). LET OP: ook de eerdere `886c307` moederbord-push is misschien nog niet live zonder vercel deploy — checken.
3. Na deploy: `/events#terugblik` scroll + recap-filmstrip met echte foto's op prod checken.

## Key context (nieuwe sessie)
- Homepage heeft GENUMMERDE spine-conventie (01-07 via `SectionLabel`); HboIctSection + FemItSection zijn BEWUST numberless interstitials. Respecteer bij nieuwe secties.
- `SponsorShowcase` zet nummer INLINE (niet via `SectionLabel`).
- Recap-data uit `/api/events/recaps` (flatten van `recap_photos`), niet static.
- Schrijfstijl: geen streepjes/em-dashes/`_` in prose, weinig komma's, studententoon.
