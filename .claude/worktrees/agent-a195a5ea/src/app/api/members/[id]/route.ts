import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

// GET — Lid ophalen (eigen profiel of admin)
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
    const { data, error } = await supabase
      .from('members')
      .select(`
    id, email, student_number, role, commissie, commissie_voorstel,
    total_xp, current_level, stripe_subscription_id,
    stripe_customer_id, active_skin, password_hash,
    is_admin, created_at,
    member_commissies ( commissie_id, role_in_commissie, commissies ( id, slug, naam, emoji ) )
  `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Stuur nooit de echte hash mee, alleen of er een wachtwoord is
    if (data) {
      const record = data as Record<string, unknown>
      record.has_password = !!data.password_hash
      record.password_hash = undefined
      record.membership_active = !!data.stripe_subscription_id
    }

    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}

// DELETE — Lid verwijderen (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    const { id } = await params

    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Je kunt jezelf niet verwijderen' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ error: message }, { status: 500 })
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
      ? ['student_number', 'role', 'commissie', 'commissie_voorstel', 'total_xp', 'active_skin']
      : ['student_number', 'active_skin']

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
      .select('id, email, student_number, role, commissie, total_xp, current_level, stripe_subscription_id')
      .single()

    if (error) throw error

    if (data) {
      const record = data as Record<string, unknown>
      record.membership_active = !!data.stripe_subscription_id
    }

    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
