import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

// POST - Lidmaatschap opzeggen (eigen profiel)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const { id } = await params

    // Only the member themselves or an admin can cancel
    if (session.user.id !== id && !session.user.isAdmin) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('members')
      .update({
        membership_active: false,
        membership_expires_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, membership_active, membership_expires_at')
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    return handleError(err)
  }
}
