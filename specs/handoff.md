# Handoff — SIT website (svsit.nl) — 2026-05-31

## Doel
Post-launch onderhoud. Events recaps zichtbaar maken + Moederbord scroll-bug. Live op main, Vercel auto-deploy.

## Status
- Fase: 4 Implement (post-launch, live op main)
- Taak: events-recap inline + signup-guard + Moederbord wheel-scroll — KLAAR, gecommit+gepusht
- Gate: launch APPROVED (svsit.nl live)

## Gewijzigde files (deze sessie) — COMMIT `afe08c6` gepusht
- `src/app/events/page.tsx` — RecapCard herschreven: full description + foto-grid inline (geen doorklik)
- `src/app/events/[id]/page.tsx` — hideSignup vlag (cancelled/completed/verlopen) verbergt TicketForm + status-note
- `src/components/Moederbord.tsx` — data-lenis-prevent op .sheet-body (wheel-scroll in module)
- `specs/handoff.md` — deze

## Wat werkt
- Events: recaps tonen foto's+beschrijving inline op /events; geweest events tonen geen aanmeldform
- Moederbord module wheel-scroll: Playwright-getest (scrollTop 0->142, background frozen)
- Recap photo upload (sessie 27, daecfbf): public bucket + admin API + UI, browser-getest

## Wat niet werkte / geleerde lessen
- Module wheel-scroll — Lenis (SmoothScroll.tsx, smoothWheel:true) kaapt alle wheel events globaal — fix: data-lenis-prevent op scroll-container. Symptoom: scrollbar-drag werkt, wiel niet
- Dev server opruimen: turbopack respawnt, kill -9 npm-wrapper nodig

## Blokkades
- Geen

## Volgende stappen
1. Visueel verifieren op live (svsit.nl) na deploy: /events recaps + completed /events/[id] + Moederbord scroll
2. Foto's Thijmen/Yusuf/Liam (nu initialen in moederbord.ts, photo:null)
3. HHR PDF na ALV-bekrachtiging -> public/documenten + status "beschikbaar"
4. SECURITY: rotate Stripe rk_live key (~/.config/stripe/live-restricted.key) -- OPTIONEEL, lage urgentie (zie scan hieronder)
5. NOTION_API_KEY weg uit Vercel env

## Security-scan (2026-05-31)
- Repo SCHOON: geen secrets in tracked files (service_role in SQL = RLS-docs, geen key), geen .env ooit gecommit, .env* gitignored, alle 18 secrets via process.env, niks hardcoded
- Gelekte file ~/.config/stripe/live-restricted.key: rk_live_ restricted key, perms 600 (owner-only), NIET in repo/history. Plaintext op schijf maar correct afgeschermd. Roteren = optioneel (restricted scope, lage urgentie), kan alleen via Stripe-dashboard
- Verdict: codebase-kant geen actie nodig

## Key context (voor nieuwe sessie)
- CAVEMAN MODE full actief (terse prose, normale code/commits)
- Commit/push ALLEEN op expliciet "commit en push"
- Lenis-les: modals/drawers met eigen overflow in smooth-scroll pagina vereisen data-lenis-prevent
- Recap-data: events kolommen recap_description, recap_photos[], recap_published. Upload via /api/events/[id]/recap-photos (admin, service client, bucket 'recaps' public)
- Codebase strip diacritics in NL tekst (echt niet echt)
- Repo Bloody-BadAim/svsit-site, branch main. Supabase ref plgcqkbfvzwkqzkggmfh
