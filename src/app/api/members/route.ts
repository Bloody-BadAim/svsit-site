import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import { ADMIN_EMAILS } from '@/lib/constants'

// POST — Nieuw lid aanmaken (registratie)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email: rawEmail, password, student_number, role, commissie, commissie_voorstel } = body

    if (!rawEmail) {
      return NextResponse.json({ data: null, error: 'Email is verplicht', meta: null }, { status: 400 })
    }

    const email = rawEmail.toLowerCase().trim()

    const supabase = createServiceClient()

    // Check of email al bestaat
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      // Update bestaand lid (bijv. Microsoft user die registratie flow doorloopt)
      const updateData: Record<string, unknown> = {
        role: role || 'member',
        commissie: commissie || null,
        commissie_voorstel: commissie_voorstel || null,
        student_number: student_number || null,
      }

      if (password) {
        updateData.password_hash = await bcrypt.hash(password, 12)
      }

      const { data, error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', existing.id as string)
        .select('id, email, role')
        .single()

      if (error) throw error
      return NextResponse.json({ data, error: null, meta: null })
    }

    // Nieuw lid aanmaken
    const insertData: Record<string, unknown> = {
      email,
      role: role || 'member',
      commissie: commissie || null,
      commissie_voorstel: commissie_voorstel || null,
      student_number: student_number || null,
      membership_active: false,
    }

    if (password) {
      insertData.password_hash = await bcrypt.hash(password, 12)
    }

    const { data, error } = await supabase
      .from('members')
      .insert(insertData)
      .select('id, email, role')
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}

// GET — Ledenlijst (admin only)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const supabase = createServiceClient()
    const { data, error, count } = await supabase
      .from('members')
      .select('id, email, student_number, role, commissie, points, membership_active, membership_started_at, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: { count } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
