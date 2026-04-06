import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, handleError } from '@/lib/apiAuth'
import { createServiceClient } from '@/lib/supabase'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if ('error' in result) return result.error

    const { id } = await params
    const body = await req.json()
    const { commissie_ids } = body as { commissie_ids: unknown }

    if (!Array.isArray(commissie_ids) || commissie_ids.some((c) => typeof c !== 'string')) {
      return NextResponse.json(
        { error: 'commissie_ids moet een array van UUIDs zijn' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verwijder alle bestaande commissies voor dit lid
    const { error: deleteError } = await supabase
      .from('member_commissies')
      .delete()
      .eq('member_id', id)

    if (deleteError) throw deleteError

    // Voeg nieuwe commissies toe (als er zijn)
    if (commissie_ids.length > 0) {
      const rows = commissie_ids.map((commissie_id) => ({
        member_id: id,
        commissie_id,
      }))

      const { error: insertError } = await supabase
        .from('member_commissies')
        .insert(rows)

      if (insertError) throw insertError
    }

    // Update legacy members.commissie veld met slug van eerste commissie
    let legacySlug: string | null = null

    if (commissie_ids.length > 0) {
      const { data: commissie, error: lookupError } = await supabase
        .from('commissies')
        .select('slug')
        .eq('id', commissie_ids[0])
        .single()

      if (lookupError) throw lookupError
      legacySlug = commissie?.slug ?? null
    }

    const { error: updateError } = await supabase
      .from('members')
      .update({ commissie: legacySlug })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (err) {
    return handleError(err)
  }
}
