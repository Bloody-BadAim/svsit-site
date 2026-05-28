# Handoff — SIT Website — 2026-05-29

## Doel
SIT website admin dashboard verbeteringen + performance + cleanup

## Status
- Fase: 4 (Implement) — admin redesign + fixes
- Taak: Admin events tab redesign KLAAR, volgende: studentnummer edit
- Gate: Build passing, deploy live op svsit.nl

## Gewijzigde files (sessie 12)
- `src/app/admin/events/page.tsx` — HERSCHREVEN: 1132 LOC → ~230 LOC, filter tabs, delegeert naar sub-componenten
- `src/components/admin/EventFormModal.tsx` — NIEUW: create + edit modal (~270 LOC)
- `src/components/admin/EventDetailPanel.tsx` — NIEUW: expanded detail panel (~320 LOC)

## Wat werkt
- Admin events: filter tabs (5 statussen met counts), event CRUD (create + edit via modal)
- EventDetailPanel: check-in code, scanner activatie, tickets+attendance, recap editor, scans
- EventFormModal: pre-filled velden bij edit, datetime conversie, PATCH naar /api/events/[id]
- Build: passing, TypeScript clean

## Wat niet werkte / geleerde lessen
- Graphify query voor "admin events" vond alleen publieke Events component — moest specifieker zoeken op "QRScanner" om community 25 (admin cluster) te vinden

## Blokkades
- Geen

## Volgende stappen
1. Admin: studentnummer toevoegen/wijzigen per lid (MemberDetailModal)
2. Check alle admin dashboard tabs op werking
3. Lighthouse performance meting (target TBT<500ms, Performance>85)
4. Event descriptions vullen in DB
5. Vercel deploy

## Key context
- Supabase ref: plgcqkbfvzwkqzkggmfh
- Events API: GET /api/events (publiek), POST (admin), PATCH /api/events/[id] (admin), DELETE soft (status→cancelled)
- Admin routes: /admin/leden, /admin/events, /admin/scanner, /admin/challenges, /admin/projecten, /admin/vacatures, /admin/email
- Graphify graph: 2.376 nodes, 235 communities, community 25 = admin events cluster
- Nieuwe admin componenten: EventFormModal.tsx, EventDetailPanel.tsx
