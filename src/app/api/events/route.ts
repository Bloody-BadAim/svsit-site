import { NextRequest, NextResponse } from 'next/server'
import { handleError, requireAdmin } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'
import { parseFormFields } from '@/lib/eventForm'
import type { Json } from '@/lib/database.types'
import type { StatCategory } from '@/types/database'

// Admin-beheerlijst: nooit edge-cachen, anders toont het panel verouderde
// status direct na een wijziging (tot s-maxage verloopt).
export const dynamic = 'force-dynamic'

// GET - Alle events ophalen (admin-beheerlijst + scanner)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const supabase = createServiceClient()
    let query = supabase
      .from('events')
      .select('id, title, description, date, end_date, location, category, tags, status, is_paid, price_members, price_nonmembers, capacity, stripe_price_id, external_ticket_url, recap_description, recap_photos, recap_published, form_fields, created_by, created_at', { count: 'exact' })
      .order('date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) throw error
    const res = NextResponse.json({ data, error: null, meta: { count } })
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (err) {
    return handleError(err)
  }
}

// POST - Nieuw event aanmaken (admin only)
export async function POST(req: NextRequest) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error
    const { session } = result

    const body = await req.json()
    const {
      title,
      description,
      date,
      end_date,
      location,
      category,
      tags,
      status,
      is_paid,
      price_members,
      price_nonmembers,
      capacity,
      external_ticket_url,
      form_fields,
    } = body as {
      title: string
      description?: string
      date: string
      end_date?: string
      location?: string
      category?: StatCategory
      tags?: string[]
      status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
      is_paid?: boolean
      price_members?: number
      price_nonmembers?: number
      capacity?: number
      external_ticket_url?: string
      form_fields?: unknown
    }

    if (!title || !date) {
      return NextResponse.json({ data: null, error: 'title en date zijn verplicht', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description: description ?? null,
        date,
        end_date: end_date ?? null,
        location: location ?? null,
        category: category ?? 'social',
        tags: tags ?? [],
        status: status ?? 'upcoming',
        is_paid: is_paid ?? false,
        price_members: price_members ?? 0,
        price_nonmembers: price_nonmembers ?? 0,
        capacity: capacity ?? null,
        external_ticket_url: external_ticket_url ?? null,
        form_fields: parseFormFields(form_fields) as unknown as Json,
        created_by: session.user.email,
      })
      .select('id, title, description, date, end_date, location, category, tags, status, is_paid, price_members, price_nonmembers, capacity, stripe_price_id, external_ticket_url, form_fields, created_by, created_at')
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
