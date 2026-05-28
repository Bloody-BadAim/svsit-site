# Handoff — SIT Website — 2026-05-28 (sessie 9, einde)

## Doel
Bugfixes op live site (svsit.nl) — gebruiker ziet visuele bugs na Vercel deploy

## Status
- Fase: Post-overhaul polish — live check gedaan, bugs gevonden door gebruiker
- Gate: N/A — iteratieve verbeteringen op main

## Wat er deze sessie gedaan is
- SponsorShowcase component (homepage, ChipSoft + Sogeti + CTA)
- SEO compleet: robots.txt, sitemap.xml, metadata alle pagina's, 3x JSON-LD
- 6 social kanalen toegevoegd aan Footer, Navbar mobile, RegisterFlow, FAQ
- Instagram handle fix: @svsit -> @sv.sit in 5 bestanden
- DB audit via Supabase MCP: 0 orphans, 0 invalid refs
- 5 missing indexes toegevoegd (events.status/date, tickets.member_id, scans.event_id, challenge_submissions.status)
- 2 test events opgeruimd (1111-11-11 + 2222-04-22)
- Migratie file: supabase/migrations/20260528-01-add-missing-indexes.sql

## Vercel live check resultaten
- Alle 10 publieke pagina's 200 OK
- Homepage: OG image werkt, Organization JSON-LD, SponsorShowcase aanwezig
- Events: 7 upcoming events laden, OG tags correct
- FAQ: Organization + FAQPage (9 vragen) JSON-LD
- Event detail: Event JSON-LD met naam + startDate
- robots.txt + sitemap.xml correct
- **Gebruiker ziet visuele bugs** — details volgen in volgende sessie

## Gewijzigde files (deze sessie)
- `src/components/SponsorShowcase.tsx` — nieuw
- `src/app/robots.ts` — nieuw
- `src/app/sitemap.ts` — nieuw
- `src/app/layout.tsx` — Organization JSON-LD
- `src/app/page.tsx` — homepage metadata + SponsorShowcase
- `src/app/faq/page.tsx` — FAQPage JSON-LD
- `src/app/faq/FaqContent.tsx` — contact vraag alle kanalen
- `src/app/events/[id]/page.tsx` — Event JSON-LD + OG
- `src/app/events/page.tsx` — OG + twitter + @sv.sit fix
- `src/app/introweek/page.tsx` — OG + twitter
- `src/app/over-ons/page.tsx` — twitter card
- `src/app/lid-worden/page.tsx` — volledige metadata
- `src/app/commissies/layout.tsx` — nieuw, metadata wrapper
- `src/app/projecten/layout.tsx` — nieuw, metadata wrapper
- `src/app/vacatures/layout.tsx` — nieuw, metadata wrapper
- `src/components/Footer.tsx` — 3 socials toegevoegd
- `src/components/Navbar.tsx` — mobile menu socials
- `src/components/auth/RegisterFlow.tsx` — social buttons
- `src/components/EventTicker.tsx` — @sv.sit fix
- `src/components/Events.tsx` — @sv.sit fix
- `src/app/events/[id]/TicketForm.tsx` — @sv.sit fix
- `src/emails/memberEmail.tsx` — @sv.sit fix + URL
- `supabase/migrations/20260528-01-add-missing-indexes.sql` — nieuw

## Volgende stappen
1. **BUGS FIXEN** — gebruiker ziet visuele problemen op live site, details in volgende sessie
2. Google Search Console aanmelden + sitemap indienen
3. Event recaps vullen met echte content
4. Introweek content finaliseren (deadline 30 mei)

## Key context
- Supabase ref: plgcqkbfvzwkqzkggmfh, geen staging
- Socials: IG @sv.sit, TikTok @sit_hva, WA chat.whatsapp.com/LCndNz4xGZW0tqXWkNabaL, Discord discord.gg/68QjRVRRUM
- 'use client' metadata: layout.tsx wrapper pattern
- SitEvent type: price_members (niet price)
- Sitemap: force-dynamic + try/catch voor Supabase
- DB: 20 tabellen, 94 members, 38 events (na cleanup)
- 5 nieuwe indexes op productie (28 mei)
- Git: 09b4541 op main, alle commits gepusht

## Git log (deze sessie)
```
09b4541 chore: add 5 missing indexes + remove test events from production
8456ab4 fix: correct Instagram handle @svsit -> @sv.sit across all references
fd5680b docs: update handoff with session 9 status
1c8b3b9 feat: add all social channels + fix remaining metadata gaps
3b991c0 feat: SEO — robots.txt, sitemap, meta tags, JSON-LD structured data
7c7476e feat: add sponsor showcase section to homepage
```
