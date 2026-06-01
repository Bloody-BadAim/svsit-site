import { NextRequest, NextResponse } from 'next/server'
import { handleError, requireAdmin } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'
import { parseFormFields, displayValue, type CustomData } from '@/lib/eventForm'

function csvCell(value: string): string {
  // Altijd quoten + interne quotes verdubbelen -> veilig tegen komma's/newlines
  return `"${value.replace(/"/g, '""')}"`
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'event'
}

// GET - Aanmeldingen van een event als CSV (admin/bestuur only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const { id: eventId } = await params
    const supabase = createServiceClient()

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, form_fields')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ data: null, error: 'Event niet gevonden', meta: null }, { status: 404 })
    }

    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('email, name, status, paid_amount, custom_data, created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (ticketsError) throw ticketsError

    const fields = parseFormFields(event.form_fields)

    const header = ['Naam', 'Email', 'Status', 'Betaald (EUR)', 'Aangemeld op', ...fields.map((f) => f.label)]
    const rows = (tickets ?? []).map((t) => {
      const data = (t.custom_data ?? {}) as CustomData
      return [
        t.name ?? '',
        t.email,
        t.status ?? '',
        ((t.paid_amount ?? 0) / 100).toFixed(2),
        t.created_at ? new Date(t.created_at).toISOString() : '',
        ...fields.map((f) => displayValue(f, data)),
      ]
    })

    // BOM zodat Excel UTF-8 correct leest
    const csv = '﻿' + [header, ...rows].map((r) => r.map((c) => csvCell(String(c))).join(',')).join('\r\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="aanmeldingen-${slugify(event.title)}.csv"`,
      },
    })
  } catch (err) {
    return handleError(err)
  }
}
