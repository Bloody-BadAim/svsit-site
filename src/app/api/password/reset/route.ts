import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token en wachtwoord zijn verplicht' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Wachtwoord moet minimaal 8 tekens zijn' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Zoek geldige, ongebruikte token
    const { data: resetToken, error: tokenErr } = await supabase
      .from('password_reset_tokens')
      .select('id, member_id, expires_at, used_at')
      .eq('token', token)
      .maybeSingle()

    if (tokenErr) {
      console.error('[reset-password] Token lookup failed:', tokenErr.message)
      return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
    }

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Link is ongeldig. Vraag een nieuwe aan via de login pagina.' },
        { status: 400 }
      )
    }

    if (resetToken.used_at) {
      return NextResponse.json(
        { error: 'Deze link is al gebruikt. Vraag een nieuwe aan.' },
        { status: 400 }
      )
    }

    if (new Date(resetToken.expires_at as string) < new Date()) {
      return NextResponse.json(
        { error: 'Link is verlopen. Vraag een nieuwe aan via de login pagina.' },
        { status: 400 }
      )
    }

    // Hash nieuw wachtwoord
    const passwordHash = await bcrypt.hash(password, 12)

    // Update wachtwoord
    const { error: updateErr } = await supabase
      .from('members')
      .update({ password_hash: passwordHash })
      .eq('id', resetToken.member_id as string)

    if (updateErr) {
      console.error('[reset-password] Password update failed:', updateErr.message)
      return NextResponse.json({ error: 'Kon wachtwoord niet updaten' }, { status: 500 })
    }

    // Markeer token als gebruikt
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetToken.id as string)

    console.log('[reset-password] Password reset successful for member:', resetToken.member_id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[reset-password] Unexpected error:', err)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
