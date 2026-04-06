import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

// GET — List active challenges (authenticated users)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const supabase = createServiceClient()

    // Weekly quests: filter where active_until > now() OR active_until IS NULL
    // Track milestones: return all
    const { data, error } = await supabase
      .from('challenges')
      .select('id, title, description, type, category, points, track_id, track_order, proof_required, proof_type, active_from, active_until, created_by, created_at')
      .or('type.eq.track_milestone,active_until.is.null,active_until.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data, error: null, meta: { count: data?.length ?? 0 } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}

// POST — Create challenge (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      description,
      type,
      category,
      points,
      track_id,
      track_order,
      proof_required,
      proof_type,
      active_from,
      active_until,
    } = body

    if (!title || !description || !type || !category || points === undefined) {
      return NextResponse.json(
        { data: null, error: 'title, description, type, category en points zijn verplicht', meta: null },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        title,
        description,
        type,
        category,
        points,
        track_id: track_id ?? null,
        track_order: track_order ?? null,
        proof_required: proof_required ?? false,
        proof_type: proof_type ?? null,
        active_from: active_from ?? null,
        active_until: active_until ?? null,
        created_by: session.user.email,
      })
      .select('id, title, description, type, category, points, track_id, track_order, proof_required, proof_type, active_from, active_until, created_by, created_at')
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null, meta: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
