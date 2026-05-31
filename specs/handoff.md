# Handoff — SIT Website (svsit.nl) — 2026-05-31

## Doel
Post-launch onderhoud. Juridische docs + Moederbord module-content. Live op main, Vercel auto-deploy.

## Status
- Fase: 4 Implement (post-launch onderhoud, live op main)
- Taak: naam-fix + /documenten gebouwd (NIET gecommit). Volgende: Mats zijn Moederbord-module content
- Gate: launch APPROVED (svsit.nl live)
- Commits: `f1cbf89` (privacyverklaring + footer link, GEPUSHT). Daarna NIET gecommit: naam-fix + /documenten + footer links

## Gewijzigde files (deze sessie, NIET gecommit)
- `src/app/privacy/PrivacyContent.tsx` — naam "wie"-body -> "Studievereniging Innovatie en Technologie (SIT)"
- `src/components/Footer.tsx` — export-ident -> StudieverenigingInnovatieEnTechnologie; NAV_LINKS: /privacy + /documenten links
- `src/app/documenten/page.tsx` — NIEUW server metadata
- `src/app/documenten/DocumentenContent.tsx` — NIEUW client, terminal-stijl, 3 doc-cards
- `public/documenten/statuten-sit-2015.pdf` — NIEUW (614KB, uit XII-map)

## Wat werkt
- /privacy live (f1cbf89 gepusht), naam-fix lokaal klaar
- /documenten lokaal klaar: Statuten download + HHR/Jaarverslag "binnenkort". tsc groen
- Footer-links /privacy + /documenten

## Wat niet werkte / geleerde lessen
- Grep `-i` param moet boolean zijn, niet string -> gebruik `[Hh]` regex ipv -i flag

## Blokkades
- Geen

## Volgende stappen
1. NIEUWE TAAK (Mats): bij openen van Mats zijn Moederbord detail-module moeten bepaalde dingen bovenaan/eerst staan. User vertelt details NA compact. Moederbord = src/components/Moederbord.tsx (DetailSheet), data src/lib/moederbord.ts (PEOPLE/BESTUUR/COMMISSIES)
2. COMMIT pending: naam-fix + /documenten + footer (wacht op user "commit en push")
3. HHR: zodra ALV bekrachtigt -> PDF in public/documenten + status "beschikbaar" in DocumentenContent
4. TODO ouder: foto's Liam/Thijmen/Yusuf op /over-ons (initialen)
5. SECURITY: rk_live key roteren (~/.config/stripe/live-restricted.key)

## Key context (voor nieuwe sessie)
- Moederbord single source: `src/lib/moederbord.ts` (PEOPLE/BESTUUR 4 leden/COMMISSIES 7). DetailSheet altijd-gemount, body-lock guard op `selected`. CSS src/components/moederbord.css (.sheet-body flex:1 1 auto + min-height:0)
- HHR-richting: geen los doc bestaat, ALV 8 mei agendapunt 9 "Bekrachtiging HHR", commissie BXI "3.7 HHR Art.20". HHR=flexibele laag bovenop vaste statuten, via ALV bekrachtigd
- Statuten 2015 PDF: `C:\Users\matin\Desktop\HvA\SIT\Bestuur\XII\Statuten, 2015.pdf` -> gekopieerd naar public
- Officiele naam = "Studievereniging Innovatie en Technologie (SIT)" (notarieel 26 nov 2015). Brand "{SIT}" elders mag blijven
- Page-pattern: page.tsx (server, metadata) + Content.tsx (client). Wrap page-public + Navbar + main#main-content paddingTop 5rem + Footer
- Terminal tokens: #F29E18 gold/#22C55E green/#3B82F6 blue/#A78BFA purple/#18181B surface/#27272A border/#A1A1AA text/#FAFAFA bright
- Anti-slop: NOOIT dashes/emojis in UI, alleen Lucide icons. Commit alleen op expliciet "commit en push"
- Repo Bloody-BadAim/svsit-site, branch main. Supabase ref plgcqkbfvzwkqzkggmfh
