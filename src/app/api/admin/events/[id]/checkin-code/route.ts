import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No 0/O/1/I to avoid confusion
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// GET — Get current check-in code for event
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { id } = await params
    const supabase = createServiceClient()

    const { data: event, error: dbError } = await supabase
      .from('events')
      .select('id, title, checkin_code')
      .eq('id', id)
      .single()

    if (dbError || !event) {
      return NextResponse.json({ error: 'Event niet gevonden' }, { status: 404 })
    }

    return NextResponse.json({ data: { checkin_code: event.checkin_code }, error: null })
  } catch (err) {
    return handleError(err)
  }
}

// POST — Generate a new check-in code for event
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { id } = await params
    const supabase = createServiceClient()

    const code = generateCode()

    const { data: event, error: dbError } = await supabase
      .from('events')
      .update({ checkin_code: code })
      .eq('id', id)
      .select('id, title, checkin_code')
      .single()

    if (dbError || !event) {
      return NextResponse.json({ error: 'Event niet gevonden of update mislukt' }, { status: 404 })
    }

    return NextResponse.json({ data: { checkin_code: event.checkin_code }, error: null })
  } catch (err) {
    return handleError(err)
  }
}
