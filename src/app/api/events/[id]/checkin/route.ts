import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'
import { checkAndGrantAutoBadges } from '@/lib/rewards'
import { grantXp, calculateXpReward } from '@/lib/xpEngine'

// POST — Self-service event check-in
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Je moet ingelogd zijn om in te checken' }, { status: 401 })
    }

    const { id: eventId } = await params
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Check-in code is verplicht' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Fetch event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, date, end_date, category, status, checkin_code')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event niet gevonden' }, { status: 404 })
    }

    // 2. Validate check-in code exists on event
    if (!event.checkin_code) {
      return NextResponse.json({ error: 'Check-in is niet beschikbaar voor dit event' }, { status: 400 })
    }

    // 3. Validate code matches (case-insensitive)
    if (code.trim().toUpperCase() !== (event.checkin_code as string).toUpperCase()) {
      return NextResponse.json({ error: 'Onjuiste check-in code' }, { status: 400 })
    }

    // 4. Validate event is today (within +-12 hours of event date)
    const eventDate = new Date(event.date as string)
    const now = new Date()
    const diffMs = Math.abs(now.getTime() - eventDate.getTime())
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours > 12) {
      return NextResponse.json({ error: 'Check-in is alleen mogelijk rond het evenement (binnen 12 uur)' }, { status: 400 })
    }

    // 5. Check if member already checked in for this event
    const { data: existingScan } = await supabase
      .from('scans')
      .select('id')
      .eq('member_id', session.user.id)
      .eq('event_id', eventId)
      .limit(1)

    if (existingScan && existingScan.length > 0) {
      return NextResponse.json({ error: 'Je bent al ingecheckt voor dit event' }, { status: 409 })
    }

    // 6. Create scan record
    const points = 25
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        member_id: session.user.id,
        points,
        reason: 'Event check-in',
        scanned_by: null,
        event_name: event.title as string,
        event_id: eventId,
        category: (event.category as string) || 'social',
      })
      .select('id, member_id, points, reason, event_name, event_id, category, created_at')
      .single()

    if (scanError) throw scanError

    // 7. Grant XP + auto-badges
    const xpAmount = calculateXpReward('scan', { eventName: event.title as string, points })
    await Promise.all([
      grantXp({
        memberId: session.user.id,
        amount: xpAmount,
        source: 'scan',
        sourceId: scan.id as string,
        category: (event.category as string as 'code' | 'social' | 'learn' | 'impact') || 'social',
      }),
      checkAndGrantAutoBadges(session.user.id),
    ])

    return NextResponse.json({
      data: { scan, xpEarned: xpAmount },
      error: null,
    }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
