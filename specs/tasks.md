# Tasks — SIT Leden Portaal

**Status**: APPROVED
**Laatst bijgewerkt**: 2026-03-30
**Voortgang**: 27/28 taken voltooid

---

## Fase A: Setup

### T001 — Dependencies installeren ✅
- **Tijd**: 15 min
- **Dependencies**: geen
- **Beschrijving**: Installeer alle nieuwe packages: `@supabase/supabase-js`, `@supabase/ssr`, `next-auth@beta`, `@auth/supabase-adapter`, `stripe`, `zustand`, `react-qr-code`, `html5-qrcode`, `bcryptjs` + types
- **Acceptance criteria**:
  - [x] Alle packages in package.json
  - [x] `npm run build` slaagt zonder errors
  - [x] Geen version conflicts

### T002 — Environment variables en Supabase client ✅
- **Tijd**: 20 min
- **Dependencies**: T001
- **Beschrijving**: Maak `.env.local.example` met alle env vars. Maak `src/lib/supabase.ts` met browser client en server client (cookies-based via `@supabase/ssr`)
- **Acceptance criteria**:
  - [x] `.env.local.example` bevat alle 12 env vars
  - [x] `createBrowserClient()` en `createServerClient()` exporteren correct
  - [x] TypeScript types voor Supabase database schema

### T003 — Database schema SQL ✅
- **Tijd**: 20 min
- **Dependencies**: T002
- **Beschrijving**: Schrijf `supabase/schema.sql` met CREATE TABLE statements voor members, scans, payments + RLS policies. Admin email lijst als configureerbare check (niet hardcoded)
- **Acceptance criteria**:
  - [x] 3 tabellen met correcte kolommen en constraints
  - [x] RLS enabled op alle tabellen
  - [x] Policies: eigen data voor leden, alles voor admin
  - [x] SQL is idempotent (IF NOT EXISTS)

### T004 — Constants en types ✅
- **Tijd**: 15 min
- **Dependencies**: geen
- **Beschrijving**: Maak `src/lib/constants.ts` (commissies, rollen, ranks) en `src/types/database.ts` (Member, Scan, Payment, Role types)
- **Acceptance criteria**:
  - [x] Commissie lijst met naam + beschrijving
  - [x] Rank systeem: Starter → Bronze → Silver → Gold → Platinum → Diamond
  - [x] TypeScript types matchen database schema

### T005 — Zustand stores ✅
- **Tijd**: 20 min
- **Dependencies**: T004
- **Beschrijving**: Maak `src/stores/useAuthStore.ts`, `useAdminStore.ts`, `useScannerStore.ts`
- **Acceptance criteria**:
  - [x] useAuthStore: session, role, membership status
  - [x] useAdminStore: filters, zoekterm, geselecteerd lid, paginatie
  - [x] useScannerStore: actief event, laatste scan, scanner status

---

## Fase B: Auth

### T006 — NextAuth.js v5 config ✅
- **Tijd**: 30 min
- **Dependencies**: T002
- **Beschrijving**: Maak `src/lib/auth.ts` met NextAuth config. Microsoft Azure AD provider + credentials provider (bcrypt). Maak `src/app/api/auth/[...nextauth]/route.ts`
- **Acceptance criteria**:
  - [x] Microsoft OAuth login werkt (redirect naar Microsoft, callback verwerkt)
  - [x] Credentials login werkt (email + wachtwoord, bcrypt verify)
  - [x] Session bevat user id, email, role
  - [x] Nieuwe Microsoft users worden aangemaakt in Supabase

### T007 — Auth middleware ✅
- **Tijd**: 20 min
- **Dependencies**: T006
- **Beschrijving**: Maak `src/middleware.ts` met route protection: /dashboard/* vereist session, /admin/* vereist admin role, /login redirect als ingelogd
- **Acceptance criteria**:
  - [x] Niet-ingelogde users → redirect /login bij /dashboard/*
  - [x] Niet-admin users → redirect /dashboard bij /admin/*
  - [x] Ingelogde users → redirect /dashboard bij /login
  - [x] Leden die al betaald hebben → redirect /dashboard bij /lid-worden

### T008 — Login pagina ✅
- **Tijd**: 25 min
- **Dependencies**: T006
- **Beschrijving**: Maak `src/app/login/page.tsx` en `src/components/auth/LoginForm.tsx`. Microsoft knop (primair, groot) + email/wachtwoord form (secundair). Dark theme, brand styling
- **Acceptance criteria**:
  - [x] Microsoft login knop werkt
  - [x] Email + wachtwoord form met validatie
  - [x] Error states (verkeerd wachtwoord, onbekend email)
  - [x] Link naar /lid-worden voor nieuwe users
  - [x] Responsive (mobile first)

---

## Fase C: Registratie & Betaling

### T009 — Registratie flow: stap 1 (Welkom) ✅
- **Tijd**: 25 min
- **Dependencies**: T006
- **Beschrijving**: Maak `src/app/lid-worden/page.tsx` en `src/components/auth/RegisterFlow.tsx`. Stap 1: email (vooringevuld bij Microsoft), studentnummer (optioneel), volgende knop. Fullscreen, dark theme
- **Acceptance criteria**:
  - [x] Email vooringevuld als via Microsoft ingelogd
  - [x] Studentnummer optioneel
  - [x] Validatie op email format
  - [x] Stap indicator (1/4)
  - [x] Smooth transitie naar stap 2

### T010 — Registratie flow: stap 2 (Kies je class) ✅
- **Tijd**: 30 min
- **Dependencies**: T009
- **Beschrijving**: Maak `src/components/auth/ClassSelector.tsx`. Grid van commissie kaarten (GameIT, AI4HvA, PR & Socials, Fun & Events, Educatie, Sponsoring, Eigen idee). Docent toggle. Skip link
- **Acceptance criteria**:
  - [x] 7 commissie kaarten met icon/emoji en beschrijving
  - [x] Hover effect, geselecteerde kaart met gouden border
  - [x] "Eigen idee" toont tekstveld
  - [x] "Ik ben docent" toggle apart
  - [x] "Skip" link onderaan
  - [x] Rol wordt bepaald: commissie → contributor, docent → mentor, skip → member

### T011 — Registratie flow: stap 3 & 4 (Wachtwoord & Betalen) ✅
- **Tijd**: 25 min
- **Dependencies**: T010
- **Beschrijving**: Stap 3: wachtwoord aanmaken (skip bij Microsoft). Samenvatting van gekozen rol/commissie. Stap 4: prijs (10 euro/jaar), akkoord checkbox, betaalknop
- **Acceptance criteria**:
  - [x] Wachtwoord veld met minimaal 8 tekens validatie
  - [x] Skip wachtwoord stap bij Microsoft login
  - [x] Samenvatting toont rol + commissie
  - [x] Akkoord checkbox verplicht
  - [x] "Betaal en word lid" knop triggert Stripe Checkout

### T012 — Members API route ✅
- **Tijd**: 20 min
- **Dependencies**: T003, T006
- **Beschrijving**: Maak `src/app/api/members/route.ts` (GET voor admin, POST voor registratie) en `src/app/api/members/[id]/route.ts` (PATCH voor profiel/admin updates)
- **Acceptance criteria**:
  - [x] POST maakt nieuw lid aan in Supabase
  - [x] GET retourneert ledenlijst (admin only, met filters)
  - [x] PATCH update lid (eigen profiel of admin)
  - [x] Auth check op alle routes
  - [x] Response format: `{ data, error, meta }`

### T013 — Stripe setup en checkout ✅
- **Tijd**: 30 min
- **Dependencies**: T012
- **Beschrijving**: Maak `src/lib/stripe.ts` en `src/app/api/stripe/create-checkout/route.ts`. Start Stripe Checkout sessie met subscription mode, 10 euro/jaar, SEPA + iDEAL + card
- **Acceptance criteria**:
  - [x] Stripe client initialiseert correct
  - [x] Checkout sessie aanmaken met member metadata
  - [x] Redirect naar Stripe Checkout werkt
  - [x] Success URL: /dashboard?welcome=true
  - [x] Cancel URL: /lid-worden

### T014 — Stripe webhooks ✅
- **Tijd**: 30 min
- **Dependencies**: T013
- **Beschrijving**: Maak `src/app/api/stripe/webhook/route.ts`. Verwerk: checkout.session.completed, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted
- **Acceptance criteria**:
  - [x] Webhook signature verificatie
  - [x] checkout.session.completed → membership_active = true
  - [x] invoice.payment_succeeded → verleng membership_expires_at
  - [x] invoice.payment_failed → markeer als verlopen
  - [x] customer.subscription.deleted → membership_active = false
  - [x] Idempotent (zelfde event 2x verwerken is safe)

### T015 — Stripe Customer Portal ✅
- **Tijd**: 15 min
- **Dependencies**: T013
- **Beschrijving**: Maak `src/app/api/stripe/portal/route.ts`. Redirect ingelogd lid naar Stripe Customer Portal
- **Acceptance criteria**:
  - [x] Auth check (moet ingelogd zijn)
  - [x] Redirect naar Stripe portal met return URL /dashboard/profiel
  - [x] Lid kan betaalmethode wijzigen en opzeggen

---

## Fase D: Dashboard

### T016 — Dashboard layout en navigatie ✅
- **Tijd**: 25 min
- **Dependencies**: T007
- **Beschrijving**: Maak `src/components/dashboard/DashboardNav.tsx` en layout voor (auth) route group. Sidebar op desktop, bottom nav op mobile. Links: Dashboard, Ledenpas, Profiel, Admin (conditioneel)
- **Acceptance criteria**:
  - [x] Sidebar op desktop (vast, links)
  - [x] Bottom nav op mobile (fixed bottom)
  - [x] Active state op huidige route
  - [x] Admin link alleen zichtbaar voor admins
  - [x] Dark theme, brand styling

### T017 — Dashboard homepage ✅
- **Tijd**: 25 min
- **Dependencies**: T016, T012
- **Beschrijving**: Maak `src/app/dashboard/page.tsx`, `src/components/dashboard/StatsGrid.tsx`, `src/components/dashboard/RecentActivity.tsx`. Welkomst, mini ledenpas preview, stats, recente activiteit
- **Acceptance criteria**:
  - [x] Welkomstbericht met naam/email
  - [x] Mini MemberCard preview (klikbaar → /dashboard/ledenpas)
  - [x] Stats: punten, rank, lid sinds, commissie
  - [x] Recente scans/punten lijst
  - [x] Welcome banner bij ?welcome=true (na registratie)

### T018 — Ledenpas pagina ✅
- **Tijd**: 25 min
- **Dependencies**: T016
- **Beschrijving**: Maak `src/app/dashboard/ledenpas/page.tsx` en `src/components/dashboard/MemberCard.tsx`. QR code (react-qr-code), donkere kaart met {SIT} logo, naam, studentnummer, rol badge, rank
- **Acceptance criteria**:
  - [x] QR code met JSON data (member id, email, timestamp)
  - [x] Kaart met SIT branding, naam, studentnummer, rol, rank
  - [x] Rank badge kleurt per level
  - [ ] Download als PNG knop (should-have SH-04)
  - [x] Mobile-friendly (kaart past op scherm)

### T019 — Profiel pagina ✅
- **Tijd**: 20 min
- **Dependencies**: T016, T015
- **Beschrijving**: Maak `src/app/dashboard/profiel/page.tsx`. Toon email (readonly), studentnummer (edit), commissie (dropdown), lidmaatschap status, "Beheer abonnement" knop → Stripe Portal
- **Acceptance criteria**:
  - [x] Profiel form met save knop
  - [x] Studentnummer en commissie aanpasbaar
  - [ ] Wachtwoord wijzigen (oud + nieuw, min 8 tekens)
  - [x] Lidmaatschap status: actief/verlopen + vervaldatum
  - [x] Stripe Portal link werkt

---

## Fase E: Admin

### T020 — Admin layout en navigatie ✅
- **Tijd**: 15 min
- **Dependencies**: T007
- **Beschrijving**: Maak `src/components/admin/AdminNav.tsx` en layout voor admin routes. Links: Overview, Leden, Scanner, Events
- **Acceptance criteria**:
  - [x] Admin nav met active states
  - [x] Desktop-first layout
  - [x] Alleen toegankelijk voor admin users

### T021 — Admin overview ✅
- **Tijd**: 25 min
- **Dependencies**: T020, T012
- **Beschrijving**: Maak `src/app/admin/page.tsx` en `src/components/admin/StatsOverview.tsx`. Totaal leden, actieve leden, nieuwe leden deze maand, leden per commissie, leden per rol
- **Acceptance criteria**:
  - [x] Stat cards: totaal, actief, nieuw deze maand
  - [ ] Inkomsten overzicht (totaal, deze maand)
  - [x] Leden per commissie breakdown
  - [x] Leden per rol (Member/Contributor/Mentor)
  - [x] Data uit Supabase queries

### T022 — Ledenlijst ✅
- **Tijd**: 30 min
- **Dependencies**: T020, T012
- **Beschrijving**: Maak `src/app/admin/leden/page.tsx` en `src/components/admin/MemberTable.tsx`. Tabel met zoekbalk, filters (status, rol, commissie), sorteerbaar
- **Acceptance criteria**:
  - [x] Tabel: email, studentnummer, rol, commissie, punten, status, lid sinds
  - [x] Zoekbalk (zoekt op email en studentnummer)
  - [x] Filters: actief/verlopen, rol, commissie
  - [x] Sorteerbaar op kolommen
  - [x] Zustand store voor filters/paginatie

### T023 — Lid detail modal ✅
- **Tijd**: 25 min
- **Dependencies**: T022
- **Beschrijving**: Maak `src/components/admin/MemberDetailModal.tsx`. Klik op lid in tabel → modal met alle info, punten toekennen, rol wijzigen, lidmaatschap handmatig verlengen
- **Acceptance criteria**:
  - [x] Modal met alle lid info
  - [x] Punten toekennen form (aantal + reden)
  - [x] Rol wijzigen dropdown
  - [x] Lidmaatschap handmatig verlengen knop
  - [x] Sluit na actie met success feedback

### T024 — QR Scanner ✅
- **Tijd**: 30 min
- **Dependencies**: T020
- **Beschrijving**: Maak `src/app/admin/scanner/page.tsx` en `src/components/admin/QRScanner.tsx`. Camera scanner (html5-qrcode), handmatige invoer fallback, punten toekennen, event selectie
- **Acceptance criteria**:
  - [x] Camera scanner opent en leest QR codes
  - [x] Handmatige member ID invoer als fallback
  - [x] Punten invoer (aantal + reden)
  - [x] Event selectie dropdown
  - [x] Success/error feedback na scan
  - [x] Zustand store voor scanner state

### T025 — Scans API route ✅
- **Tijd**: 15 min
- **Dependencies**: T003, T006
- **Beschrijving**: Maak `src/app/api/scans/route.ts` (POST voor punten) en `src/app/api/scans/[memberId]/route.ts` (GET voor geschiedenis)
- **Acceptance criteria**:
  - [x] POST maakt scan aan + update member points
  - [x] GET retourneert scan geschiedenis per lid
  - [x] Admin-only check op POST
  - [x] Response format: `{ data, error, meta }`

### T026 — Admin events pagina ✅
- **Tijd**: 20 min
- **Dependencies**: T020
- **Beschrijving**: Maak `src/app/admin/events/page.tsx`. Events aanmaken voor scanning, actief event selecteren, scan geschiedenis per event
- **Acceptance criteria**:
  - [x] Event aanmaken form (naam, datum)
  - [x] Actief event selecteren (voor scanner)
  - [ ] Scan geschiedenis per event
  - [x] Events opgeslagen in Zustand

---

## Fase F: Polish & Deploy

### T027 — Error handling en loading states ✅
- **Tijd**: 25 min
- **Dependencies**: T009-T026
- **Beschrijving**: Voeg loading skeletons, error boundaries en 404 pagina toe
- **Acceptance criteria**:
  - [x] Loading skeletons op dashboard en admin
  - [x] Error boundaries met fallback UI (dashboard + admin)
  - [x] Form validatie met foutmeldingen (inline in components)
  - [x] 404 pagina voor onbekende routes

### T028 — Vercel deploy en env vars
- **Tijd**: 20 min
- **Dependencies**: T027
- **Beschrijving**: Configureer Vercel environment variables, test build, deploy naar preview. Check Stripe webhook URL, Supabase connection, NextAuth callback URLs
- **Acceptance criteria**:
  - [ ] Alle env vars in Vercel dashboard
  - [ ] Build slaagt op Vercel
  - [ ] Stripe webhook endpoint geconfigureerd (productie URL)
  - [ ] NextAuth callback URLs correct
  - [ ] Supabase connection werkt vanuit Vercel
  - [ ] Preview deploy draait zonder errors
