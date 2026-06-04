import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Public recap photo feed for the homepage film-strip (EventRecap.tsx).
// Flattens the recap_photos of the latest published, completed events into a
// flat list of { url, eventId, ... } so the client can render one frame per
// photo. Mirrors the events page recap query (status=completed,
// recap_published=true, date desc). Returns the standard API envelope.
//
// "Newest 16, rolling": this route runs per request (force-dynamic) and the CDN
// only holds the result for ~60s (revalidate + s-maxage). So a newly published
// recap photo enters the strip within ~60s and anything beyond the newest 16
// drops off automatically. The live query IS the rolling mechanism. There is
// no cron or persisted window. The MAX_PHOTOS = 16 cap is the true limiter.
// MAX_EVENTS is just a generous safety bound so the query never truncates newer
// photos because several events exist. Ordering is deterministic newest-first
// (date desc, then created_at desc) so a tie on `date` still rolls correctly.
// ---------------------------------------------------------------------------

// Force dynamic - needs Supabase service client at runtime.
export const dynamic = 'force-dynamic'
export const revalidate = 60

export type RecapPhoto = {
  url: string
  eventId: string
  title: string
  category: string
  date: string
  color: string
}

// Category -> accent colour (matches events page CATEGORY_CONFIG).
const CATEGORY_COLOR: Record<string, string> = {
  social: '#F29E18',
  code: '#22C55E',
  career: '#3B82F6',
  game: '#EF4444',
}

const FALLBACK_COLOR = '#F29E18'

// Hard cap on how many frames we hand to the marquee. This is the TRUE limiter:
// the strip is always the newest 16 recap photos across all published recaps.
const MAX_PHOTOS = 16
// Generous safety bound on rows fetched. Kept well above the photo cap so the
// query never cuts off newer photos just because there are several events.
// MAX_PHOTOS, not the event count, decides where the window ends.
const MAX_EVENTS = 30

export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('events')
      .select('id, title, date, category, recap_description, recap_photos, recap_published, status, created_at')
      .eq('status', 'completed')
      .eq('recap_published', true)
      // Deterministic newest-first: tiebreak on created_at so events sharing a
      // `date` (e.g. AI020 vs Kroegentocht) always order the same way, keeping
      // the rolling "newest 16" window stable across requests.
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(MAX_EVENTS)

    if (error) throw error

    const photos: RecapPhoto[] = []

    for (const event of data ?? []) {
      const urls = event.recap_photos ?? []
      if (!Array.isArray(urls)) continue
      const category = event.category ?? ''
      const color = CATEGORY_COLOR[category] ?? FALLBACK_COLOR

      for (const url of urls) {
        if (typeof url !== 'string' || url.length === 0) continue
        if (photos.length >= MAX_PHOTOS) break
        photos.push({
          url,
          eventId: event.id,
          title: event.title,
          category,
          date: event.date,
          color,
        })
      }

      if (photos.length >= MAX_PHOTOS) break
    }

    const res = NextResponse.json({
      data: photos,
      error: null,
      meta: { count: photos.length },
    })
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return res
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({
      data: [],
      error: message,
      meta: { count: 0 },
    })
  }
}
