# Handoff — SIT Website (svsit-site) — 2026-05-30

## Doel
Event/ticket flow review + bugfixes. Betaalde/gratis events, member-pricing, externe links, PDF+QR tickets, QR-scanner.

## Status
- Fase: 4 Implement (ad-hoc bugfix sweep op bestaand systeem)
- Taak: event/ticket flow review afgerond, 7 fixes gecommit
- Gate: n.v.t. (post-merge maintenance op main)

## Gewijzigde files (deze sessie)
- `src/lib/pdfTicket.ts` — {SIT}-logo gecentreerd via glyph-breedtes, Bestuur XI->XII
- `src/app/api/events/tickets/[id]/checkin/route.ts` — event_id match-check, requireAdmin
- `src/components/admin/QRScanner.tsx` — ticket/ledenpas mode-toggle, dode QR-tak weg, event_id meesturen
- `src/app/api/events/[id]/tickets/route.ts` — book_event_ticket RPC ipv count-then-insert
- `src/app/api/events/route.ts`, `events/[id]/route.ts`, `scans/route.ts` — requireAdmin unificatie
- `supabase/migrations/20260530-01-atomic-ticket-booking.sql` — nieuwe RPC (search_path gepind)

## Wat werkt
- 7 fixes, `npx tsc --noEmit` groen
- Migratie TOEGEPAST op prod DB (function book_event_ticket bevestigd via pg_proc)
- Commit `00a64c6` op main (1 ahead origin, NIET gepusht)

## Wat niet werkte / geleerde lessen
- Sessie 21 (vorige) crashte voor code lezen -> handoff was fout. Les: verifieer tegen echte code als vorige sessie crashte
- service-client untyped -> rpc().single() geeft `unknown`. Cast `{id:string;[k:string]:unknown}|null` + null-guard
- advisor flagde mutable search_path -> `ALTER FUNCTION ... SET search_path=public`

## Blokkades
- Geen

## Volgende stappen
1. Push naar origin/main (wacht op user) + Vercel deploy
2. Live test: gratis event aanmelden (mail+PDF), betaald event (Stripe pending->paid webhook), scanner ticket-modus check-in + event-mismatch, scanner ledenpas-modus punten, capaciteit vol (409)
3. Foto's Liam/Thijmen/Jamiro/Yusuf in moederbord (los van dit)

## Key context (voor nieuwe sessie)
- Supabase ref `plgcqkbfvzwkqzkggmfh`. Events uit DB, niet Notion
- Pending tickets tellen mee in capaciteit binnen 30min (= Stripe checkout window). Webhook checkout.session.completed + metadata.type=event_ticket flipt pending->paid + mail
- requireAdmin pattern: `const result = await requireAdmin(); if ('error' in result) return result.error` dan `const { session } = result`
- QR ticket-formaat: `{type:'ticket', id}`. Ledenpas: `{id, email}`
