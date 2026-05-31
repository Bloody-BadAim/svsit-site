# Handoff — SIT website (svsit.nl) — 2026-05-31

## Doel
Events-pagina: recaps (foto's + beschrijving) inline tonen + geen aanmeldform op events die geweest zijn.

## Status
- Fase: 4 Implement (post-launch, live op main)
- Taak: events-page recap inline + signup-guard (sessie 27d) — KLAAR, NIET gecommit
- Gate: launch APPROVED (svsit.nl live)

## Gewijzigde files (deze sessie, NIET gecommit)
- `src/app/events/page.tsx` — RecapCard herschreven: geen Link-wrapper, full description (whitespace-pre-line) + foto-grid (grid-cols-2 sm:3, clickable img target=_blank, lazy), title los klikbaar. space-y-3 -> space-y-4.
- `src/app/events/[id]/page.tsx` — `hideSignup` vlag (isCancelled || isPast: status==='completed' OF date<now). hideSignup -> geen TicketForm/extern. Geen recap_published -> status note ("Dit event is geweest"/"afgelast"). Recap published -> bestaande Terugblik sectie doet rest.

## Wat werkt
- tsc --noEmit clean
- Moederbord scroll-lock + Mats/Idil tekst + EduCo cross-highlight + socials (f5b97c1, gepusht)
- Recap photo upload: public bucket + admin API route + file-input UI (daecfbf, gepusht, browser-getest werkt)

## Wat niet werkte / geleerde lessen
- Geen .env lokaal (keys in Vercel) -> e2e upload alleen via browser testbaar

## Blokkades
- Geen

## Volgende stappen
1. NIET committen tot Matin "commit en push" zegt
2. Visueel verifieren: /events (recap-cards) + /events/[id] van completed event
3. Open TODOs: foto's Thijmen/Yusuf/Liam (initialen), HHR PDF na ALV, rotate Stripe rk_live key, NOTION_API_KEY weg uit Vercel

## Key context (voor nieuwe sessie)
- CAVEMAN MODE full actief (terse prose, normale code/commits)
- Commit/push ALLEEN op expliciet "commit en push"
- Recap-data: events tabel kolommen recap_description, recap_photos[], recap_published. Upload via /api/events/[id]/recap-photos (admin, service client, bucket 'recaps' public)
- Codebase strip diacritics in NL tekst (echt niet echt)
- Repo Bloody-BadAim/svsit-site, branch main. Supabase ref plgcqkbfvzwkqzkggmfh
- Terminal tokens: #F29E18 gold/#22C55E green/#3B82F6 blue/#18181B surface/#27272A border/#71717A muted/#A1A1AA text/#FAFAFA bright
