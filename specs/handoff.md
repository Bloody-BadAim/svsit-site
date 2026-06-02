# Handoff — SIT Website (svsit-site) — 2026-06-02

## Doel
SIT studievereniging website, live svsit.nl. Recent: HBO-ICT + FemIT co-branding, perf/anti-lag, tests.

## Status
- Fase 9 Launch, productie. Laatste deploy `28787cc` (canvas-uit + scroll-fix). Lag op telefoon WEG (user bevestigd).
- BEZIG: #418 hydration-mismatch op homepage onderzoeken (user: "fix #418"). NIET afgerond.

## Gewijzigde files (deze sessie, recent)
- `CircuitBackground.tsx` + `circuitBackground.css` — canvas-rAF UIT (mobiel+desktop), lichte `.circuit-bg-grid` + chip ipv canvas (anti-lag).
- `SmoothScroll.tsx` — lenis NIET meer aan // static toggle gekoppeld (mid-sessie destroy brak scroll). Mount-only.
- `layout.tsx` — Big Shoulders font-preload eruit.
- `.env.local` AANGEMAAKT met FAKE waarden (geen echte secrets) voor lokale dev #418-debug. **MOET OPGERUIMD** (gitignored, maar verwijder). Dev-server draait mogelijk nog (`npm run dev`, poort 3000/3001) — KILLEN.

## Wat werkt
- Anti-lag: geen rAF-canvas meer, mobiel+desktop smooth (prod-geverifieerd). Static-toggle: scroll+clicks werken weer. 10 key-pages HTTP 200, content ok. Co-branding HBO-ICT+FemIT live. 182 tests.

## Wat niet werkte / lessen
- #418 homepage: NIET lokaal te reproduceren met fake/lege data (dev = 0 hydration-errors) -> data-driven OF prod-build-only. Footer `new Date().getFullYear()` zit op ALLE pages dus niet de homepage-only oorzaak (/faq etc gaven err:0). Homepage-only componenten = verdachte (Hero/IntroOverlay/CodeCompile/ScrollMorphNumbers/CommunityLog/co-brand secties). CommunityLog is al #418-guarded (effect-deferral). Niet-fataal (React herstelt, page werkt).
- Lenis mid-sessie destroyen breekt ScrollTrigger-scroller -> scroll/clicks dood.

## Blokkades
- #418 niet lokaal reproduceerbaar zonder ECHTE Supabase-data (env-pull eerder geweigerd door auto-mode). Nodig: prod-data lokaal OF React DevTools op live svsit.nl om mismatchend element te zien.

## Volgende stappen
1. #418: pak prod-component-stack (laatste Playwright-run `bon0ryy8s` capturede console+stack op svsit.nl mobiel) OF laat user React DevTools draaien. Anders: niet-fataal, evt laten.
2. OPRUIMEN: `rm .env.local` + kill dev-server (lsof -ti:3000/3001 | xargs kill -9).
3. Backlog: bestuur-foto's Thijmen/Yusuf/Liam (photo:null, files nodig).

## Key context (nieuwe sessie)
- Homepage rendert geen DB-data server-side (Events = client-fetch). Dus #418 is subtiel/prod-only.
- Lokale `next start`/`dev` zonder ECHTE Supabase-env: met FAKE env boot 't + homepage rendert (queries falen -> leeg, afgehandeld). Zonder env = error.tsx.
- Deploy: `vercel --prod --yes`. Prod-verificatie: Playwright tegen svsit.nl (mobiel devices['iPhone 12'] of isMobile viewport). Static-test: addInitScript localStorage sit-reduced-motion=true + .reduce-motion class.
- Schrijfstijl: geen streepjes/em-dashes, weinig komma's, studententoon (auto-memory feedback-schrijfstijl).
