import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

// GET - Vacatures (publiek: alleen actieve, admin: alle met ?all=true)
export async function GET(req: NextRequest) {
  try {
    const showAll = req.nextUrl.searchParams.get('all') === 'true'
    const supabase = createServiceClient()

    let query = supabase
      .from('vacatures')
      .select('*')
      .order('created_at', { ascending: false })

    if (!showAll) {
      query = query.eq('active', true)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}

// POST - Vacature aanmaken (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin && session?.user?.role !== 'bestuur') {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const body = await req.json()
    const { title, company, company_logo, type, description, requirements, location, url, contact_email, deadline } = body

    if (!title || !company) {
      return NextResponse.json({ data: null, error: 'Titel en bedrijf zijn verplicht', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('vacatures')
      .insert({
        title,
        company,
        company_logo: company_logo || null,
        type: type || 'stage',
        description: description || null,
        requirements: requirements || null,
        location: location || null,
        url: url || null,
        contact_email: contact_email || null,
        deadline: deadline || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
