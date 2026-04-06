import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'
import type { Role } from '@/types/database'

const VALID_ROLES: Role[] = ['member', 'contributor', 'mentor', 'bestuur']

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const { id } = await params
    const body = await req.json()
    const { role } = body as { role: unknown }

    if (!role || !VALID_ROLES.includes(role as Role)) {
      return NextResponse.json(
        { error: `Ongeldige rol. Kies uit: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('members')
      .update({ role: role as Role })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
