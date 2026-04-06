import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'
import type { StatCategory } from '@/types/database'

// GET — Enkel event met ticket count (publiek)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = createServiceClient()

    const [eventResult, ticketResult] = await Promise.all([
      supabase.from('events').select('id, title, description, date, end_date, location, category, tags, status, is_paid, price_members, price_nonmembers, capacity, stripe_price_id, created_by, created_at').eq('id', id).single(),
      supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id)
        .in('status', ['paid', 'checked_in']),
    ])

    if (eventResult.error) {
      if (eventResult.error.code === 'PGRST116') {
        return NextResponse.json({ data: null, error: 'Event niet gevonden', meta: null }, { status: 404 })
      }
      throw eventResult.error
    }

    return NextResponse.json({
      data: { ...eventResult.data, ticketCount: ticketResult.count ?? 0 },
      error: null,
      meta: null,
    })
  } catch (err) {
    return handleError(err)
  }
}

// PATCH — Event bijwerken (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const allowedFields = [
      'title',
      'description',
      'date',
      'end_date',
      'location',
      'category',
      'tags',
      'status',
      'is_paid',
      'price_members',
      'price_nonmembers',
      'capacity',
    ] as const

    type AllowedField = typeof allowedFields[number]
    type UpdatePayload = Partial<{
      title: string
      description: string | null
      date: string
      end_date: string | null
      location: string | null
      category: StatCategory
      tags: string[]
      status: 'upcoming' | 'active' | 'completed' | 'cancelled'
      is_paid: boolean
      price_members: number
      price_nonmembers: number
      capacity: number | null
    }>

    const updateData: UpdatePayload = {}
    for (const field of allowedFields) {
      if (field in body) {
        (updateData as Record<AllowedField, unknown>)[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ data: null, error: 'Geen geldige velden om bij te werken', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select('id, title, description, date, end_date, location, category, tags, status, is_paid, price_members, price_nonmembers, capacity, stripe_price_id, created_by, created_at')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null, error: 'Event niet gevonden', meta: null }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}

// DELETE — Soft delete event: status naar 'cancelled' (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { id } = await params

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('id, title, status')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null, error: 'Event niet gevonden', meta: null }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}
