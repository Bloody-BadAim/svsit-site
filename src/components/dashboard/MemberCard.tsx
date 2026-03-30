'use client'

import QRCode from 'react-qr-code'
import { getRank, ROLLEN } from '@/lib/constants'
import type { Role } from '@/types/database'
import { Trophy, Zap, Users } from 'lucide-react'

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
  const username = email.split('@')[0]

  const qrData = JSON.stringify({
    id: memberId,
    email,
    t: Date.now(),
  })

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Main card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Top gradient accent bar */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, var(--color-accent-gold), var(--color-accent-blue), var(--color-accent-red), var(--color-accent-green))`,
          }}
        />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span style={{ color: 'var(--color-accent-gold)' }}>{'{'}</span>
              <span style={{ color: 'var(--color-text)' }}>SIT</span>
              <span style={{ color: 'var(--color-accent-gold)' }}>{'}'}</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Ledenpas
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${rank.kleur}15`,
              color: rank.kleur,
              border: `1px solid ${rank.kleur}30`,
            }}
          >
            <Trophy size={12} />
            {rank.naam}
          </div>
        </div>

        {/* Divider with glow */}
        <div className="px-6">
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)' }} />
        </div>

        {/* QR Code */}
        <div className="px-6 py-7 flex justify-center">
          <div
            className="bg-white p-4 rounded-xl relative"
            style={{
              boxShadow: '0 0 30px rgba(242, 158, 24, 0.06)',
            }}
          >
            <QRCode
              value={qrData}
              size={190}
              level="M"
              bgColor="#ffffff"
              fgColor="#09090B"
            />
          </div>
        </div>

        {/* User info */}
        <div className="px-6 pb-6">
          {/* Name + studentnummer */}
          <div className="mb-4">
            <p
              className="text-xl font-bold tracking-tight"
              style={{
                color: 'var(--color-text)',
                fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
              }}
            >
              {username.toUpperCase()}
            </p>
            {studentNumber && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                #{studentNumber}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 gap-3 p-3 rounded-xl"
            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users size={11} style={{ color: 'var(--color-accent-blue)' }} />
                <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Rol
                </span>
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-accent-blue)' }}>
                {rolNaam}
              </p>
            </div>
            <div className="text-center" style={{ borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap size={11} style={{ color: 'var(--color-accent-gold)' }} />
                <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Punten
                </span>
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                {points}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy size={11} style={{ color: rank.kleur }} />
                <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Rank
                </span>
              </div>
              <p className="text-sm font-bold" style={{ color: rank.kleur }}>
                {rank.naam}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="px-6 py-3 flex items-center justify-between"
          style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}
        >
          <span className="text-[10px] tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            svsit.nl
          </span>
          <span className="text-[10px] tracking-wider" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            Studievereniging ICT
          </span>
        </div>
      </div>
    </div>
  )
}
