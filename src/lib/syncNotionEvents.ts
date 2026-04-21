import { getNotionEvents, type NotionEvent, type EventCategory } from '@/lib/notion'
import { createServiceClient } from '@/lib/supabase'
import type { StatCategory } from '@/types/database'

// ─── Category mapping ───────────────────────────────────────────────────────
// Notion uses: Social, Code, Game, Career
// Supabase uses: social, code, learn, impact

const CATEGORY_MAP: Record<EventCategory, StatCategory> = {
  Social: 'social',
  Code: 'code',
  Game: 'learn',
  Career: 'impact',
}

// ─── Status mapping ─────────────────────────────────────────────────────────
// Notion uses: done, next, tba
// Supabase uses: upcoming, active, completed, cancelled

function mapStatus(notionStatus: NotionEvent['status']): 'upcoming' | 'active' | 'completed' | 'cancelled' {
  switch (notionStatus) {
    case 'done':
      return 'completed'
    case 'next':
      return 'upcoming'
    case 'tba':
      return 'upcoming'
    default:
      return 'upcoming'
  }
}

// ─── Sync function ──────────────────────────────────────────────────────────

export interface SyncResult {
  synced: number
  errors: number
  total: number
}

/**
 * Fetches events from Notion and upserts them into the Supabase events table.
 * Uses title + date as the unique key to avoid duplicates.
 */
export async function syncNotionEventsToSupabase(): Promise<SyncResult> {
  const notionEvents = await getNotionEvents()

  if (notionEvents.length === 0) {
    console.log('[sync-events] No events from Notion')
    return { synced: 0, errors: 0, total: 0 }
  }

  const supabase = createServiceClient()
  let synced = 0
  let errors = 0

  for (const event of notionEvents) {
    // Skip events without a date
    if (!event.date) continue

    const supabaseEvent = {
      title: event.name,
      date: event.date,
      end_date: event.dateEnd || null,
      location: event.location || null,
      description: event.description || null,
      category: CATEGORY_MAP[event.category] || 'social',
      status: mapStatus(event.status),
      tags: [event.type, event.category].filter(Boolean) as string[],
    }

    // Try to find an existing event with the same title and date
    const { data: existing } = await supabase
      .from('events')
      .select('id')
      .eq('title', supabaseEvent.title)
      .eq('date', supabaseEvent.date)
      .limit(1)
      .single()

    let error: { message: string } | null = null

    if (existing) {
      // Update existing event
      const result = await supabase
        .from('events')
        .update(supabaseEvent)
        .eq('id', existing.id)
      error = result.error
    } else {
      // Insert new event
      const result = await supabase
        .from('events')
        .insert(supabaseEvent)
      error = result.error
    }

    if (error) {
      errors++
      console.error(`[sync-events] Failed to upsert "${event.name}":`, error.message)
    } else {
      synced++
    }
  }

  console.log(`[sync-events] Done — synced: ${synced}, errors: ${errors}, total: ${notionEvents.length}`)
  return { synced, errors, total: notionEvents.length }
}
