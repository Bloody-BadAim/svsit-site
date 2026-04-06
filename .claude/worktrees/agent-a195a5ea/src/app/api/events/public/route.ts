import { NextResponse } from 'next/server'
import { getNotionEvents } from '@/lib/notion'

// ISR: revalidate every 60 seconds
export const revalidate = 60

export async function GET() {
  const events = await getNotionEvents()
  return NextResponse.json(events)
}
