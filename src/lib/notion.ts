import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Data source (collection) ID — NOT the database page ID
const EVENT_DATA_SOURCE_ID = '2f5be6edc1a98117bb4c000b42a59c22'

export type EventCategory = 'Social' | 'Code' | 'Game' | 'Career'

export interface NotionEvent {
  id: string
  name: string
  date: string
  dateEnd?: string
  time?: string
  location?: string
  description?: string
  link?: string
  status: 'done' | 'next' | 'tba'
  type: string
  category: EventCategory
  color: string
}

const CATEGORY_COLORS: Record<EventCategory, string> = {
  Social: '#F59E0B',
  Code: '#22C55E',
  Game: '#EF4444',
  Career: '#3B82F6',
}

function getRichText(prop: unknown): string | undefined {
  const arr = (prop as { rich_text?: { plain_text: string }[] })?.rich_text
  return arr?.[0]?.plain_text || undefined
}

function getTitle(prop: unknown): string {
  const arr = (prop as { title?: { plain_text: string }[] })?.title
  return arr?.[0]?.plain_text || 'Untitled'
}

function getSelect(prop: unknown): string | undefined {
  return (prop as { select?: { name: string } })?.select?.name || undefined
}

function getDate(prop: unknown): { start?: string; end?: string } {
  const d = (prop as { date?: { start: string; end?: string } })?.date
  return { start: d?.start, end: d?.end || undefined }
}

function getUrl(prop: unknown): string | undefined {
  return (prop as { url?: string })?.url || undefined
}

export async function getNotionEvents(): Promise<NotionEvent[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: EVENT_DATA_SOURCE_ID,
      sorts: [{ property: 'Date', direction: 'ascending' }],
      filter: {
        property: 'Status',
        select: { does_not_equal: 'Geannuleerd' },
      },
    })

    const now = new Date()

    return response.results.map((page) => {
      const props = (page as unknown as { properties: Record<string, unknown> }).properties
      const dateInfo = getDate(props.Date)
      const notionStatus = getSelect(props.Status)
      const type = getSelect(props.Type) || ''
      const rawCat = getSelect(props.Categorie)
      const category: EventCategory = (rawCat === 'Code' || rawCat === 'Game' || rawCat === 'Career') ? rawCat : 'Social'

      // Map status
      let status: 'done' | 'next' | 'tba'
      if (notionStatus === 'Afgerond') {
        status = 'done'
      } else if (dateInfo.start) {
        const eventDate = new Date(dateInfo.start)
        status = eventDate < now ? 'done' : 'next'
      } else {
        status = 'tba'
      }

      // Extract time from date if it includes a time component
      const time = dateInfo.start?.includes('T')
        ? new Date(dateInfo.start).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
        : undefined

      return {
        id: page.id,
        name: getTitle(props.Name),
        date: dateInfo.start || '',
        dateEnd: dateInfo.end,
        time,
        location: getRichText(props.Location),
        description: getRichText(props.Beschrijving),
        link: getUrl(props.Link),
        status,
        type,
        category,
        color: CATEGORY_COLORS[category],
      }
    })
  } catch (error) {
    console.error('[notion] Failed to fetch events:', error instanceof Error ? error.message : error)
    return []
  }
}
