# Handoff - SIT Website (svsit.nl) - 2026-05-30

## Doel
Commissie- en about-pagina samengevoegd tot een stamboom ("Het Moederbord"), rommel opgeruimd, partners in navbar, em dashes weg (anti-slop). Gecommit + gedeployed.

## Status
- Fase: Post-launch onderhoud (geen losse taak-ID)
- Taak: Sessie 20 - Moederbord cleanup + nav + foto's + anti-slop + DEPLOY KLAAR
- Gate: n.v.t. (live site)
- Commit `3bb2958` gepusht naar main, gedeployed naar Vercel prod (svsit.nl)

## Gewijzigde files (deze sessie)
- `src/lib/moederbord.ts` - foto's wesley/mats/nick/idil/matin gevuld, riley naar .jpg
- `public/bestuur/` - wesley/mats/nick/idil/matin/riley.jpg uit XII-map; hugo.webp + riley.webp verwijderd
- `src/components/Navbar.tsx` - Partners-link toegevoegd (desktop + mobiel via navLinks)
- `src/app/organisatie/page.tsx` - nu permanentRedirect naar /over-ons
- `src/app/sitemap.ts` - /organisatie regel verwijderd
- VERWIJDERD: `src/components/Board.tsx`, `src/components/orgTree/`, `src/app/commissies/layout.tsx`, `src/app/commissies/error.tsx`
- Hele src: alle em/en dashes (314) vervangen door hyphen

## Wat werkt
- Commit 3bb2958 (135 files) gepusht + Vercel deploy groen, svsit.nl live
- Lighthouse desktop alle paginas: / Perf 93 (CLS 0.05), /over-ons 99, /events 100, /partners 100, /projecten 100, /vacatures 100, /faq 100, /introweek 100. Alle TBT 0ms, LCP 0.5-0.7s
- Homepage laagst (93) door CLS 0.05 - kleine layout shift, enige verbeterpunt
- /commissies + /organisatie -> 308 redirect naar /over-ons (geverifieerd live)

## Wat niet werkte / geleerde lessen
- Lighthouse faalde eerst met "Unable to connect to Chrome" - npx default zoekt geen Chrome. Fix: CHROME_PATH=/usr/bin/google-chrome-stable + --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage"

## Blokkades
- Geen

## Volgende stappen
1. Homepage CLS 0.05 + React error #418 (hydration text mismatch) fixen
2. Foto's Liam/Thijmen/Jamiro/Yusuf toevoegen wanneer beschikbaar (nu initialen)
3. Visuele QA: 7 modules in 1 rij op desktop kan krap zijn
4. NOTION_API_KEY check in Vercel env (oude TODO)

## Key context (voor nieuwe sessie)
- Stamboom-bron = /over-ons (Moederbord). /commissies + /organisatie zijn 308 redirects.
- Data single source: src/lib/moederbord.ts. Bestuur XII = 4 leden met "over"-intro.
- Foto-bron map: C:\Users\matin\Desktop\HvA\SIT\Bestuur\XII (Liam/Thijmen/Jamiro/Yusuf ontbreken nog)
- Partners staan nu OOK in navbar (vorige sessie bewust alleen footer; user wilde navbar erbij)
- Lighthouse runnen: CHROME_PATH=/usr/bin/google-chrome-stable npx --no-install lighthouse <url> --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage"
