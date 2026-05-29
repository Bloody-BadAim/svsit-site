import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Force dynamic — needs Supabase service client at runtime
export const dynamic = 'force-dynamic'
export const revalidate = 60

export async function GET() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('events')
    .select('id, title, description, date, end_date, location, category, tags, status, is_paid, price_members, price_nonmembers, external_ticket_url')
    .in('status', ['upcoming', 'completed'])
    .order('date', { ascending: true })

  if (error) {
    return NextResponse.json([], { status: 500 })
  }

  // Map to the format Events.tsx expects (EventResponse)
  const mapped = (data ?? []).map((e) => {
    const now = new Date()
    const eventDate = new Date(e.date)
    const isUpcoming = e.status === 'upcoming'
    const isPast = e.status === 'completed'

    // Determine display status
    let displayStatus: 'next' | 'done' | 'tba' = 'tba'
    if (isPast) displayStatus = 'done'
    else if (isUpcoming) displayStatus = 'next'

    // Category mapping from DB tags/category to UI categories
    const categoryMap: Record<string, string> = {
      social: 'Social',
      code: 'Code',
      game: 'Game',
      career: 'Career',
    }
    const category = categoryMap[(e.category ?? '').toLowerCase()] ?? 'Social'

    // Color based on category
    const colorMap: Record<string, string> = {
      Social: '#F29E18',
      Code: '#22C55E',
      Game: '#EF4444',
      Career: '#3B82F6',
    }

    return {
      id: e.id,
      name: e.title,
      date: e.date,
      dateEnd: e.end_date ?? undefined,
      location: e.location ?? 'TBA',
      description: e.description ?? undefined,
      link: e.external_ticket_url ?? undefined,
      isPaid: e.is_paid ?? false,
      status: displayStatus,
      type: 'SIT eigen',
      category,
      color: colorMap[category] ?? '#F29E18',
    }
  })

  return NextResponse.json(mapped)
}
