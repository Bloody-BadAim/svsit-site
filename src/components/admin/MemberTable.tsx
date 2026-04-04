'use client'

import { useState, useMemo } from 'react'
import { useAdminStore } from '@/stores/useAdminStore'
import { COMMISSIES } from '@/lib/constants'
import MemberDetailModal from './MemberDetailModal'

interface MemberCommissieJoin {
  commissie_id: string
  commissies: { slug: string; naam: string }
}

interface MemberRow {
  id: string
  email: string
  student_number: string | null
  role: string
  commissie: string | null
  points: number
  membership_active: boolean
  membership_started_at: string | null
  is_admin: boolean
  created_at: string
  member_commissies?: MemberCommissieJoin[]
}

interface MemberTableProps {
  members: MemberRow[]
  onRefresh: () => void
}

function getCommissieSlugs(member: MemberRow): string[] {
  if (member.member_commissies && member.member_commissies.length > 0) {
    return member.member_commissies.map(mc => mc.commissies.slug)
  }
  return member.commissie ? [member.commissie] : []
}

function getCommissieNames(member: MemberRow): string[] {
  if (member.member_commissies && member.member_commissies.length > 0) {
    return member.member_commissies.map(mc => mc.commissies.naam)
  }
  if (member.commissie) {
    const found = COMMISSIES.find(c => c.id === member.commissie)
    return [found?.naam || member.commissie]
  }
  return []
}

function exportCSV(members: MemberRow[]) {
  const headers = ['Email', 'Studentnummer', 'Rol', 'Commissie(s)', 'Punten', 'Status', 'Lid sinds']
  const rows = members.map(m => [
    m.email,
    m.student_number || '',
    m.role,
    getCommissieNames(m).join(' | ') || '',
    m.points.toString(),
    m.membership_active ? 'Actief' : 'Inactief',
    m.created_at ? new Date(m.created_at).toLocaleDateString('nl-NL') : ''
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sit-leden-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function MemberTable({ members, onRefresh }: MemberTableProps) {
  const { filters, setFilter } = useAdminStore()
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newStudentNr, setNewStudentNr] = useState('')
  const [newRole, setNewRole] = useState('member')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  async function handleAddMember() {
    if (!newEmail) return
    setAdding(true)
    setAddError('')
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, student_number: newStudentNr || null, role: newRole }),
    })
    if (res.ok) {
      setNewEmail('')
      setNewStudentNr('')
      setNewRole('member')
      setShowAddForm(false)
      onRefresh()
    } else {
      const data = await res.json()
      setAddError(data.error || 'Fout bij aanmaken')
    }
    setAdding(false)
  }

  const filtered = useMemo(() => {
    let result = [...members]

    if (filters.zoekterm) {
      const term = filters.zoekterm.toLowerCase()
      result = result.filter(
        (m) =>
          m.email.toLowerCase().includes(term) ||
          (m.student_number && m.student_number.toLowerCase().includes(term))
      )
    }

    if (filters.status !== 'all') {
      result = result.filter((m) =>
        filters.status === 'active' ? m.membership_active : !m.membership_active
      )
    }

    if (filters.role !== 'all') {
      result = result.filter((m) => m.role === filters.role)
    }

    if (filters.commissie !== 'all') {
      result = result.filter((m) => {
        const slugs = getCommissieSlugs(m)
        return slugs.includes(filters.commissie)
      })
    }

    result.sort((a, b) => {
      const aVal = a[filters.sortBy as keyof MemberRow] ?? ''
      const bVal = b[filters.sortBy as keyof MemberRow] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return filters.sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  }, [members, filters])

  return (
    <div className="space-y-4">
      {/* Add member section */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-2 px-4 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg)' }}
        >
          + Nieuw lid
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex flex-wrap gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email..."
              className="flex-1 min-w-[200px] py-2 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            />
            <input
              type="text"
              value={newStudentNr}
              onChange={(e) => setNewStudentNr(e.target.value)}
              placeholder="Studentnummer (optioneel)"
              className="py-2 px-3 rounded-lg text-sm outline-none"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="py-2 px-3 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            >
              <option value="member">Member</option>
              <option value="contributor">Contributor</option>
              <option value="mentor">Mentor</option>
              <option value="bestuur">Bestuur</option>
            </select>
            <button
              onClick={handleAddMember}
              disabled={adding || !newEmail}
              className="py-2 px-4 rounded-lg text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg)' }}
            >
              {adding ? 'Toevoegen...' : 'Toevoegen'}
            </button>
          </div>
          {addError && <p className="text-sm" style={{ color: 'var(--color-accent-red)' }}>{addError}</p>}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={filters.zoekterm}
          onChange={(e) => setFilter('zoekterm', e.target.value)}
          placeholder="Zoek op email of studentnummer..."
          className="flex-1 min-w-[200px] py-2 px-3 rounded-lg text-sm outline-none"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value as 'all' | 'active' | 'expired')}
          className="py-2 px-3 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        >
          <option value="all">Alle statussen</option>
          <option value="active">Actief</option>
          <option value="expired">Inactief</option>
        </select>
        <select
          value={filters.role}
          onChange={(e) => setFilter('role', e.target.value as typeof filters.role)}
          className="py-2 px-3 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        >
          <option value="all">Alle rollen</option>
          <option value="member">Member</option>
          <option value="contributor">Contributor</option>
          <option value="mentor">Mentor</option>
          <option value="bestuur">Bestuur</option>
        </select>
        <select
          value={filters.commissie}
          onChange={(e) => setFilter('commissie', e.target.value)}
          className="py-2 px-3 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        >
          <option value="all">Alle commissies</option>
          {COMMISSIES.map((c) => (
            <option key={c.id} value={c.id}>{c.naam}</option>
          ))}
        </select>
        <button
          onClick={() => exportCSV(filtered)}
          className="py-2 px-4 rounded-lg text-sm font-semibold flex items-center gap-2"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-accent-gold)',
            border: '1px solid var(--color-accent-gold)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export CSV
        </button>
      </div>

      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {filtered.length} leden gevonden
      </p>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface)' }}>
              {['Email', 'Studentnr.', 'Rol', 'Commissie(s)', 'Punten', 'Status', 'Lid sinds'].map((col) => (
                <th
                  key={col}
                  className="text-left px-4 py-3 font-semibold uppercase tracking-wider text-xs"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--color-border)' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => {
              const names = getCommissieNames(member)
              return (
                <tr
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td className="px-4 py-3" style={{ color: 'var(--color-text)' }}>
                    <span className="inline-flex items-center gap-1.5">
                      {member.email}
                      {member.is_admin && (
                        <span
                          className="text-[9px] font-bold px-1 py-px rounded uppercase tracking-wider"
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-accent-red)' }}
                        >
                          Admin
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>{member.student_number || '\u2014'}</td>
                  <td className="px-4 py-3 capitalize" style={{ color: 'var(--color-accent-blue)' }}>{member.role}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>
                    {names.length > 0 ? names.join(', ') : '\u2014'}
                  </td>
                  <td className="px-4 py-3 font-bold" style={{ color: 'var(--color-accent-gold)' }}>{member.points}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: member.membership_active ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}
                    />
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-muted)' }}>
                    {member.created_at ? new Date(member.created_at).toLocaleDateString('nl-NL') : '\u2014'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdate={() => {
            setSelectedMember(null)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}
