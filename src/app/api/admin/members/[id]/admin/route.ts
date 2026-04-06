import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error
    const { session } = result

    const { id } = await params
    const body = await req.json()
    const { is_admin } = body as { is_admin: unknown }

    if (typeof is_admin !== 'boolean') {
      return NextResponse.json({ error: 'is_admin moet een boolean zijn' }, { status: 400 })
    }

    // Blokkeer zelf-de-admin
    if (id === session.user.id && !is_admin) {
      return NextResponse.json(
        { error: 'Je kunt je eigen admin-rechten niet intrekken' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('members')
      .update({ is_admin })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
