import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Public recap photo feed for the homepage film-strip (EventRecap.tsx).
// Flattens the recap_photos of the latest published, completed events into a
// flat list of { url, eventId, ... } so the client can render one frame per
// photo. Mirrors the events page recap query (status=completed,
// recap_published=true, date desc). Returns the standard API envelope.
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

// Hard cap on how many frames we hand to the marquee.
const MAX_PHOTOS = 16
const MAX_EVENTS = 8

export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('events')
      .select('id, title, date, category, recap_description, recap_photos, recap_published, status')
      .eq('status', 'completed')
      .eq('recap_published', true)
      .order('date', { ascending: false })
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
