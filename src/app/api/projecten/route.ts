import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

// GET — Alle projecten (publiek)
export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}

// POST — Project aanmaken (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin && session?.user?.role !== 'bestuur') {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, category, repo_url, demo_url, image_url, creators, tech_stack, featured } = body

    if (!title) {
      return NextResponse.json({ data: null, error: 'Titel is verplicht', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title,
        description: description || null,
        category: category || 'community',
        repo_url: repo_url || null,
        demo_url: demo_url || null,
        image_url: image_url || null,
        creators: creators || [],
        tech_stack: tech_stack || [],
        featured: featured || false,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}
