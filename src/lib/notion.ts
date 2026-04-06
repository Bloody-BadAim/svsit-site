import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Data source (collection) ID — NOT the database page ID
const EVENT_DATA_SOURCE_ID = '2f5be6edc1a98117bb4c000b42a59c22'

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
  tags: string[]
  color: string
}

const TYPE_TAGS: Record<string, string[]> = {
  'SIT eigen': ['SIT', 'SOCIAL'],
  'SVO gezamenlijk': ['SVO', 'SOCIAL'],
  'Samenwerking': ['COLLAB'],
  'Extern': ['EXTERN'],
}

const TAG_COLORS: Record<string, string> = {
  SOCIAL: '#F59E0B',
  SIT: '#F59E0B',
  SVO: '#F59E0B',
  COLLAB: '#3B82F6',
  EXTERN: '#6B7280',
}

function getEventColor(tags: string[]): string {
  for (const tag of tags) {
    if (TAG_COLORS[tag]) return TAG_COLORS[tag]
  }
  return '#F59E0B'
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

      // Derive tags from Type
      const tags = TYPE_TAGS[type] ?? ['SOCIAL']

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
        tags,
        color: getEventColor(tags),
      }
    })
  } catch (error) {
    console.error('[notion] Failed to fetch events:', error instanceof Error ? error.message : error)
    return []
  }
}
