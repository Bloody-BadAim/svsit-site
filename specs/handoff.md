# Handoff — SIT Website — 2026-05-26 (sessie 4)

## Status: MERGED + BUGFIXES GEPUSHT
- Branch `feature/website-overhaul` gemerged naar main via PR #5
- 3 bugfixes gecommit en gepusht (e59ac18)
- Alle 14 migraties draaien op productie
- 10 duplicate events geannuleerd in DB
- Past events gemarkeerd als completed

## Wat deze sessie gedaan
1. Alle 6 nieuwe migraties op productie gedraaid (via Management API curl)
2. Post-migratie verificatie: 20 tabellen, 94 members, 38 events, 4 bestuur
3. Branch gepusht, PR aangemaakt en gemerged
4. CRLF phantom diffs permanent opgelost (.gitattributes)
5. **Bug: Navbar ontbrak** op /projecten en /vacatures — opgelost
6. **Bug: Events ruis** — duplicates geannuleerd, past events -> completed, query filter toegevoegd
7. **Bug: Events layout** — handmatige back-link/logo vervangen door Navbar

## Database staat
| Metric | Waarde |
|---|---|
| Tabellen | 20 |
| Members | 94 |
| Events | 38 (7 upcoming, rest completed/cancelled) |
| Bestuur | 4 (allen is_admin=true) |
| Commissies | 6 |
| Tickets | 0 |
| Projects | 0 |
| Vacatures | 0 |

## Upcoming events (na cleanup)
- Boardgame middag (29 mei 14:00)
- AI & Menselijk Contact (3 jun 11:00)
- CERN Lecture & Lunch (5 jun 12:00)
- Eindfeest Thuishaven (26 jun 17:00)
- AI hackathon (7 jul 07:00)

## Volgende stappen (geprioriteerd)

### 1. PDF ticket met SIT branding (T043)
- Huidige "Download PDF" is `window.open()` + `window.print()` — kale HTML
- Moet: echte PDF met SIT dark branding, QR code, Big Shoulders Display, gold accents
- Bestaande referentie: `src/emails/ticketEmail.tsx` (React Email template, zelfde stijl)
- QR data format inconsistentie: email stuurt `{"type":"ticket","id":"..."}`, dashboard gebruikt `sit:ticket:{id}` — moet geunificeerd
- Geen PDF library geinstalleerd. Opties: `@react-pdf/renderer` of `jspdf`
- API route nodig: `/api/tickets/[id]/pdf`

### 2. Commissie pagina's
- 7 commissies in DB, geen enkele heeft een publieke pagina
- Nodig: /commissies overview + /commissie/[slug] detail
- Data: commissies tabel + member_commissies koppeltabel bestaan al

### 3. Event recaps met foto's
- DB kolommen bestaan: recap_description, recap_photos, recap_published
- Admin recap editor al gebouwd in /admin/events
- Frontend ontbreekt: recap sectie op /events/[id] pagina

### 4. Introweek landing page
- 728 eerstejaars op 31 aug - 4 sep
- 3 onderdelen: SIT Hub (hele week stand), Survival Quest (di 1 sep), Aloha Amsterdam (do 3 sep)
- Doel: conversie naar leden

### 5. Registratie drempel verlagen
- Nu: 4 stappen + 10 euro upfront
- Moet: freemium/trial optie of betaal-later
- KRITIEK voor introweek conversie

### 6. Dashboard rebalancen
- XP/coins/badges te prominent
- Events + commissie moeten primair worden

## Bekende inconsistenties
- **Gold kleur**: CSS `#F59E0B` (Tailwind amber-500) vs Figma brand kit `#F29E18`
- **QR data format**: email JSON vs dashboard `sit:ticket:` prefix
- **Zomerfeest SVO** (29 mei): staat als upcoming maar SIT betrokkenheid onduidelijk

## Key context
- Supabase project ref: plgcqkbfvzwkqzkggmfh
- Geen staging, direct op productie
- Build passing
- Repo: Bloody-BadAim/svsit-site (private)
- Supabase MCP beschikbaar (maar soms fallback naar Management API curl nodig)
