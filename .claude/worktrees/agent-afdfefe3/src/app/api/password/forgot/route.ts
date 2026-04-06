import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase'
import { sendPasswordResetEmail } from '@/lib/email'

const TOKEN_EXPIRY_DAYS = 7

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail } = await req.json()

    if (!rawEmail) {
      return NextResponse.json({ error: 'Email is verplicht' }, { status: 400 })
    }

    const email = rawEmail.toLowerCase().trim()
    const supabase = createServiceClient()

    // Zoek member
    const { data: member } = await supabase
      .from('members')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    // Altijd success teruggeven (voorkom email enumeration)
    if (!member) {
      console.log('[forgot-password] No member found for:', email)
      return NextResponse.json({ success: true })
    }

    // Genereer token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

    // Verwijder oude tokens voor deze user
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('member_id', member.id as string)

    // Sla nieuwe token op
    const { error: tokenErr } = await supabase
      .from('password_reset_tokens')
      .insert({
        member_id: member.id as string,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenErr) {
      console.error('[forgot-password] Token insert failed:', tokenErr.message)
      return NextResponse.json({ error: 'Kon reset link niet aanmaken' }, { status: 500 })
    }

    // Stuur email
    const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://svsit.nl'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    try {
      await sendPasswordResetEmail(email, null, resetUrl)
      console.log('[forgot-password] Reset email sent to:', email)
    } catch (emailErr) {
      console.error('[forgot-password] Email failed:', emailErr)
      // Verwijder token als email niet gestuurd kon worden
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('token', token)
      return NextResponse.json({ error: 'Kon email niet versturen' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password] Unexpected error:', err)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
