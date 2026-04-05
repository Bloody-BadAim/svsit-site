'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ADMIN_EMAILS } from '@/lib/constants'
import { getLevelForXp, getLevelProgress } from '@/lib/levelEngine'

// ─── Corner decoration component ──────────────────────────────────────────────
function CornerDecorations({ color = 'var(--color-accent-gold)' }: { color?: string }) {
  return (
    <>
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: color }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
    </>
  )
}

// ─── Panel header ──────────────────────────────────────────────────────────────
function PanelHeader({ label, color = 'var(--color-text-muted)' }: { label: string; color?: string }) {
  return (
    <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Dark input ────────────────────────────────────────────────────────────────
function DarkInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string
  type?: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="block font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full py-2.5 px-3 text-sm outline-none transition-all duration-200 disabled:opacity-50"
        style={{
          backgroundColor: 'var(--color-bg)',
          color: disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
          border: '1px solid var(--color-border)',
          fontFamily: 'var(--font-mono)',
        }}
        onFocus={(e) => {
          if (!disabled) e.currentTarget.style.borderColor = 'var(--color-accent-gold)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      />
    </div>
  )
}

// ─── Level badge ───────────────────────────────────────────────────────────────
function RankBadge({ points }: { points: number }) {
  const levelDef = getLevelForXp(points)
  const levelProgress = getLevelProgress(points)

  return (
    <div className="flex flex-col gap-3">
      {/* Level title + number */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2"
            style={{ backgroundColor: levelDef.color, boxShadow: `0 0 6px ${levelDef.color}88` }}
          />
          <span
            className="font-mono text-xs font-bold uppercase tracking-[0.15em]"
            style={{ color: levelDef.color }}
          >
            {levelDef.title}
          </span>
        </div>
        <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          LVL {levelDef.level}
        </span>
      </div>

      {/* XP bar */}
      <div>
        <div className="flex justify-between font-mono text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>{points} XP total</span>
          {levelProgress.max > 0
            ? <span>{levelProgress.current}/{levelProgress.max} to next level</span>
            : <span>MAX LEVEL</span>
          }
        </div>
        <div className="h-[4px] w-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress.percent}%` }}
            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            style={{ backgroundColor: levelDef.color }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ProfielPage() {
  const { data: session } = useSession()
  const [studentNumber, setStudentNumber] = useState('')
  const [commissieNames, setCommissieNames] = useState<string[]>([])
  const [membershipActive, setMembershipActive] = useState(false)
  const [memberSince, setMemberSince] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [points, setPoints] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasPassword, setHasPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMessage, setPwMessage] = useState('')

  useEffect(() => {
    if (!session?.user?.id) return

    fetch(`/api/members/${session.user.id}`)
      .then((res) => res.json())
      .then(({ data: member }) => {
        if (member) {
          setStudentNumber((member.student_number as string) || '')
          if (member.member_commissies && (member.member_commissies as { commissies: { naam: string } }[]).length > 0) {
            setCommissieNames((member.member_commissies as { commissies: { naam: string } }[]).map((mc) => mc.commissies.naam))
          } else if (member.commissie) {
            setCommissieNames([member.commissie as string])
          }
          setMembershipActive(member.membership_active as boolean)
          setExpiresAt(member.membership_expires_at as string | null)
          setMemberSince((member.membership_started_at as string) || null)
          setPoints((member.points as number) || 0)
          setHasPassword(!!member.has_password)
        }
      })
      .finally(() => setLoading(false))
  }, [session?.user?.id])

  async function handleSave() {
    if (!session?.user?.id) return
    setSaving(true)
    setMessage('')

    const res = await fetch(`/api/members/${session.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_number: studentNumber || null,
      }),
    })

    setMessage(res.ok ? 'config.saved' : 'error: save_failed')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  async function handlePasswordChange() {
    if (!session?.user?.id) return
    if (!newPassword || newPassword.length < 8) {
      setPwMessage('error: min_8_chars')
      return
    }
    setPwSaving(true)
    setPwMessage('')

    const res = await fetch(`/api/members/${session.user.id}/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: currentPassword || undefined,
        newPassword,
      }),
    })

    const { error } = await res.json()
    if (res.ok) {
      setPwMessage('password.updated')
      setCurrentPassword('')
      setNewPassword('')
      setHasPassword(true)
    } else {
      setPwMessage(error || 'error: update_failed')
    }
    setPwSaving(false)
    setTimeout(() => setPwMessage(''), 4000)
  }

  // ── Character name derived from email ───────────────────────────────────────
  const username = session?.user?.email?.split('@')[0]?.toUpperCase() || 'USER'
  const email = session?.user?.email || ''
  const isAdmin = ADMIN_EMAILS.includes(email)
  const levelDef = getLevelForXp(points)

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl space-y-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-24"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-2 h-2"
            style={{
              backgroundColor: membershipActive ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
              boxShadow: membershipActive
                ? '0 0 8px rgba(34, 197, 94, 0.5)'
                : '0 0 8px rgba(239, 68, 68, 0.5)',
            }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
            character.settings · {levelDef.title} · lvl {levelDef.level}
          </span>
        </div>
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase leading-[0.9]"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          {username}
        </h1>
      </motion.div>

      {/* ── Top two-column: Identity + Account Status ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 mb-5">

        {/* LEFT — CHARACTER IDENTITY */}
        <motion.div
          className="relative overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CornerDecorations color="var(--color-accent-gold)" />
          <PanelHeader label="character.identity" color="var(--color-accent-gold)" />

          <div className="p-5 space-y-5">
            {/* Email display */}
            <DarkInput
              label="identity.email"
              value={email}
              disabled
            />

            {/* Student ID */}
            <DarkInput
              label="student.id"
              value={studentNumber}
              onChange={setStudentNumber}
              placeholder="Niet ingevuld"
            />

            {/* Guild / commissies (read-only, managed by admin) */}
            <div className="space-y-1.5">
              <label
                className="block font-mono text-[10px] uppercase tracking-[0.2em]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                guild.assignment
              </label>
              <div
                className="w-full py-2.5 px-3 text-sm"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  color: commissieNames.length > 0 ? 'var(--color-accent-blue)' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {commissieNames.length > 0 ? commissieNames.join(', ') : '// geen commissie toegewezen'}
              </div>
              <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                // commissies worden toegewezen door het bestuur
              </p>
            </div>

            {/* Save button + message */}
            <div className="flex items-center gap-4 pt-1">
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="relative overflow-hidden font-mono text-[11px] uppercase tracking-[0.2em] py-2.5 px-5 transition-all duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: saving ? 'rgba(242,158,24,0.12)' : 'var(--color-accent-gold)',
                  color: saving ? 'var(--color-accent-gold)' : 'var(--color-bg)',
                  border: '1px solid var(--color-accent-gold)',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? '// saving...' : '> save.config()'}
              </motion.button>

              {message && (
                <motion.span
                  className="font-mono text-[11px]"
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    color: message.startsWith('error')
                      ? 'var(--color-accent-red)'
                      : 'var(--color-accent-green)',
                  }}
                >
                  {message}
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>

        {/* RIGHT — ACCOUNT STATUS */}
        <motion.div
          className="relative overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <CornerDecorations color="var(--color-accent-blue)" />
          <PanelHeader label="account.status" color="var(--color-accent-blue)" />

          <div className="p-5 space-y-5">
            {/* Membership active indicator */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                membership
              </span>
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2"
                  style={{
                    backgroundColor: membershipActive ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
                  }}
                  animate={membershipActive ? { opacity: [1, 0.4, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span
                  className="font-mono text-xs font-bold uppercase tracking-[0.1em]"
                  style={{ color: membershipActive ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}
                >
                  {membershipActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>

            {/* Member since */}
            {memberSince && (
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                  member.since
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--color-text)' }}>
                  {new Date(memberSince).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}

            {/* Expires at */}
            {expiresAt && (
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                  expires
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(expiresAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)' }} />

            {/* Rank badge */}
            <RankBadge points={points} />

            {/* Member since creation fallback */}
            {!memberSince && (
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>
                  account.created
                </span>
                <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  legacy import
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── SECURITY.CONFIG — full width ─────────────────────────────────────── */}
      <motion.div
        className="relative overflow-hidden"
        style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <CornerDecorations color="var(--color-accent-red)" />
        <PanelHeader
          label={`security.config · ${hasPassword ? 'password.change' : 'password.set'}`}
          color="var(--color-accent-red)"
        />

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            {/* Current password — only if password already set */}
            {hasPassword ? (
              <DarkInput
                label="current.password"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="••••••••"
              />
            ) : (
              <div className="flex items-end pb-0.5">
                <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  // no password set yet — set one below
                </span>
              </div>
            )}

            {/* New password */}
            <DarkInput
              label="new.password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="min. 8 characters"
            />

            {/* Confirm button */}
            <div className="flex flex-col gap-2">
              <motion.button
                onClick={handlePasswordChange}
                disabled={pwSaving || !newPassword}
                className="font-mono text-[11px] uppercase tracking-[0.15em] py-2.5 px-5 transition-all duration-200 disabled:opacity-40 whitespace-nowrap"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-accent-red)',
                  border: '1px solid rgba(239,68,68,0.4)',
                }}
                whileHover={{ borderColor: 'var(--color-accent-red)', backgroundColor: 'rgba(239,68,68,0.06)' }}
                whileTap={{ scale: 0.98 }}
              >
                {pwSaving ? '// updating...' : hasPassword ? '> update.pass()' : '> set.pass()'}
              </motion.button>

              {pwMessage && (
                <motion.span
                  className="font-mono text-[10px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    color: pwMessage === 'password.updated'
                      ? 'var(--color-accent-green)'
                      : 'var(--color-accent-red)',
                  }}
                >
                  {pwMessage}
                </motion.span>
              )}
            </div>
          </div>

          {/* Security hint line */}
          <div
            className="mt-4 flex items-center gap-2 font-mono text-[10px]"
            style={{ color: 'var(--color-text-muted)', borderTop: '1px dashed rgba(255,255,255,0.04)', paddingTop: '12px' }}
          >
            <span style={{ color: 'rgba(239,68,68,0.5)' }}>▲</span>
            <span>// password must be ≥8 characters · never share your credentials</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
