import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

// POST — Submit proof for a challenge (authenticated member)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const { id } = await params
    const { proof_url, proof_text } = await req.json()

    const supabase = createServiceClient()

    // Check: challenge exists
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, title, proof_required')
      .eq('id', id)
      .single()

    if (challengeError || !challenge) {
      return NextResponse.json({ data: null, error: 'Challenge niet gevonden', meta: null }, { status: 404 })
    }

    // Check: no existing submission for this challenge+member
    const { data: existing, error: existingError } = await supabase
      .from('challenge_submissions')
      .select('id, status')
      .eq('challenge_id', id)
      .eq('member_id', session.user.id)
      .maybeSingle()

    if (existingError) throw existingError

    if (existing) {
      return NextResponse.json(
        { data: null, error: 'Je hebt deze challenge al ingediend', meta: null },
        { status: 409 }
      )
    }

    // Insert submission with status 'pending'
    const { data, error } = await supabase
      .from('challenge_submissions')
      .insert({
        challenge_id: id,
        member_id: session.user.id,
        proof_url: proof_url ?? null,
        proof_text: proof_text ?? null,
        status: 'pending',
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
