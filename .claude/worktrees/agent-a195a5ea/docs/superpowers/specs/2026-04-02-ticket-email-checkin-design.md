# Ticket Email + Check-in Scanner

**Datum:** 2026-04-02
**Status:** APPROVED

---

## Overzicht

Twee gescheiden flows bij events:
1. **Ticket QR** = check-in (bewijs van aanwezigheid, capaciteit tracking)
2. **Ledenpas QR** = punten (XP, reward systeem — ongewijzigd)

Na ticket aankoop/RSVP wordt automatisch een email verstuurd via Resend met een ticket PDF + QR code. Bij het event scant een bestuurslid de ticket QR voor check-in.

---

## 1. Resend Email Integratie

### Setup
- `npm install resend @react-email/components`
- Env var: `RESEND_API_KEY`
- Afzender: `noreply@svsit.nl` (domein verificatie in Resend dashboard)

### Email helper
`src/lib/email.ts`:
- `sendTicketEmail(ticket, event)` — stuurt ticket email met QR
- Gebruikt Resend SDK: `new Resend(process.env.RESEND_API_KEY)`

---

## 2. Ticket Email Template

`src/emails/ticketEmail.tsx` — React Email component

Inhoud:
- {SIT} logo header
- "Je ticket voor [event titel]"
- Event info: datum, tijd, locatie
- QR code afbeelding (gegenereerd als data URL via `qrcode` package)
- Ticket ID als tekst
- "Toon deze QR code bij de ingang"
- Footer: svsit.nl

QR data: `{"type":"ticket","id":"[ticket-uuid]"}`

---

## 3. Ticket QR Generatie

Bij ticket aanmaak (POST /api/events/[id]/tickets):
1. Genereer QR code als data URL: `import QRCode from 'qrcode'` → `QRCode.toDataURL(JSON.stringify({type:'ticket',id:ticketId}))`
2. Stuur email via `sendTicketEmail()` met de QR data URL
3. Voor gratis events: direct na INSERT
4. Voor betaalde events: in de Stripe webhook na `checkout.session.completed`

---

## 4. Check-in Scanner Modus

### Scanner pagina update
`src/app/admin/scanner/page.tsx` krijgt een toggle bovenaan:
- **Modus: Punten** (default) — bestaande flow, scant ledenpas QR, kent punten toe
- **Modus: Check-in** — scant ticket QR, markeert ticket als checked_in

### Check-in flow
1. Scanner leest QR → parst JSON → detecteert `type: "ticket"`
2. Stuurt ticket ID naar `PATCH /api/events/tickets/[id]/checkin`
3. API update: `tickets.status = 'checked_in'`, `tickets.checked_in_at = now()`
4. Scanner toont: "Check-in: [naam] — [event titel]"
5. Als ticket al checked in: toon waarschuwing "Al ingecheckt"
6. Als ticket niet gevonden of cancelled: toon fout

### Punten flow (ongewijzigd)
1. Scanner leest QR → parst JSON → detecteert `type: undefined` (ledenpas format: `{id, email}`)
2. Bestaande flow: POST /api/scans → punten + grantRewards()

### Auto-detectie
De scanner detecteert automatisch welk type QR gescand wordt:
- `{"type":"ticket","id":"..."}` → check-in flow
- `{"id":"...","email":"..."}` → punten flow

Geen handmatige toggle nodig — de QR data bepaalt de actie.

---

## 5. Check-in API

### `PATCH /api/events/tickets/[id]/checkin`
- Auth: admin only
- Haalt ticket op, checkt status
- Als `paid` → update naar `checked_in`, set `checked_in_at`
- Als al `checked_in` → return error "Al ingecheckt"
- Als `pending` of `cancelled` → return error
- Return: `{ data: { ticket, event_title, attendee_name }, error, meta }`

---

## 6. Dashboard: Mijn Tickets

`src/app/dashboard/tickets/page.tsx` (of sectie op bestaande pagina)

Lid ziet:
- Lijst van hun tickets (aankomende events)
- Per ticket: event naam, datum, status (paid/checked_in), QR code
- QR code toonbaar voor als ze de email kwijt zijn

---

## 7. Trigger Momenten

| Actie | Wat gebeurt er |
|-------|---------------|
| Gratis RSVP | Ticket INSERT (status: paid) → sendTicketEmail() |
| Stripe betaling compleet | Webhook → ticket status: paid → sendTicketEmail() |
| Ticket QR gescand | PATCH checkin → status: checked_in |
| Ledenpas QR gescand | POST /api/scans → punten + grantRewards() |

---

## Niet in scope
- Ticket annulering/refund (later)
- Wachtlijst bij vol event
- Meerdere tickets per persoon per event
- PDF ticket download (email met QR is genoeg)
