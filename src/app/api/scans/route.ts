import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'

// POST — Punten toekennen (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { member_id, points, reason, event_name } = await req.json()

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
      })
      .select('*')
      .single()

    if (scanError) throw scanError

    // Update member punten
    const { data: member } = await supabase
      .from('members')
      .select('points')
      .eq('id', member_id)
      .single()

    const currentPoints = (member?.points as number) || 0

    await supabase
      .from('members')
      .update({ points: currentPoints + points })
      .eq('id', member_id)

    return NextResponse.json({ data: scan, error: null, meta: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
