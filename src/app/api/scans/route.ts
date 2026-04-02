import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'
import { grantRewards } from '@/lib/rewards'

// GET — Scan geschiedenis per event (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const eventName = req.nextUrl.searchParams.get('event_name')
    const supabase = createServiceClient()

    let query = supabase
      .from('scans')
      .select('id, member_id, points, reason, event_name, scanned_by, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (eventName) {
      query = query.eq('event_name', eventName)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}

// POST — Punten toekennen (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { member_id, points, reason, event_name, event_id, category } = await req.json()

    if (!member_id || !points || !reason) {
      return NextResponse.json({ data: null, error: 'member_id, points en reason zijn verplicht', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Maak scan aan
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        member_id,
        points,
        reason,
        scanned_by: session.user.email,
        event_name: event_name || null,
        event_id: event_id || null,
        category: category || 'social',
      })
      .select('*')
      .single()

    if (scanError) throw scanError

    // Bereken stats en ken rewards automatisch toe
    await grantRewards(member_id)

    return NextResponse.json({ data: scan, error: null, meta: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
