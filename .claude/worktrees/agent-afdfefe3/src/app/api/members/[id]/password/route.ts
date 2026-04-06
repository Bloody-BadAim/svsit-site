import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// PATCH — Wachtwoord wijzigen
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const { id } = await params
    if (session.user.id !== id) {
      return NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ data: null, error: 'Nieuw wachtwoord moet minimaal 8 tekens zijn', meta: null }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: member } = await supabase
      .from('members')
      .select('password_hash')
      .eq('id', id)
      .single()

    // Als er al een wachtwoord is, moet het oude kloppen
    if (member?.password_hash) {
      if (!currentPassword) {
        return NextResponse.json({ data: null, error: 'Huidig wachtwoord is vereist', meta: null }, { status: 400 })
      }
      const valid = await bcrypt.compare(currentPassword, member.password_hash as string)
      if (!valid) {
        return NextResponse.json({ data: null, error: 'Huidig wachtwoord is onjuist', meta: null }, { status: 400 })
      }
    }

    const hash = await bcrypt.hash(newPassword, 12)
    const { error } = await supabase
      .from('members')
      .update({ password_hash: hash })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ data: { success: true }, error: null, meta: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
