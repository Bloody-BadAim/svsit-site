import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const EVENT_DATABASE_ID = '2f5be6edc1a981899b85c1fd0a05be3a'

export interface NotionEvent {
  id: string
  name: string
  date: string
  dateEnd?: string
  time?: string
  location?: string
  description?: string
  status: 'done' | 'next' | 'tba'
  type: string
  tags: string[]
  color: string
}

const TAG_COLORS: Record<string, string> = {
  SOCIAL: '#F59E0B',
  TECH: '#EF4444',
  AI: '#EF4444',
  EDUCATIE: '#3B82F6',
  CARRIERE: '#3B82F6',
  BESTUUR: '#F59E0B',
  SVO: '#F59E0B',
  NACHTLEVEN: '#F59E0B',
  GAMING: '#8B5CF6',
}

function getEventColor(tags: string[]): string {
  for (const tag of tags) {
    if (TAG_COLORS[tag.toUpperCase()]) return TAG_COLORS[tag.toUpperCase()]
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

function getMultiSelect(prop: unknown): string[] {
  const arr = (prop as { multi_select?: { name: string }[] })?.multi_select
  return arr?.map(t => t.name) || []
}

function getDate(prop: unknown): { start?: string; end?: string } {
  const d = (prop as { date?: { start: string; end?: string } })?.date
  return { start: d?.start, end: d?.end || undefined }
}

function getCheckbox(prop: unknown): boolean {
  return (prop as { checkbox?: boolean })?.checkbox ?? true
}

export async function getNotionEvents(): Promise<NotionEvent[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: EVENT_DATABASE_ID,
      sorts: [{ property: 'Date', direction: 'ascending' }],
    })

    const now = new Date()

    return response.results
      .filter((page) => {
        const props = (page as { properties: Record<string, unknown> }).properties
        // Filter: show on site + not cancelled
        const showOnSite = getCheckbox(props['Tonen op site'])
        const status = getSelect(props.Status)
        return showOnSite !== false && status !== 'Geannuleerd'
      })
      .map((page) => {
        const props = (page as { properties: Record<string, unknown> }).properties
        const dateInfo = getDate(props.Date)
        const notionStatus = getSelect(props.Status)
        const tags = getMultiSelect(props.Tags)
        const type = getSelect(props.Type) || ''

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

        // Add type as tag if relevant
        if (type === 'SVO gezamenlijk' && !tags.some(t => t.toUpperCase() === 'SVO')) {
          tags.push('SVO')
        }

        return {
          id: page.id,
          name: getTitle(props.Name),
          date: dateInfo.start || '',
          dateEnd: dateInfo.end,
          time: getRichText(props.Tijd),
          location: getRichText(props.Location),
          description: getRichText(props.Beschrijving),
          status,
          type,
          tags: tags.map(t => t.toUpperCase()),
          color: getEventColor(tags),
        }
      })
  } catch (error) {
    console.error('[notion] Failed to fetch events:', error instanceof Error ? error.message : error)
    return []
  }
}
