import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 }) }
  }
  return { session }
}

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 }) }
  }
  if (!session.user.isAdmin) {
    return { error: NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 }) }
  }
  return { session }
}

export function handleError(err: unknown) {
  const message = err instanceof Error ? err.message : 'Onbekende fout'
  return NextResponse.json({ error: message }, { status: 500 })
}
