# Admin Rol + Dashboard Flow Fixes

**Datum:** 2026-04-01
**Status:** APPROVED
**Scope:** Admin rol naar database, profiel endpoint, onbetaalde leden flow, registratie skip

---

## 1. Admin rol in database

### Huidige situatie
- Role type: `member | contributor | mentor`
- Admin check: hardcoded `ADMIN_EMAILS` array in `constants.ts`
- Elk nieuw bestuurslid toevoegen = code wijzigen + deploy

### Gewenste situatie
- Role type: `member | contributor | mentor | admin`
- Admin check: `session.user.role === 'admin'` (uit database)
- Admins kunnen andere leden promoten via admin panel

### Wijzigingen

**`src/types/database.ts`**
- `Role = 'member' | 'contributor' | 'mentor' | 'admin'`

**`src/lib/constants.ts`**
- Hernoem `ADMIN_EMAILS` naar `SEED_ADMIN_EMAILS`
- Voeg `admin` toe aan `ROLLEN` record
- `SEED_ADMIN_EMAILS` wordt alleen gebruikt bij eerste login (auto-promote naar admin)

**`src/lib/auth.ts`**
- `signIn` callback: als email in `SEED_ADMIN_EMAILS` en role !== admin, update naar admin
- `session` callback: `isAdmin = session.user.role === 'admin'` (niet meer email check)
- JWT callback: leest role uit database (al zo)

**`src/middleware.ts`**
- Vervang `ADMIN_EMAILS.includes(email)` door `session.user.isAdmin` check
- Verwijder `ADMIN_EMAILS` import

**API routes (alle die ADMIN_EMAILS gebruiken):**
- `src/app/api/members/route.ts` (GET)
- `src/app/api/scans/route.ts` (POST, GET)
- `src/app/admin/page.tsx`
- Allemaal: vervang `ADMIN_EMAILS.includes(email)` door `session.user.isAdmin`

**`src/components/dashboard/DashboardNav.tsx`**
- Vervang `ADMIN_EMAILS.includes(email)` door `session?.user?.isAdmin`
- Verwijder `ADMIN_EMAILS` import

**`src/components/admin/MemberDetailModal.tsx`**
- Rol dropdown bevat nu ook `admin` optie

---

## 2. Fix A: Profiel endpoint voor alle leden

### Probleem
`GET /api/members` is admin-only. Profiel pagina gebruikt dit endpoint en filtert client-side. Normale leden krijgen 403.

### Oplossing
Nieuw endpoint: `GET /api/members/me`
- Auth: moet ingelogd zijn (geen admin vereist)
- Retourneert: eigen member record uit database (incl. `password_hash` als boolean `has_password`)
- Response format: `{ data, error, meta }`

**`src/app/dashboard/profiel/page.tsx`**
- Verander fetch van `/api/members` naar `/api/members/me`
- Verwijder client-side filter op user ID
- `has_password` boolean direct uit response

---

## 3. Fix B: Onbetaalde leden banner

### Probleem
Ingelogde leden zonder actief lidmaatschap zien een leeg dashboard. Geen CTA om te betalen.

### Oplossing
**`src/app/dashboard/page.tsx`**
- Als `membership_active === false`: toon prominente banner
- Banner content: "Je bent ingelogd maar nog geen lid. Word lid voor 10 euro/jaar."
- CTA knop: "Word lid" → `/lid-worden`
- Banner styling: goud accent border, vergelijkbaar met welcome banner

**`src/app/dashboard/ledenpas/page.tsx`**
- Als `membership_active === false`: toon placeholder kaart met lock icon
- Tekst: "Activeer je lidmaatschap om je ledenpas te ontvangen"
- CTA: "Word lid" → `/lid-worden`

---

## 4. Fix C: Registratie flow skip voor ingelogde users

### Probleem
Ingelogde niet-betalende leden die `/lid-worden` bezoeken moeten opnieuw email invullen (stap 1) en wachtwoord aanmaken (stap 3), terwijl die data er al is.

### Oplossing
**`src/components/auth/RegisterFlow.tsx`**
- Check bij mount of user ingelogd is (via session)
- Als ingelogd: start bij stap 2 (commissie keuze) of stap 4 (betalen) als commissie al gekozen
- Stap 1 (email) en stap 3 (wachtwoord) worden overgeslagen
- Email uit session gebruiken, niet uit form

---

## Niet in scope
- Commissievoorzitter rol / gelaagde permissies (later)
- Admin audit log (wie heeft wat gewijzigd)
- Admin uitnodigen via email
