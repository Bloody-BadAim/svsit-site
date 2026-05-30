# Handoff — SIT Website (svsit.nl) — 2026-05-30

## Doel
Event/ticket-systeem volledig herzien: gratis-aanmelden / betaald / lid-vs-niet-lid prijs / externe-samenwerking-redirect; eigen eventen ticket (naam+email) -> PDF op mail met QR; admin per-event overzicht; QR scanner herbouwen + scan-historie; PDF-logo fixen; dead code weg.

## Status
- Fase: Post-launch — gerichte bugfixes (NIET overhaul)
- Taak: Sessie 22 — DIAGNOSE KLAAR + code GELEZEN, nog geen code gewijzigd
- Gate: n.v.t. (live site)
- Laatste commit `ca5999a` (sessie 20, Moederbord) — live op svsit.nl

## BELANGRIJK: sessie 21 handoff was FOUT
Sessie 21 crashte VOORDAT code gelezen werd (thinking-block corruptie tijdens MemPalace writes). Diens "todo"-lijst kwam uit verouderde sit-wiki, niet uit echte code. Sessie 22 heeft de echte files gelezen: systeem is grotendeels AF.

## AL GEBOUWD (sessie 21 dacht todo)
- Events uit Supabase DB (NIET Notion) — `api/events/public/route.ts` leest `from('events')`
- `external_ticket_url` veld bestaat -> samenwerkings-redirect werkt
- Gratis/betaald/lid-vs-niet-lid prijs — `api/events/[id]/tickets/route.ts:91-195`
- PDF-ticket met QR — `lib/pdfTicket.ts` (jsPDF 105x210mm)
- Ticket-email — `lib/email.ts` (Nodemailer Gmail SMTP) + `emails/ticketEmail.tsx` + PDF-attachment
- QR scanner — `components/admin/QRScanner.tsx` auto-detect ticket vs ledenpas
- Admin per-event overzicht — `components/admin/EventDetailPanel.tsx`: deelnemerslijst + attendance (checkedIn/paid, no-shows, pct) + scan-historie + check-in-code

## Wat niet werkte / geleerde lessen
- VERTROUW handoff NIET blind als vorige sessie crashte — verifieer tegen echte code
- Parallel read-batch met non-zero Bash exit -> hele batch gecancelled

## Blokkades
- Geen

## Volgende stappen (ECHTE bugs, gericht)
1. PDF logo abnormaal `pdfTicket.ts:62-70` — `{`/`SIT`/`}` op hardcoded offsets W/2-15,-10,+10, { en SIT 5mm uit elkaar -> OVERLAP (snel)
2. `pdfTicket.ts:199` 'Bestuur XI' -> 'Bestuur XII'
3. Scanner valideert event NIET — checkin-route negeert event_id (jouw pijnpunt)
4. Capacity RACE CONDITION `tickets/route.ts:74-86` count-dan-insert niet atomic
5. Admin-check unificeren — tickets GET alleen isAdmin vs checkin isAdmin||role==bestuur
6. QR-formaat dode tak — scanner kent `sit:ticket:<id>` maar email/PDF maken alleen legacy JSON `{type,id}`
7. UX scanner: ledenpas-punten + ticket-checkin op 1 scherm onduidelijk -> splitsen
Volgorde: 1+2 -> 3 -> 4+5 -> 6 -> 7

## Key context (voor nieuwe sessie)
- DB: events (category, capacity, is_paid, price_members, price_nonmembers cents, external_ticket_url, recap_*), tickets (status pending/paid/cancelled/checked_in, ticket_number #SIT-YYYY-XXXX, paid_amount cents)
- Events ZITTEN AL in Supabase (geen Notion-migratie nodig)
- Stack: Next.js 16.2.1, React 19, Supabase (RLS, service role) ref plgcqkbfvzwkqzkggmfh, NextAuth v5, Stripe (SEPA/iDEAL/card), Tailwind v4
- Design: dark #09090B, gold #F59E0B, blue #3B82F6, red #EF4444; fonts JetBrains Mono/Clash Display/Geist; geen Inter/Roboto/Arial; geen emojis (Lucide); print/PDF vector
- Lighthouse WSL: CHROME_PATH=/usr/bin/google-chrome-stable
