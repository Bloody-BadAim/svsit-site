# Role & Commissie Systeem — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin kan rollen en commissies toewijzen. Leden kunnen meerdere commissies hebben. Admin status verhuist van hardcoded email lijst naar database veld.

**Architecture:** Voeg `is_admin` boolean toe aan members tabel. Maak `member_commissies` join tabel voor many-to-many relatie. Update auth.ts om admin status uit DB te lezen (met ADMIN_EMAILS als bootstrap fallback). Update admin dashboard voor rol/commissie/admin management.

**Tech Stack:** Supabase (PostgreSQL), NextAuth.js v5, Next.js 16 App Router, TypeScript

**Huidige staat:**
- Role: TEXT veld op members (`member | contributor | mentor`)
- Commissie: TEXT veld op members (single string, nullable)
- Admin: hardcoded in `ADMIN_EMAILS` array in constants.ts
- Commissie self-edit: al disabled voor niet-admins (recent fix)
- Org chart: hardcoded in orgData.ts (BUITEN SCOPE van dit plan)

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `supabase/admin-and-commissies.sql` | Create | DB migration: is_admin + commissies tables |
| `src/types/database.ts` | Modify | Add admin flag, update Member interface |
| `src/lib/constants.ts` | Modify | Keep ADMIN_EMAILS as bootstrap, add commissie helpers |
| `src/lib/auth.ts` | Modify | Read is_admin from DB instead of email list |
| `src/app/api/admin/members/[id]/role/route.ts` | Create | Admin-only: change member role |
| `src/app/api/admin/members/[id]/admin/route.ts` | Create | Admin-only: toggle admin status |
| `src/app/api/admin/members/[id]/commissies/route.ts` | Create | Admin-only: set member commissies |
| `src/app/api/members/[id]/route.ts` | Modify | Remove commissie from allowed self-edit fields, add commissies join in GET |
| `src/components/admin/MemberDetailModal.tsx` | Modify | Add admin toggle, multi-commissie selector |
| `src/components/admin/MemberTable.tsx` | Modify | Show admin badge, commissies list |
| `src/app/dashboard/profiel/page.tsx` | Modify | Show commissies from join table (read-only) |
| `src/app/dashboard/ledenpas/page.tsx` | Modify | Read commissies from join table |

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/admin-and-commissies.sql`

- [ ] **Step 1: Write migration SQL**

```sql
-- === ADMIN FLAG ===
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Bootstrap: zet bestaande admins op basis van ADMIN_EMAILS
UPDATE members SET is_admin = true WHERE email IN (
  'matin.khajehfard@hva.nl',
  'voorzitter@svsit.nl'
);

-- === COMMISSIES TABEL ===
CREATE TABLE IF NOT EXISTS commissies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  naam TEXT NOT NULL,
  beschrijving TEXT,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO commissies (slug, naam, beschrijving, emoji) VALUES
  ('gameit', 'GameIT', 'Game nights, toernooien, en game dev showcases', '🎮'),
  ('ai4hva', 'AI4HvA', 'AI workshops, hackathons, en de AI community', '🤖'),
  ('pr-socials', 'PR & Socials', 'Content maken, socials beheren, SIT zichtbaar maken', '📱'),
  ('fun-events', 'Fun & Events', 'Borrels, kroegentochten, en grote events organiseren', '🎉'),
  ('educatie', 'Educatie', 'Workshops, lezingen, en skill development', '📚'),
  ('sponsoring', 'Sponsoring', 'Bedrijven benaderen, partnerships opzetten', '🤝')
ON CONFLICT (slug) DO NOTHING;

-- === MEMBER <-> COMMISSIE JOIN TABEL ===
CREATE TABLE IF NOT EXISTS member_commissies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  commissie_id UUID NOT NULL REFERENCES commissies(id) ON DELETE CASCADE,
  role_in_commissie TEXT DEFAULT 'lid',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, commissie_id)
);

CREATE INDEX IF NOT EXISTS idx_mc_member ON member_commissies(member_id);
CREATE INDEX IF NOT EXISTS idx_mc_commissie ON member_commissies(commissie_id);

-- === MIGREER BESTAANDE COMMISSIE DATA ===
-- Kopieer single-string commissie naar join tabel
INSERT INTO member_commissies (member_id, commissie_id)
SELECT m.id, c.id
FROM members m
JOIN commissies c ON c.slug = m.commissie
WHERE m.commissie IS NOT NULL
ON CONFLICT DO NOTHING;

-- === RLS ===
ALTER TABLE commissies ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_commissies ENABLE ROW LEVEL SECURITY;

-- Commissies: iedereen kan lezen
CREATE POLICY "commissies_select_all" ON commissies FOR SELECT USING (true);

-- Member_commissies: eigen rijen lezen, service role voor writes
CREATE POLICY "mc_select" ON member_commissies FOR SELECT USING (true);
CREATE POLICY "mc_insert" ON member_commissies FOR INSERT WITH CHECK (false);
CREATE POLICY "mc_delete" ON member_commissies FOR DELETE USING (false);
```

- [ ] **Step 2: Run migration in Supabase SQL editor**

Open Supabase Dashboard → SQL Editor → paste en run. Controleer:
- `SELECT count(*) FROM commissies;` → 6
- `SELECT count(*) FROM member_commissies;` → ≥0 (migreerde bestaande data)
- `SELECT email, is_admin FROM members WHERE is_admin = true;` → 1-2 rijen

- [ ] **Step 3: Commit**

```bash
git add supabase/admin-and-commissies.sql
git commit -m "feat: admin flag + commissies tables migration"
```

---

### Task 2: Update TypeScript Types

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Add admin flag and commissie types**

In `src/types/database.ts`, voeg toe/wijzig:

```typescript
export type Role = 'member' | 'contributor' | 'mentor'

export interface Commissie {
  id: string
  slug: string
  naam: string
  beschrijving: string | null
  emoji: string | null
}

export interface MemberCommissie {
  commissie_id: string
  role_in_commissie: string
  commissies: Commissie
}

export interface Member {
  // ... bestaande velden ...
  is_admin: boolean
  // commissie: string | null  ← BEHOUD voor backwards compat, maar primary source is join tabel
  member_commissies?: MemberCommissie[]
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully (bestaande code gebruikt `member.commissie` nog, dat is OK)

- [ ] **Step 3: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add admin flag and commissie types"
```

---

### Task 3: Update Auth — Admin From Database

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Read is_admin from DB in JWT callback**

In de `jwt` callback (regel ~123-135), voeg `is_admin` toe aan de select:

```typescript
const { data: member } = await supabase
  .from('members')
  .select('role, membership_active, is_admin')
  .eq('id', token.id as string)
  .single()

if (member) {
  token.role = member.role as string
  token.membershipActive = member.membership_active as boolean
  token.isAdmin = member.is_admin as boolean
}
```

- [ ] **Step 2: Update session callback**

Vervang de hardcoded ADMIN_EMAILS check met DB value + fallback:

```typescript
session.user.isAdmin = (token.isAdmin as boolean) || ADMIN_EMAILS.includes(session.user.email)
```

Dit zorgt ervoor dat:
- Bestaande admins (via ADMIN_EMAILS) blijven werken als bootstrap
- Nieuwe admins via DB ook werken
- Als is_admin true is in DB, overruled dat de email lijst

- [ ] **Step 3: Verify build + test login**

Run: `npm run build`
Test: Log in als matin.khajehfard@hva.nl → admin panel moet nog steeds toegankelijk zijn.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts
git commit -m "refactor: read admin status from database with email fallback"
```

---

### Task 4: Admin API Routes

**Files:**
- Create: `src/app/api/admin/members/[id]/role/route.ts`
- Create: `src/app/api/admin/members/[id]/admin/route.ts`
- Create: `src/app/api/admin/members/[id]/commissies/route.ts`

- [ ] **Step 1: Create role change route**

```typescript
// src/app/api/admin/members/[id]/role/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'
import type { Role } from '@/types/database'

const VALID_ROLES: Role[] = ['member', 'contributor', 'mentor']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.isAdmin && !ADMIN_EMAILS.includes(session?.user?.email || '')) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
  }

  const { id } = await params
  const { role } = await req.json()

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Ongeldige rol' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('members')
    .update({ role })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Create admin toggle route**

```typescript
// src/app/api/admin/members/[id]/admin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.isAdmin && !ADMIN_EMAILS.includes(session?.user?.email || '')) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
  }

  const { id } = await params
  const { is_admin } = await req.json()

  // Voorkom dat je jezelf de-admin maakt
  if (id === session.user.id && !is_admin) {
    return NextResponse.json({ error: 'Je kunt jezelf niet de-admin maken' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('members')
    .update({ is_admin: !!is_admin })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Create commissie assignment route**

```typescript
// src/app/api/admin/members/[id]/commissies/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.isAdmin && !ADMIN_EMAILS.includes(session?.user?.email || '')) {
    return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
  }

  const { id } = await params
  const { commissie_ids } = await req.json() as { commissie_ids: string[] }

  const supabase = createServiceClient()

  // Verwijder alle huidige commissies
  await supabase
    .from('member_commissies')
    .delete()
    .eq('member_id', id)

  // Voeg nieuwe toe
  if (commissie_ids.length > 0) {
    const { error } = await supabase
      .from('member_commissies')
      .insert(commissie_ids.map(cid => ({ member_id: id, commissie_id: cid })))

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update legacy commissie veld (eerste commissie slug voor backwards compat)
  if (commissie_ids.length > 0) {
    const { data: firstCommissie } = await supabase
      .from('commissies')
      .select('slug')
      .eq('id', commissie_ids[0])
      .single()

    await supabase
      .from('members')
      .update({ commissie: firstCommissie?.slug || null })
      .eq('id', id)
  } else {
    await supabase
      .from('members')
      .update({ commissie: null })
      .eq('id', id)
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Compiles successfully

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/members/
git commit -m "feat: admin API routes for role, admin toggle, and commissie assignment"
```

---

### Task 5: Update Members GET API — Include Commissies Join

**Files:**
- Modify: `src/app/api/members/[id]/route.ts`
- Modify: `src/app/api/members/route.ts` (admin GET)

- [ ] **Step 1: Add commissies join to member GET**

In `/api/members/[id]/route.ts` GET handler, update de select:

```typescript
const { data, error } = await supabase
  .from('members')
  .select(`
    id, email, student_number, role, commissie, commissie_voorstel,
    points, membership_active, membership_started_at, membership_expires_at,
    stripe_customer_id, active_skin, active_badges, password_hash,
    is_admin, created_at,
    member_commissies ( commissie_id, role_in_commissie, commissies ( id, slug, naam, emoji ) )
  `)
  .eq('id', id)
  .single()
```

- [ ] **Step 2: Remove commissie from allowed self-edit fields in PATCH**

In de PATCH handler, verwijder `'commissie'` uit de non-admin allowed fields:

```typescript
const allowedFields = isAdmin
  ? ['student_number', 'role', 'commissie', 'commissie_voorstel', 'points', 'membership_active', 'membership_expires_at', 'active_skin', 'active_badges', 'is_admin']
  : ['student_number', 'active_skin', 'active_badges']  // commissie VERWIJDERD
```

- [ ] **Step 3: Update admin members list GET**

In `/api/members/route.ts` GET handler, voeg `is_admin` toe aan de select:

```typescript
const { data, error, count } = await supabase
  .from('members')
  .select('id, email, student_number, role, commissie, points, membership_active, membership_started_at, is_admin, created_at', { count: 'exact' })
  .order('created_at', { ascending: false })
```

- [ ] **Step 4: Verify build**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/members/
git commit -m "feat: include commissies join in member GET, restrict self-edit"
```

---

### Task 6: Update Admin Dashboard UI — MemberDetailModal

**Files:**
- Modify: `src/components/admin/MemberDetailModal.tsx`
- Modify: `src/components/admin/MemberTable.tsx`

- [ ] **Step 1: Add admin toggle + commissie multi-select to MemberDetailModal**

Voeg drie secties toe aan de modal:

1. **Admin toggle**: checkbox om `is_admin` te togglen
2. **Role selector**: dropdown voor member/contributor/mentor (bestaande functionaliteit, maar gebruik de nieuwe admin API route)
3. **Commissie multi-select**: checkboxes voor alle 6 commissies

De admin toggle moet:
- Fetch `PATCH /api/admin/members/{id}/admin` met `{ is_admin: boolean }`
- Visueel bevestigen met groene/rode indicator
- Niet toestaan dat admin zichzelf de-admin maakt

De commissie selector moet:
- Commissies ophalen uit database (`GET /api/commissies` of hardcoded COMMISSIES)
- Huidige commissies tonen als checked
- Bij wijziging: `PUT /api/admin/members/{id}/commissies` met `{ commissie_ids: [...] }`

- [ ] **Step 2: Add admin badge to MemberTable**

In MemberTable, toon een `ADMIN` badge naast leden die `is_admin: true` hebben.

- [ ] **Step 3: Verify build + test in admin panel**

Run: `npm run build`
Test: Open admin panel → klik op een lid → controleer of admin toggle en commissie selector werken.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/
git commit -m "feat: admin toggle and multi-commissie selector in admin dashboard"
```

---

### Task 7: Update Profile + Ledenpas — Show Commissies From Join Table

**Files:**
- Modify: `src/app/dashboard/profiel/page.tsx`
- Modify: `src/app/dashboard/ledenpas/page.tsx`

- [ ] **Step 1: Update profiel page to show commissies from join table**

In profiel page, na het fetchen van member data:
- Lees `member.member_commissies` array
- Toon als read-only lijst van commissie namen (niet editable)
- Vervang de huidige commissie dropdown door een read-only display

- [ ] **Step 2: Update ledenpas to use commissies from join**

In ledenpas page:
- Als `member.member_commissies` beschikbaar is, gebruik eerste commissie naam
- Fallback naar `member.commissie` string voor backwards compat

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/profiel/page.tsx src/app/dashboard/ledenpas/page.tsx
git commit -m "feat: show commissies from join table in profile and ledenpas"
```

---

## Out of Scope

Deze items zijn bewust NIET in dit plan:

- **Org chart migratie**: De organisatie pagina (`orgData.ts`) is hardcoded. Migratie naar DB is een apart project.
- **Commissie CRUD**: Admins kunnen nog geen nieuwe commissies aanmaken/verwijderen. Voor nu volstaat de seed data.
- **Role-based permissions**: Fijnmazige permissions per rol (wat mag een contributor wel/niet). Nu is het alleen admin vs niet-admin.
- **Realtime updates**: Supabase realtime subscriptions voor live rol updates. Page refresh is voldoende.
- **Notificaties**: Leden krijgen geen notificatie als hun rol/commissie wijzigt.
