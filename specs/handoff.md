# Handoff — SIT Website — 2026-05-28 (sessie 9)

## Doel
SIT website post-merge polish: SEO, socials, sponsor showcase, gamification downscale

## Status
- Fase: Post-overhaul polish — alles afgerond + getest
- Gate: N/A — iteratieve verbeteringen op main

## Gewijzigde files (deze sessie)
- `src/components/SponsorShowcase.tsx` — nieuw, sponsor showcase homepage sectie
- `src/app/robots.ts` — nieuw, crawl instructies
- `src/app/sitemap.ts` — nieuw, 11 static + dynamic event routes
- `src/app/layout.tsx` — Organization JSON-LD, sameAs met alle socials
- `src/app/page.tsx` — homepage metadata + SponsorShowcase import
- `src/app/faq/page.tsx` — FAQPage JSON-LD (9 vragen)
- `src/app/faq/FaqContent.tsx` — contact vraag uitgebreid met alle kanalen
- `src/app/events/[id]/page.tsx` — Event JSON-LD + OG + twitter
- `src/app/events/page.tsx` — OG + twitter
- `src/app/introweek/page.tsx` — OG + twitter
- `src/app/over-ons/page.tsx` — twitter card
- `src/app/lid-worden/page.tsx` — volledige metadata
- `src/app/commissies/layout.tsx` — nieuw, metadata voor client page
- `src/app/projecten/layout.tsx` — nieuw, metadata voor client page
- `src/app/vacatures/layout.tsx` — nieuw, metadata voor client page
- `src/components/Footer.tsx` — TikTok, WhatsApp, Discord toegevoegd
- `src/components/Navbar.tsx` — mobile menu alle socials
- `src/components/auth/RegisterFlow.tsx` — "volg ons" sectie met 4 social buttons

## Wat werkt
- Alle publieke pagina's hebben metadata (title, description, OG, twitter)
- 3 JSON-LD schemas: Organization, FAQPage, Event
- robots.txt + sitemap.xml
- 6 social kanalen overal: Instagram, TikTok, WhatsApp, Discord, LinkedIn, Email
- Sponsor showcase (ChipSoft + Sogeti + CTA)
- Build passing, alles gepusht naar main

## Test resultaten (Playwright + curl)
- 8/8 publieke pagina's: correcte title, OG, twitter meta tags
- 2 pagina's verwacht 500 lokaal (/events, /leaderboard — Supabase niet beschikbaar)
- SponsorShowcase: ChipSoft (Sponsor) + Sogeti (Partner) + "Word partner" CTA aanwezig
- Footer: 6 social links met correcte URLs en aria-labels
- Navbar mobile: 5 social links (email, IG, TikTok, WA, Discord)
- RegisterFlow: 4 social buttons (IG, TikTok, WA, Discord)
- JSON-LD: Organization (alle pagina's) + FAQPage (9 vragen, /faq)
- robots.txt: /admin, /dashboard, /api, /login afgeschermd
- sitemap.xml: 11 static routes + dynamic events
- Console errors: 0 op alle pagina's behalve /projecten en /vacatures (verwacht API 500)

## Volgende stappen
1. Vercel deploy controleren (live check)
2. Google Search Console aanmelden + sitemap indienen
3. Event recaps vullen met echte content (DB kolommen bestaan)
4. Introweek content finaliseren (wacht op Tinka/Aloha details, deadline 30 mei)

## Key context
- Supabase ref: plgcqkbfvzwkqzkggmfh, geen staging
- Socials: IG @sv.sit, TikTok @sit_hva, WA chat.whatsapp.com/LCndNz4xGZW0tqXWkNabaL, Discord discord.gg/68QjRVRRUM
- Alle metadata gaten gedicht: 'use client' pages opgelost via layout.tsx wrapper
- SitEvent type: price_members (niet price)
- Sitemap: force-dynamic + try/catch voor Supabase (faalt bij static build)
- /projecten en /vacatures API 500 lokaal is verwacht (geen Supabase env vars in dev)
