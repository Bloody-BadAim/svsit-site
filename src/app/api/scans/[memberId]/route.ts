import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'

// GET — Scan geschiedenis per lid
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ data: null, error: 'Niet ingelogd', meta: null }, { status: 401 })
    }

    const { memberId } = await params
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data, error: null, meta: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return NextResponse.json({ data: null, error: message, meta: null }, { status: 500 })
  }
}
