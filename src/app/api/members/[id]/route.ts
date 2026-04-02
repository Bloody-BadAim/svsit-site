import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

// GET — Haal lidgegevens op (eigen profiel of admin)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const { id } = await params
    const isAdmin = session.user.isAdmin
    const isOwn = session.user.id === id

    if (!isAdmin && !isOwn) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const supabase = createServiceClient()
    const { data: member, error } = await supabase
      .from('members')
      .select('id, email, student_number, role, commissie, commissie_voorstel, points, membership_active, membership_started_at, membership_expires_at, active_skin, active_badges, password_hash, created_at')
      .eq('id', id)
      .single()

    if (error || !member) {
      return NextResponse.json({ data: null, error: 'Lid niet gevonden', meta: null }, { status: 404 })
    }

    // Never send the actual password hash to the client; expose only a boolean
    const { password_hash, ...rest } = member
    return NextResponse.json({ data: { ...rest, has_password: !!password_hash }, error: null, meta: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}

// PATCH — Update lid (eigen profiel of admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const { id } = await params
    const isAdmin = session.user.isAdmin
    const isOwn = session.user.id === id

    if (!isAdmin && !isOwn) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const body = await req.json()
    const supabase = createServiceClient()

    // Welke velden mag het lid zelf updaten vs admin
    const allowedFields = isAdmin
      ? ['student_number', 'role', 'commissie', 'commissie_voorstel', 'points', 'membership_active', 'membership_expires_at', 'active_skin', 'active_badges']
      : ['student_number', 'commissie', 'active_skin', 'active_badges']

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ data: null, error: 'Geen velden om te updaten', meta: null }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', id)
      .select('id, email, student_number, role, commissie, points, membership_active')
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
