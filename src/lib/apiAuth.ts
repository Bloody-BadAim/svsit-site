import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 }) }
  }
  return { session }
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 }) }
  }
  if (!session.user.isAdmin && session.user.role !== 'bestuur') {
    return { error: NextResponse.json({ data: null, error: 'Niet geautoriseerd', meta: null }, { status: 403 }) }
  }
  return { session }
}

export function handleError(err: unknown) {
  const raw = err instanceof Error ? err.message : 'Onbekende fout'
  // Sanitize: don't expose internal URLs or stack traces to clients
  const message = raw.toLowerCase().includes('supabase')
    ? 'Service tijdelijk niet beschikbaar'
    : raw
  return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
}
