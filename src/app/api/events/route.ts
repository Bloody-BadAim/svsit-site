import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { ADMIN_EMAILS } from '@/lib/constants'
import type { StatCategory } from '@/types/database'

// GET — Alle events ophalen (publiek)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const supabase = createServiceClient()
    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .order('date', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: { count } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}

// POST — Nieuw event aanmaken (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

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
        created_by: session.user.email,
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
