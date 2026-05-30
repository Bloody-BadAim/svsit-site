import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

// PATCH - Project bijwerken (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin && session?.user?.role !== 'bestuur') {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()

    const allowedFields = ['title', 'description', 'category', 'repo_url', 'demo_url', 'image_url', 'creators', 'tech_stack', 'featured']
    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) updateData[field] = body[field]
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ data: null, error: 'Geen velden om te updaten', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}

// DELETE - Project verwijderen (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin && session?.user?.role !== 'bestuur') {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { id } = await params
    const supabase = createServiceClient()
    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) throw error
    return NextResponse.json({ data: { deleted: true }, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}
