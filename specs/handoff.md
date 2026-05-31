# Handoff — SIT Website (svsit.nl) — 2026-05-31

## Doel
Drie mitigaties uit de graph-analyse: (a) createServiceClient typen, (b) authz-audit, (c) check-in race dichten.

## Status
- Fase: 4 Implement (post-launch onderhoud, live op main)
- Taak: a/b/c afgerond, code groen
- Gate: launch APPROVED (svsit.nl live)

## Gewijzigde files (deze sessie)
- `src/lib/database.types.ts` — NIEUW, gegenereerd uit live DB (ref plgcqkbfvzwkqzkggmfh)
- `src/lib/supabase.ts` — 3 clients getypeerd met `<Database>`
- `src/app/api/challenges/submissions/[id]/route.ts` — `as StatCategory` cast
- `src/app/api/challenges/tracks/route.ts` — `as Challenge` cast
- `src/app/api/events/[id]/tickets/route.ts` — price `?? 0` + nullable RPC-args cast
- `src/app/api/members/route.ts` — insertData `TablesInsert<'members'>`
- `src/app/dashboard/card-editor/page.tsx` — `ComponentProps` boundary cast
- `src/app/api/events/tickets/[id]/checkin/route.ts` — atomaire UPDATE `.eq('status','paid')` + 409
- `src/app/api/events/[id]/checkin/route.ts` — vangt unique-violation 23505 -> 409
- `supabase/migrations/20260531-01-prevent-duplicate-self-checkin.sql` — NIEUW (NIET applied)

## Wat werkt
- tsc --noEmit clean, `npm run build` OK (Proxy middleware actief)
- 11 type-fouten die opdoken na typing allemaal gefixt zonder `any`
- Authz-audit: 42 routes, geen gaten

## Wat niet werkte / geleerde lessen
- Supabase gegenereerde types: DB-enums = `string`, RPC-args = non-null (nullability niet gemodelleerd) -> cast op grens met comment
- Member self-checkin TOCTOU kan app-code alleen niet sluiten -> partial unique index nodig (scanned_by IS NULL discrimineert self vs admin scan)

## Blokkades
- Geen (wacht op user-beslissing voor 2 shared-state acties)

## Volgende stappen
1. User-OK: `apply_migration` op LIVE DB plgcqkbfvzwkqzkggmfh (20260531-01). Zonder index = points-farming-gat open
2. User-OK: commit + push alle wijzigingen
3. Daarna: live Stripe e2e (STRIPE_WEBHOOK_SECRET in Vercel)

## Key context (voor nieuwe sessie)
- createServiceClient = service-role (bypasst RLS) -> elke caller MOET eigen authz; audit bevestigde dat dit klopt
- Migratie-index discriminator: self-checkin `scanned_by: null`, admin-scan `scanned_by: session.user.email`
- Genereer DB-types opnieuw via `mcp__supabase__generate_typescript_types` na schema-wijziging
