# Handoff — SIT Website — 2026-05-29

## Doel
SIT website admin dashboard verbeteringen + performance audit

## Status
- Fase: 4 (Implement) — admin redesign DONE, performance gemeten
- Gate: Build passing, deploy live op svsit.nl
- Commit: `5ddbcce` (admin events redesign + member profile editing)

## Gewijzigde files (sessie 12)
- `src/app/admin/events/page.tsx` — HERSCHREVEN: 1132 LOC → ~230 LOC, filter tabs, sub-componenten
- `src/components/admin/EventFormModal.tsx` — NIEUW: create + edit modal (~270 LOC)
- `src/components/admin/EventDetailPanel.tsx` — NIEUW: expanded detail panel (~320 LOC)
- `src/components/admin/MemberDetailModal.tsx` — studentnummer + display_name editing toegevoegd

## Wat werkt
- Admin events: filter tabs (5 statussen), event CRUD via modal, detail panel
- MemberDetailModal: profiel bewerken (naam + studentnummer)
- Alle 8 admin tabs geaudit: 0 issues
- Build: passing, TypeScript clean

## Performance Metingen (curl proxy, geen Lighthouse mogelijk)
- HTML: 138 KB, JS: 1.185 KB (18 chunks), CSS: 350 KB
- TTFB homepage: 123ms (excellent)
- TTFB /events: 1.36s (BOTTLENECK — server-side Supabase query)
- TTFB static pages: 470-495ms (OK)
- Lighthouse niet draaibaar: WSL2 Chrome bridge faalt, PSI API quota exceeded

## Blokkades
- Lighthouse CLI: Chrome in WSL2 kan niet verbinden (ECONNREFUSED). Windows Chrome --headless ook niet
- PSI API: quota 0/dag op Google project 583797351490 (ook met Gemini key)
- Oplossing: run Lighthouse handmatig in Chrome DevTools (F12 > Lighthouse tab) of via pagespeed.web.dev

## Volgende stappen
1. Lighthouse handmatig draaien (Chrome DevTools of pagespeed.web.dev)
2. /events TTFB optimaliseren (1.36s → <500ms): cache headers, stale-while-revalidate, of ISR
3. Event descriptions vullen in DB (26/38 events missen description)
4. Vercel deploy (T028)
5. Push naar remote

## Key context
- Supabase ref: plgcqkbfvzwkqzkggmfh
- Admin pages: 8 tabs, allemaal functioneel, audit clean
- Events API: GET publiek, POST/PATCH/DELETE admin only
- Graphify graph: 2.376 nodes, 235 communities
- 4 commits sessie 11-12: e451c66, ee5b6a5, cba32b4, 5ddbcce
