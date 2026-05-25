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
 * Uses notion_id (Notion page ID) as the unique key to prevent duplicates.
 * Falls back to title + date matching for events without notion_id set.
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
      notion_id: event.id,
    }

    // Primary: match on notion_id (unique, prevents duplicates on title/date changes)
    const { data: existingByNotionId } = await supabase
      .from('events')
      .select('id')
      .eq('notion_id', event.id)
      .limit(1)
      .maybeSingle()

    let error: { message: string } | null = null

    if (existingByNotionId) {
      // Update existing event matched by notion_id
      const result = await supabase
        .from('events')
        .update(supabaseEvent)
        .eq('id', existingByNotionId.id)
      error = result.error
    } else {
      // Fallback: check by title + date (for legacy events without notion_id)
      const { data: existingByTitle } = await supabase
        .from('events')
        .select('id')
        .eq('title', supabaseEvent.title)
        .eq('date', supabaseEvent.date)
        .limit(1)
        .maybeSingle()

      if (existingByTitle) {
        // Update legacy event and set notion_id
        const result = await supabase
          .from('events')
          .update(supabaseEvent)
          .eq('id', existingByTitle.id)
        error = result.error
      } else {
        // Insert new event
        const result = await supabase
          .from('events')
          .insert(supabaseEvent)
        error = result.error
      }
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
