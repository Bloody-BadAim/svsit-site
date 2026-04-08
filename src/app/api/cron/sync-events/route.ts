import { NextRequest, NextResponse } from 'next/server'
import { syncNotionEventsToSupabase } from '@/lib/syncNotionEvents'

export async function GET(req: NextRequest) {
  // Verify cron secret — Vercel sends it as Authorization: Bearer <secret>
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[sync-events] Unauthorized cron request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncNotionEventsToSupabase()
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[sync-events] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
