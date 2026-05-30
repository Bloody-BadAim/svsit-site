# Handoff - SIT Website (svsit.nl) - 2026-05-30

## Doel
Commissie- en about-pagina samengevoegd tot een stamboom ("Het Moederbord"), rommel opgeruimd, partners in navbar, em dashes weg (anti-slop).

## Status
- Fase: Post-launch onderhoud (geen losse taak-ID)
- Taak: Sessie 20 - Moederbord cleanup + nav + foto's + anti-slop KLAAR
- Gate: n.v.t. (live site)
- Nog niet gecommit/gedeployed (wacht op user-akkoord)

## Gewijzigde files (deze sessie)
- `src/lib/moederbord.ts` - foto's wesley/mats/nick/idil/matin gevuld, riley naar .jpg
- `public/bestuur/` - wesley/mats/nick/idil/matin/riley.jpg uit XII-map; hugo.webp + riley.webp verwijderd
- `src/components/Navbar.tsx` - Partners-link toegevoegd (desktop + mobiel via navLinks)
- `src/app/organisatie/page.tsx` - nu permanentRedirect naar /over-ons
- `src/app/sitemap.ts` - /organisatie regel verwijderd
- VERWIJDERD: `src/components/Board.tsx`, `src/components/orgTree/`, `src/app/commissies/layout.tsx`, `src/app/commissies/error.tsx`
- Hele src: alle em/en dashes (314) vervangen door hyphen

## Wat werkt
- npx next build groen: /over-ons (static), /partners, /commissies + /organisatie (308 redirects)
- Footer had Partners-link al, geen commissies/organisatie meer
- Geen placeholder-copy (alle "placeholder" hits zijn form-attributes)

## Wat niet werkte / geleerde lessen
- Geen problemen. Box-drawing comments (U+2500) bleven staan; alleen echte em/en dash (U+2014/2013) vervangen.

## Blokkades
- Geen

## Volgende stappen
1. Commit + Vercel deploy (wacht op user-akkoord)
2. Foto's Liam/Thijmen/Jamiro/Yusuf toevoegen wanneer beschikbaar (nu initialen)
3. Visuele QA: 7 modules in 1 rij op desktop kan krap zijn

## Key context (voor nieuwe sessie)
- Stamboom-bron = /over-ons (Moederbord). /commissies + /organisatie zijn 308 redirects.
- Data single source: src/lib/moederbord.ts. Bestuur XII = 4 leden met "over"-intro.
- Foto-bron map: C:\Users\matin\Desktop\HvA\SIT\Bestuur\XII (Liam/Thijmen/Jamiro/Yusuf ontbreken nog)
- Partners staan nu OOK in navbar (vorige sessie bewust alleen footer; user wilde navbar erbij)
