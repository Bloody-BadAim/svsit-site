# SIT Leden Portaal: Claude Code Prompt

## Context

Je bouwt het ledenportaal voor SIT (Studievereniging ICT), de studievereniging voor HBO-ICT aan de HvA. Dit wordt onderdeel van de bestaande Next.js site op svsit-site.vercel.app. De huidige site heeft een homepage met hero, events, en "word lid" sectie. Nu bouw je de backend: registratie, login, ledenpas, admin panel.

Het vervangt een apart platform (sitlid.nl) dat draaide op Vite + Express + SQLite. We bouwen alles opnieuw in de bestaande Next.js codebase met Supabase als database.

## Stap 0: Lees de Figma brand kit via MCP

Gebruik ALTIJD als eerste stap de Figma MCP tools om de brand kit te lezen:
- `get_metadata` met nodeId `0:1` voor het Figma bestand (file key: `tIr6cbTBLa26HIsLkW2vyG`)
- `get_variable_defs` voor kleuren en design tokens
- `get_design_context` op relevante frames voor component styling

Pas alle UI componenten aan op de brand kit kleuren en typografie.

## Wat je bouwt

Het ledenportaal met deze paginas:
- `/lid-worden` — Registratie flow (onboarding)
- `/login` — Inloggen
- `/dashboard` — Leden dashboard (na login)
- `/dashboard/ledenpas` — QR code digitale ledenpas
- `/dashboard/profiel` — Profiel bewerken
- `/admin` — Admin panel (bestuur only)

## Tech stack

Gebruik de BESTAANDE site stack en voeg toe:
- Next.js 14+ App Router (al aanwezig)
- TypeScript (al aanwezig)
- Tailwind CSS (al aanwezig)
- **Supabase** — PostgreSQL database + Row Level Security
- **NextAuth.js v5 (Auth.js)** — Authenticatie met Microsoft OAuth + credentials
- **Stripe** — Betalingen met SEPA recurring (jaarlijkse automatische incasso)
- **react-qr-code** — QR code generatie voor ledenpas

## Database (Supabase)

### Schema

```sql
-- Leden tabel
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  student_number TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'contributor', 'mentor')),
  commissie TEXT,
  commissie_voorstel TEXT,
  points INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  membership_active BOOLEAN DEFAULT false,
  membership_started_at TIMESTAMPTZ,
  membership_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans tabel (voor puntensysteem)
CREATE TABLE scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  scanned_by TEXT,
  event_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Betalingen tabel
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Leden kunnen alleen hun eigen data zien
CREATE POLICY "members_own_data" ON members
  FOR SELECT USING (auth.uid()::text = id::text);

-- Admin policy (email check tegen bestuur lijst)
CREATE POLICY "admin_all_members" ON members
  FOR ALL USING (
    auth.jwt()->>'email' IN (
      'matin.khajehfard@hva.nl',
      'voorzitter@svsit.nl'
    )
  );
```

### Membership rollen

| Rol | Naam in UI | Beschrijving | Prijs |
|---|---|---|---|
| `member` | Member | Gewoon lid, toegang tot events en community | 10 euro/jaar |
| `contributor` | Contributor | Actief commissielid, bouwt mee aan SIT | 10 euro/jaar |
| `mentor` | Mentor | Docent/begeleider, support rol | 10 euro/jaar |

De rol wordt automatisch bepaald:
- Kiest een commissie bij registratie → `contributor`
- Geeft aan docent te zijn → `mentor`
- Geen van beide → `member`

## Authenticatie (NextAuth.js v5)

### Providers

1. **Microsoft Azure AD** (primair)
   - HvA studenten loggen in met hun @hva.nl Microsoft account
   - Gebruik de `azure-ad` provider
   - Tenant: `common` (multi-tenant, accepteert alle Microsoft accounts)
   - Dit is de hoofdweg: 1 klik login

2. **Credentials** (fallback)
   - Email + wachtwoord voor alumni, externe leden, mensen zonder Microsoft
   - Wachtwoord hashing via bcrypt
   - Minimaal 8 tekens

### Flow

- Nieuwe gebruiker logt in via Microsoft → wordt doorgestuurd naar `/lid-worden` als ze nog geen lid zijn
- Bestaand lid logt in → gaat naar `/dashboard`
- Admin check: email staat in bestuur lijst → krijgt admin toegang

## Registratie flow (`/lid-worden`)

### Design

Fullscreen stappen, een per scherm. Dezelfde dark theme als de homepage. Minimaal, clean, developer aesthetic. Geen corporate formulier gevoel. Elke stap heeft een grote heading en minimale input.

### Stappen

#### Stap 1: "Welkom bij {SIT}"
- Email (vooringevuld als Microsoft login)
- Studentnummer (optioneel, placeholder: "Niet verplicht")
- Grote "Volgende" knop

#### Stap 2: "Kies je class"
- Heading: "Wil je actief meebouwen aan SIT?"
- Subtext: "Kies een commissie om als Contributor te joinen. Of ga door als Member."
- Grid/lijst van commissies als selecteerbare kaarten:
  - **GameIT** — "Game nights, toernooien, en game dev showcases"
  - **AI4HvA** — "AI workshops, hackathons, en de AI community"
  - **PR & Socials** — "Content maken, socials beheren, SIT zichtbaar maken"
  - **Fun & Events** — "Borrels, kroegentochten, en grote events organiseren"
  - **Educatie** — "Workshops, lezingen, en skill development"
  - **Sponsoring** — "Bedrijven benaderen, partnerships opzetten"
  - **Eigen idee** — Tekstveld voor eigen commissie voorstel
- Een "Ik ben docent" optie (apart, niet als commissie maar als toggle/checkbox)
- "Ik wil gewoon lid zijn, skip" link onderaan
- Visueel: elke commissie kaart heeft een icon of emoji en een korte beschrijving. Hover effect. Geselecteerde kaart heeft gouden border (accent kleur).

#### Stap 3: "Bijna klaar"
- Wachtwoord aanmaken (als niet via Microsoft ingelogd)
- Als via Microsoft: skip dit, wachtwoord niet nodig
- Samenvatting: "Je wordt [Member/Contributor/Mentor]"
- Als Contributor: "Commissie: [gekozen commissie]"

#### Stap 4: "Activeer je lidmaatschap"
- Prijs: 10 euro per jaar
- Checkbox: "Ik ga akkoord met de voorwaarden en machtig SIT om jaarlijks 10 euro af te schrijven"
- Link naar voorwaarden (kan een simpele pagina zijn)
- "Betaal en word lid" knop → redirect naar Stripe Checkout
- Na succesvolle betaling: redirect naar `/dashboard` met welkomstbericht

### Na registratie

- Lid wordt aangemaakt in Supabase met juiste rol
- Stripe subscription wordt gestart (SEPA recurring, jaarlijks)
- Welkomstmail (optioneel, later toevoegen)
- Redirect naar dashboard

## Stripe integratie

### Setup

- Stripe Checkout Sessions voor eerste betaling
- SEPA Direct Debit als betaalmethode (naast iDEAL en card)
- Subscription mode: `mode: 'subscription'` met `recurring: { interval: 'year' }`
- Webhook endpoint: `/api/stripe/webhook`

### Webhook events

- `checkout.session.completed` → activeer lidmaatschap
- `invoice.payment_succeeded` → verleng lidmaatschap
- `invoice.payment_failed` → markeer als verlopen
- `customer.subscription.deleted` → deactiveer lidmaatschap

### Prijzen

Een Stripe Product: "SIT Lidmaatschap"
Een Stripe Price: 10 euro/jaar, recurring

### API routes

```
/api/stripe/create-checkout — Start checkout sessie
/api/stripe/webhook — Ontvang Stripe events
/api/stripe/portal — Redirect naar Stripe Customer Portal (leden kunnen zelf opzeggen/betaalmethode wijzigen)
```

## Leden dashboard (`/dashboard`)

### Layout

Sidebar navigatie (desktop) / bottom nav (mobile) met:
- Dashboard (home)
- Ledenpas
- Profiel
- Admin (alleen zichtbaar voor bestuur)

### Dashboard pagina

- Welkomst heading met naam of email
- Member card preview (kleine versie van de QR ledenpas)
- Stats: punten, rank, lid sinds, commissie
- Recente activiteit (laatste scans/punten)
- Aankomende events (pull van de homepage events data)

### Ledenpas (`/dashboard/ledenpas`)

- Grote QR code (react-qr-code)
- QR data: JSON met member ID, email, timestamp
- Visueel: donkere kaart met {SIT} logo, naam, studentnummer, rol badge, rank
- Rank systeem: elke 5 punten = level up
  - Ranks: Starter → Bronze → Silver → Gold → Platinum → Diamond
- Download knop (QR als PNG)
- Share knop

### Profiel (`/dashboard/profiel`)

- Email (niet aanpasbaar)
- Studentnummer (aanpasbaar)
- Commissie (aanpasbaar, dropdown)
- Wachtwoord wijzigen
- Lidmaatschap status (actief/verlopen, vervaldatum)
- "Beheer abonnement" knop → Stripe Customer Portal

## Admin panel (`/admin`)

### Toegang

Alleen voor bestuurleden. Check op email:
- matin.khajehfard@hva.nl
- riley (email toevoegen)
- idil (email toevoegen)
- hugo (email toevoegen)

Configureerbaar via Supabase tabel of environment variable.

### Admin paginas

#### Overview (`/admin`)
- Totaal leden, actieve leden, nieuwe leden deze maand
- Inkomsten overzicht (totaal, deze maand)
- Leden per commissie breakdown
- Leden per rol (Member/Contributor/Mentor)

#### Ledenlijst (`/admin/leden`)
- Tabel met alle leden
- Kolommen: email, studentnummer, rol, commissie, punten, status, lid sinds
- Zoekbalk
- Filters: status (actief/verlopen), rol, commissie
- Excel export knop
- Klik op lid → detail modal met:
  - Alle info
  - Punten toekennen
  - Rol wijzigen
  - Lidmaatschap handmatig verlengen

#### QR Scanner (`/admin/scanner`)
- Camera scanner (html5-qrcode)
- Handmatige invoer als fallback
- Punten toekennen bij scan
- Event selectie (welk event wordt gescand)

#### Events (`/admin/events`)
- Events aanmaken voor scanning
- Actief event selecteren
- Scan geschiedenis per event

## Projectstructuur

```
src/
  app/
    (public)/
      page.tsx              # Bestaande homepage
      lid-worden/
        page.tsx            # Registratie flow
      login/
        page.tsx            # Login pagina
    (auth)/
      dashboard/
        page.tsx            # Leden dashboard
        ledenpas/
          page.tsx          # QR ledenpas
        profiel/
          page.tsx          # Profiel bewerken
      admin/
        page.tsx            # Admin overview
        leden/
          page.tsx          # Ledenlijst
        scanner/
          page.tsx          # QR scanner
        events/
          page.tsx          # Event beheer
    api/
      auth/
        [...nextauth]/
          route.ts          # NextAuth.js handler
      stripe/
        create-checkout/
          route.ts          # Start Stripe checkout
        webhook/
          route.ts          # Stripe webhooks
        portal/
          route.ts          # Stripe customer portal
      members/
        route.ts            # CRUD members
      scans/
        route.ts            # Scans/punten
  components/
    auth/
      LoginForm.tsx
      RegisterFlow.tsx
      ClassSelector.tsx     # Commissie keuze component
    dashboard/
      MemberCard.tsx        # QR ledenpas kaart
      StatsGrid.tsx
      RecentActivity.tsx
      DashboardNav.tsx      # Sidebar/bottom nav
    admin/
      AdminNav.tsx
      MemberTable.tsx
      QRScanner.tsx
      StatsOverview.tsx
      MemberDetailModal.tsx
  lib/
    supabase.ts             # Supabase client
    stripe.ts               # Stripe helpers
    auth.ts                 # NextAuth config
    constants.ts            # Commissie lijst, rollen, etc.
```

## Design richtlijnen

- Gebruik DEZELFDE design taal als de homepage: dark theme, developer aesthetic, {SIT} branding
- Kleuren via CSS custom properties (al gedefinieerd in globals.css)
- Fonts: JetBrains Mono voor code/mono, Big Shoulders Display voor headings
- Geen AI slop: geen uniform card grids, geen centered-everything, geen gradient buttons
- De "Kies je class" stap moet het meest visuele moment zijn. Maak de commissie kaarten interessant.
- Dashboard moet clean en functioneel zijn. Geen overdreven animaties in de app, die zijn voor de homepage.
- Admin panel: functioneel boven mooi. Data moet snel leesbaar zijn.
- Mobile first voor het leden dashboard (studenten gebruiken telefoon)
- Desktop first voor admin panel (bestuur gebruikt laptop)

## Data migratie

Er zijn 130+ bestaande leden in een sheet1.json bestand. Migreer ALLEEN actieve/betalende leden naar Supabase. Maak een migratie script:

```
/scripts/migrate-members.ts
```

Dit script:
1. Leest sheet1.json
2. Filtert op actieve leden (niet test accounts, niet lege emails)
3. Voegt ze toe aan Supabase members tabel
4. Zet ze als `member` rol, `membership_active: false` (ze moeten opnieuw betalen)

## Environment variables nodig

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://svsit.nl
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=common

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=           # De recurring 10 euro/jaar price
```

## Volgorde van bouwen

1. **Supabase setup** — Database schema, RLS policies, client config
2. **Auth** — NextAuth.js met Microsoft + credentials, middleware voor protected routes
3. **Registratie flow** — `/lid-worden` met alle stappen
4. **Stripe** — Checkout, webhooks, subscription management
5. **Dashboard** — Leden dashboard met ledenpas, profiel
6. **Admin** — Admin panel met ledenlijst, scanner, stats
7. **Migratie** — Script om bestaande leden over te zetten
8. **Polish** — Error handling, loading states, edge cases

## Belangrijk

- Begin met auth + database. Als dat werkt, bouw de rest eromheen.
- Test elke stap voordat je doorgaat.
- Commit na elke werkende feature.
- Geen hardcoded credentials. Alles via env vars.
- Supabase RLS is essentieel. Leden mogen ALLEEN hun eigen data zien.
- Stripe webhooks moeten idempotent zijn (zelfde event twee keer verwerken mag geen problemen geven).
- De admin email lijst moet configureerbaar zijn, niet hardcoded in de policy.
