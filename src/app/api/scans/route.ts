import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { checkAndGrantAutoBadges } from '@/lib/rewards'
import { grantXp, calculateXpReward } from '@/lib/xpEngine'

// GET — Scan geschiedenis per event (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
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
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { member_id, points, reason, event_name, event_id, category } = await req.json()

    if (!member_id || !points || !reason) {
      return NextResponse.json({ data: null, error: 'member_id, points en reason zijn verplicht', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Dedup: prevent duplicate scan for same member+event within 5 minutes
    if (event_id || event_name) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const dedup = supabase
        .from('scans')
        .select('id')
        .eq('member_id', member_id)
        .gte('created_at', fiveMinAgo)

      if (event_id) dedup.eq('event_id', event_id)
      else if (event_name) dedup.eq('event_name', event_name)

      const { data: existing } = await dedup
      if (existing && existing.length > 0) {
        return NextResponse.json({ error: 'Dit lid is al gescand voor dit event' }, { status: 409 })
      }
    }

    // Validate points range
    if (points < 1 || points > 10) {
      return NextResponse.json({ error: 'Punten moeten tussen 1 en 10 zijn' }, { status: 400 })
    }

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
      .select('id, member_id, points, reason, scanned_by, event_name, event_id, category, created_at')
      .single()

    if (scanError) throw scanError

    // Grant XP (also handles coins, XP ledger, and boss fight contribution)
    const xpAmount = calculateXpReward('scan', { eventName: event_name, points })
    await grantXp({
      memberId: member_id,
      amount: xpAmount,
      source: 'scan',
      sourceId: scan.id,
      category: category || 'social',
    })

    // Bereken stats en ken rewards automatisch toe
    await checkAndGrantAutoBadges(member_id)

    return NextResponse.json({ data: scan, error: null, meta: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
