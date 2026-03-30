'use client'

import { useEffect, useState } from 'react'
import MemberTable from '@/components/admin/MemberTable'

interface MemberRow {
  id: string
  email: string
  student_number: string | null
  role: string
  commissie: string | null
  points: number
  membership_active: boolean
  membership_started_at: string | null
  created_at: string
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
        Ledenlijst
      </h1>

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
