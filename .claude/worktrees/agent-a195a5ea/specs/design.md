# Design — SIT Leden Portaal

**Status**: APPROVED
**Laatst bijgewerkt**: 2026-03-30
**Auteur**: Matin Khajehfard

## 1. Figma

- **File**: SIT Brand Kit
- **File key**: `tIr6cbTBLa26HIsLkW2vyG`
- **Relevante nodes**:
  - `17:3` — Color System (neutral scale, primary gold, accent RGB)
  - `17:4` — Typography (Big Shoulders Display, JetBrains Mono, Inter)
  - `17:5` — Design Elements (streaks, spacing, code blocks)

### Design taal

- Dark theme (#090908 achtergrond)
- Primary: Gold #F29E18 (logo braces, CTAs, highlights, active states)
- Accenten: Rood #EF4444 (error/alert), Groen #22C55E (success), Blauw #3B82F6 (info/links)
- Fonts: Big Shoulders Display (headings), JetBrains Mono (code/mono/logo), Inter (body)
- Developer aesthetic als sfeer, niet als barriere
- Dezelfde look & feel als de homepage

## 2. Tech Stack

| Laag | Technologie |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, React Compiler) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | NextAuth.js v5 (Microsoft Azure AD + credentials) |
| Betalingen | Stripe (SEPA recurring, iDEAL, card) |
| State | Zustand (client-side: session cache, admin filters, scanner state) |
| QR Code | react-qr-code |
| QR Scanner | html5-qrcode |
| Hosting | Vercel |

## 3. Database Schema

### Tabel: `members`

| Kolom | Type | Details |
|---|---|---|
| id | UUID | PK, gen_random_uuid() |
| email | TEXT | UNIQUE, NOT NULL |
| student_number | TEXT | optioneel |
| role | TEXT | 'member' \| 'contributor' \| 'mentor', default 'member' |
| commissie | TEXT | gekozen commissie |
| commissie_voorstel | TEXT | eigen idee tekstveld |
| points | INTEGER | default 0 |
| stripe_customer_id | TEXT | Stripe koppeling |
| stripe_subscription_id | TEXT | Stripe koppeling |
| membership_active | BOOLEAN | default false |
| membership_started_at | TIMESTAMPTZ | |
| membership_expires_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | default NOW() |
| updated_at | TIMESTAMPTZ | default NOW() |

### Tabel: `scans`

| Kolom | Type | Details |
|---|---|---|
| id | UUID | PK, gen_random_uuid() |
| member_id | UUID | FK → members(id) ON DELETE CASCADE |
| points | INTEGER | NOT NULL |
| reason | TEXT | NOT NULL |
| scanned_by | TEXT | admin email |
| event_name | TEXT | |
| created_at | TIMESTAMPTZ | default NOW() |

### Tabel: `payments`

| Kolom | Type | Details |
|---|---|---|
| id | UUID | PK, gen_random_uuid() |
| member_id | UUID | FK → members(id) ON DELETE CASCADE |
| stripe_session_id | TEXT | UNIQUE |
| stripe_subscription_id | TEXT | |
| amount | DECIMAL(10,2) | NOT NULL |
| status | TEXT | default 'pending' |
| created_at | TIMESTAMPTZ | default NOW() |
| paid_at | TIMESTAMPTZ | |

### Row Level Security

- `members`: leden zien alleen eigen data (`auth.uid() = id`)
- `members`: admin policy voor bestuur emails (configureerbaar)
- `scans`: leden zien eigen scans, admin ziet alles
- `payments`: leden zien eigen betalingen, admin ziet alles

## 4. API Endpoints

### Auth

| Method | Route | Beschrijving |
|---|---|---|
| * | `/api/auth/[...nextauth]` | NextAuth.js handler (Microsoft + credentials) |

### Stripe

| Method | Route | Beschrijving |
|---|---|---|
| POST | `/api/stripe/create-checkout` | Start Stripe Checkout sessie (10 euro/jaar) |
| POST | `/api/stripe/webhook` | Ontvang Stripe webhook events |
| POST | `/api/stripe/portal` | Redirect naar Stripe Customer Portal |

### Members

| Method | Route | Beschrijving |
|---|---|---|
| GET | `/api/members` | Lijst leden (admin only) |
| POST | `/api/members` | Nieuw lid aanmaken (registratie) |
| PATCH | `/api/members/[id]` | Lid updaten (profiel of admin) |

### Scans

| Method | Route | Beschrijving |
|---|---|---|
| POST | `/api/scans` | Punten toekennen (admin, via QR scan) |
| GET | `/api/scans/[memberId]` | Scan geschiedenis van lid |

## 5. Component Structuur

```
src/
  app/
    (public)/
      page.tsx                    # Bestaande homepage
      lid-worden/
        page.tsx                  # Registratie flow (4 stappen)
      login/
        page.tsx                  # Login pagina
    (auth)/
      dashboard/
        page.tsx                  # Leden dashboard
        ledenpas/
          page.tsx                # QR ledenpas
        profiel/
          page.tsx                # Profiel bewerken
      admin/
        page.tsx                  # Admin overview (stats)
        leden/
          page.tsx                # Ledenlijst + detail modal
        scanner/
          page.tsx                # QR scanner
        events/
          page.tsx                # Event beheer
    api/
      auth/[...nextauth]/route.ts
      stripe/
        create-checkout/route.ts
        webhook/route.ts
        portal/route.ts
      members/
        route.ts
        [id]/route.ts
      scans/
        route.ts
        [memberId]/route.ts
  components/
    auth/
      LoginForm.tsx               # Microsoft + credentials login
      RegisterFlow.tsx            # 4-stappen registratie
      ClassSelector.tsx           # Commissie keuze kaarten
    dashboard/
      MemberCard.tsx              # QR ledenpas kaart
      StatsGrid.tsx               # Punten, rank, lid sinds
      RecentActivity.tsx          # Laatste scans/activiteit
      DashboardNav.tsx            # Sidebar (desktop) / bottom nav (mobile)
    admin/
      AdminNav.tsx                # Admin navigatie
      MemberTable.tsx             # Ledenlijst tabel met filters
      QRScanner.tsx               # Camera scanner + handmatige invoer
      StatsOverview.tsx           # Dashboard stats (leden, inkomsten)
      MemberDetailModal.tsx       # Lid detail + punten/rol wijzigen
  lib/
    supabase.ts                   # Supabase client (browser + server)
    stripe.ts                     # Stripe helpers
    auth.ts                       # NextAuth.js v5 config
    constants.ts                  # Commissies, rollen, ranks
  stores/
    useAuthStore.ts               # Session cache
    useAdminStore.ts              # Admin filters, geselecteerd lid
    useScannerStore.ts            # Scanner state, actief event
```

## 6. State Management

**Zustand** voor client-side state:

| Store | Doel |
|---|---|
| `useAuthStore` | Gecachte session data, user role, membership status |
| `useAdminStore` | Ledenlijst filters, zoekterm, geselecteerd lid, paginatie |
| `useScannerStore` | Actief event, laatste scan resultaat, scanner status |

Server-side data via:
- NextAuth.js session (auth state)
- Supabase queries in Server Components (database reads)
- Route Handlers voor mutations (POST/PATCH)

## 7. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth.js v5
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://svsit.nl
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=common

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
```

## 8. Middleware & Auth Flow

```
middleware.ts
├── /dashboard/*  → check session, redirect naar /login als niet ingelogd
├── /admin/*      → check session + admin role, redirect naar /dashboard als geen admin
├── /lid-worden   → als al lid en betaald → redirect naar /dashboard
└── /login        → als al ingelogd → redirect naar /dashboard
```

### Auth flow

1. Student klikt "Word lid" → `/lid-worden`
2. Microsoft OAuth of email registratie
3. 4-stappen flow: welkom → commissie → wachtwoord → betalen
4. Stripe Checkout → webhook activeert lidmaatschap
5. Redirect naar `/dashboard`

### Login flow

1. Student gaat naar `/login`
2. Microsoft OAuth (1 klik) of email + wachtwoord
3. Nieuw account zonder lid? → redirect `/lid-worden`
4. Actief lid? → redirect `/dashboard`
