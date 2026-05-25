'use client'

import { useEffect, useState } from 'react'
import MemberTable from '@/components/admin/MemberTable'

interface MemberCommissieJoin {
  commissie_id: string
  commissies: { slug: string; naam: string }
}

interface MemberRow {
  id: string
  email: string
  display_name: string | null
  student_number: string | null
  role: string
  commissie: string | null
  total_xp: number
  current_level: number
  membership_active: boolean
  membership_started_at: string | null
  membership_expires_at: string | null
  is_admin: boolean
  created_at: string
  member_commissies?: MemberCommissieJoin[]
}

export default function LedenPage() {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)

  function fetchMembers() {
    setLoading(true)
    fetch('/api/members')
      .then((res) => res.json())
      .then(({ data }) => setMembers((data || []) as MemberRow[]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  function exportCsv() {
    const headers = ['Naam', 'Email', 'Studentnummer', 'Rol', 'Commissies', 'XP', 'Status', 'Lid sinds']
    const rows = members.map((m) => [
      m.display_name || '',
      m.email,
      m.student_number || '',
      m.role,
      m.member_commissies?.map((mc) => mc.commissies.naam).join('; ') || '',
      String(m.total_xp),
      m.membership_active ? 'Actief' : 'Inactief',
      m.membership_started_at ? new Date(m.membership_started_at).toLocaleDateString('nl-NL') : '',
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sit-leden-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Ledenlijst
        </h1>
        {members.length > 0 && (
          <button
            onClick={exportCsv}
            className="py-2 px-4 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          >
            Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          ))}
        </div>
      ) : (
        <MemberTable members={members} onRefresh={fetchMembers} />
      )}
    </div>
  )
}
