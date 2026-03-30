import { auth } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { ADMIN_EMAILS } from '@/lib/constants'
import StatsOverview from '@/components/admin/StatsOverview'

export const metadata = {
  title: 'Admin — SIT',
}

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect('/dashboard')
  }

  const supabase = createServiceClient()
  const { data: members } = await supabase
    .from('members')
    .select('role, commissie, membership_active, created_at')

  const allMembers = (members || []) as Array<{
    role: string
    commissie: string | null
    membership_active: boolean
    created_at: string
  }>

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const stats = {
    totaal: allMembers.length,
    actief: allMembers.filter((m) => m.membership_active).length,
    nieuwDezeMaand: allMembers.filter((m) => new Date(m.created_at) >= startOfMonth).length,
    perRol: {
      member: allMembers.filter((m) => m.role === 'member').length,
      contributor: allMembers.filter((m) => m.role === 'contributor').length,
      mentor: allMembers.filter((m) => m.role === 'mentor').length,
    },
    perCommissie: allMembers.reduce<Record<string, number>>((acc, m) => {
      const key = m.commissie || 'Geen'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {}),
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
        Admin Overview
      </h1>
      <StatsOverview stats={stats} />
    </div>
  )
}
