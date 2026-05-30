import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://svsit.nl'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/over-ons`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/projecten`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/partners`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/vacatures`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/introweek`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
    { url: `${base}/lid-worden`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/leaderboard`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.3 },
  ]

  // Dynamic event pages - try to fetch, fallback to static-only on build
  let eventRoutes: MetadataRoute.Sitemap = []
  try {
    const { createServiceClient } = await import('@/lib/supabase')
    const supabase = createServiceClient()
    const { data: events } = await supabase
      .from('events')
      .select('id, date')
      .in('status', ['upcoming', 'completed'])
      .order('date', { ascending: false })
      .limit(50)

    eventRoutes = (events ?? []).map((e) => ({
      url: `${base}/events/${e.id}`,
      lastModified: new Date(e.date as string),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {
    // Supabase not available at build time - static routes only
  }

  return [...staticRoutes, ...eventRoutes]
}
