# Handoff — SIT Website — 2026-05-28 (sessie 9)

## Doel
SIT website post-merge polish: SEO, socials, sponsor showcase, gamification downscale

## Status
- Fase: Post-overhaul polish — alles afgerond
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
