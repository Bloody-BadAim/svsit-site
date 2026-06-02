# Handoff — SIT Website (svsit-site) — 2026-06-02

## Doel
SIT studievereniging website, live op svsit.nl. Studievereniging van HBO-ICT (HvA).

## Status
- Fase 9 Launch, productie. ALLES van deze sessie AF + gedeployed + prod-geverifieerd.
- HEAD `f5a9164` = origin/main. Git clean. Takenlijst leeg.

## Gewijzigde files (deze sessie, hoofdlijnen)
- Security: `api/members/route.ts` (privesc+takeover), `api/events/[id]/tickets/route.ts` (auth-afgeleid + rate-limit), `tickets/export` (CSV-injectie), `api/password/forgot` (rate-limit).
- Gamify: `lib/inventoryEngine.ts` (lazy level-unlock), `components/stickerIcons.tsx` (SVG ipv emoji), `CardEditor.tsx`.
- Co-brand: `HboIctSection/HboIctVormtaal/FemItSection.tsx`, Navbar/Footer/over-ons/IntroweekClient, `lib/partners.ts`, `public/hbo-ict-wit.png` + `femit-logo.png`, globals `--hboict-*` tokens.
- Perf/anti-lag: `CircuitBackground.tsx` (canvas mobiel uit, desktop pulse), `circuitBackground.css` (.circuit-bg-grid), `SmoothScroll.tsx` (lenis los van toggle), `lib/motion.ts`.
- Fix: `CommunityLog.tsx` (#418 hydration, &nbsp;-span). `SITE_CONFIG` in `lib/constants.ts`. Tests in `lib/__tests__/` (182) + `e2e/`.

## Wat werkt (prod-geverifieerd)
- Security-gaten dicht. Gamify unlock + SVG-stickers. HBO-ICT + FemIT co-branding. Desktop pulse-canvas, mobiel licht (geen lag). Static-toggle scroll werkt. #418 weg (0/4 prod). 182 tests groen. Desktop Lighthouse 100, mobiel ~81.

## Wat niet werkte / lessen
- Data-driven prod-hydration (#418): repro vereist ECHTE Supabase-data (fake env = lege render = geen error). dev-HMR serveert stale SSR -> `rm -rf .next` + fresh build om te verifieren. JSX bare-tekst naast element+entity = whitespace-mismatch -> wrap in span met &nbsp;/&amp;.
- Lenis NOOIT mid-sessie destroyen (breekt ScrollTrigger-scroller -> scroll/clicks dood).
- Lokale WSL-Lighthouse onbetrouwbare TBT bij host-contentie; meet warm of via pagespeed.web.dev.

## Blokkades
- Geen code-blokkades. Open punten hieronder hebben input van Matin nodig.

## Volgende stappen (geparkeerd, geen code-blocker)
1. Bestuur-foto's Thijmen/Yusuf/Liam (photo:null in `lib/moederbord.ts`) — bestanden nodig.
2. NOTION_API_KEY uit Vercel-dashboard verwijderen — puur dashboard-actie.
3. SEPA recurring — bewust niet aangezet (Stripe-dashboard + mandaat-beslissing).
4. Mobile-LCP ~3.x s — acceptabel (chip-image LCP, geen bug).

## Key context (nieuwe sessie)
- Deploy: `vercel --prod --yes` vanuit repo root, aliased svsit.nl.
- Prod-verificatie: Playwright tegen svsit.nl (mobiel devices['iPhone 12']). Static-test: localStorage sit-reduced-motion=true + .reduce-motion class.
- Lokale dev/build van DB-pagina's: zonder echte env = error.tsx; met (fake of echte) env booten ze. Echte env: `vercel env pull .env.local` (bevat secrets -> erna verwijderen).
- CircuitBackground = fixed canvas, alleen desktop animeert (mobiel `<=767px` bailt). Chip-logo = mobile LCP-element (SSR + preload).
- Schrijfstijl: geen streepjes/em-dashes/`_` in prose, weinig komma's, studententoon.
