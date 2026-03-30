'use client'

import QRCode from 'react-qr-code'
import { getRank, ROLLEN } from '@/lib/constants'
import type { Role } from '@/types/database'

interface MemberCardProps {
  memberId: string
  email: string
  studentNumber: string | null
  role: Role
  points: number
}

export default function MemberCard({ memberId, email, studentNumber, role, points }: MemberCardProps) {
  const rank = getRank(points)
  const rolNaam = ROLLEN[role].naam

  const qrData = JSON.stringify({
    id: memberId,
    email,
    t: Date.now(),
  })

  return (
    <div
      className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header met logo */}
      <div
        className="px-6 pt-6 pb-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <span
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent-gold)' }}
        >
          {'{'}<span style={{ color: 'var(--color-text)' }}>SIT</span>{'}'}
        </span>
        <span
          className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
          style={{
            backgroundColor: `${rank.kleur}20`,
            color: rank.kleur,
            border: `1px solid ${rank.kleur}40`,
          }}
        >
          {rank.naam}
        </span>
      </div>

      {/* QR Code */}
      <div className="px-6 py-8 flex justify-center">
        <div className="bg-white p-4 rounded-xl">
          <QRCode
            value={qrData}
            size={200}
            level="M"
            bgColor="#ffffff"
            fgColor="#09090B"
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-6 pb-6 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Naam
          </p>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
            {email.split('@')[0]}
          </p>
        </div>

        {studentNumber && (
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Studentnummer
            </p>
            <p className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {studentNumber}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Rol
            </p>
            <p className="font-semibold" style={{ color: 'var(--color-accent-blue)' }}>
              {rolNaam}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Punten
            </p>
            <p className="font-bold text-lg" style={{ color: 'var(--color-accent-gold)' }}>
              {points}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
