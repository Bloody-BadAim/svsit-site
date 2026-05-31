# Handoff — SIT Website (svsit.nl) — 2026-05-31

## Doel
Introweek pagina vervangen met Claude Design hyperspace handoff. Twee introweken (september 2026). Em dashes weg, encrypted decrypt-effect behouden.

## Status
- Fase: 4 Implement (post-launch onderhoud, live op main)
- Taak: T-introweek-redesign AF (niet gecommit)
- Gate: launch APPROVED (svsit.nl live)
- Commits: nog GEEN voor deze taak. Wacht op user OK voor commit+push.

## Gewijzigde files (deze sessie)
- `src/app/introweek/page.tsx` — herschreven: server component, metadata (em dashes weg) + Navbar/IntroweekClient/Footer
- `src/app/introweek/IntroweekClient.tsx` — NIEUW, 'use client', ~750 regels: boot overlay, 3D circuit hyperspace canvas, scramble hero, live countdown (31 aug 2026), TWEE-weken toggle (5 daycards elk), 3D tilt, expandable cards, decrypt-on-hover locked cards, survival kit, boarding-pass ticket finale, scoped `.iw` CSS

## Wat werkt
- tsc --noEmit groen + npm run build groen, /introweek prerendert static (○)
- Twee-weken toggle via React state `week`, week-panels met `.show` class
- Hyperspace canvas, scramble, countdown, tilt, decrypt allemaal geport naar useEffect met cleanup
- Em dashes overal weg (copy, scramble char set, JS consts). Lucide icons ipv emoji/inline SVG

## Wat niet werkte / geleerde lessen
- TS custom CSS prop: `as React.CSSProperties` faalt (geen React namespace in nieuwe JSX transform) — gebruik `import { type CSSProperties } from 'react'` + `as CSSProperties`
- Vanilla JS IIFEs (global DOM query) -> useEffect met rootRef-scoped querySelectorAll + cleanup. Tilt/expand/decrypt deps `[week]` zodat ze rebinden bij panel-switch
- Design CSS scoped onder `.iw` + iw-prefixed keyframes om collision met grote globals.css te voorkomen

## Blokkades
- Geen

## Volgende stappen
1. User OK vragen -> commit `feat: vervang introweek pagina met twee-weken hyperspace design` + push
2. TODO vorige sessie: foto's Liam/Thijmen/Jamiro/Yusuf op /over-ons (nu initialen)
3. Live Stripe e2e test (user zelf)

## Key context (voor nieuwe sessie)
- Design bron: /tmp/sit-handoff/sit/project/ (Introweek.html, introweek.css, introweek.js, introweek-hyperspace.js) — Claude Design bundle
- Beslissing: project Navbar+Footer behouden voor site-consistentie, alleen design BODY herbouwd (niet de design eigen terminal-nav/footer)
- Countdown target: `new Date('2026-08-31T13:00:00+02:00')`
- Anti-slop: NOOIT dashes/emojis in UI, alleen Lucide icons. Caveman mode actief (full)
- Supabase ref plgcqkbfvzwkqzkggmfh
