'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'motion/react'
import {
  Clock,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  HelpCircle,
} from 'lucide-react'
import { STAT_CATEGORIES } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuestItem {
  id: string
  title: string
  description: string
  category: string
  points: number
  activeUntil: string | null
}

interface SubmissionItem {
  challengeId: string
  status: string
  createdAt: string
}

interface TrackMilestone {
  id: string
  title: string
  completed: boolean
}

interface TrackItem {
  trackId: string
  milestones: TrackMilestone[]
}

interface XpHistoryItem {
  id: string
  amount: number
  source: string
  category: string | null
  createdAt: string
}

export interface QuestsTabProps {
  quests: QuestItem[]
  submissions: SubmissionItem[]
  tracks: TrackItem[]
  xpHistory: XpHistoryItem[]
  memberId: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_STYLES: Record<string, { color: string; label: string }> = {
  code:   { color: '#22C55E', label: 'CODE' },
  social: { color: '#F29E18', label: 'SOCIAL' },
  learn:  { color: '#3B82F6', label: 'LEARN' },
  impact: { color: '#EF4444', label: 'IMPACT' },
}

const TRACK_META: Record<string, { naam: string; beschrijving: string; kleur: string }> = {
  fullstack:   { naam: 'Full Stack Dev',      beschrijving: 'Bouw complete web applicaties',      kleur: '#3B82F6' },
  ai_engineer: { naam: 'AI Engineer',         beschrijving: 'Machine learning en AI tooling',     kleur: '#A855F7' },
  security:    { naam: 'Security Specialist', beschrijving: 'Cyber security en ethical hacking',  kleur: '#22C55E' },
  feestbeest:  { naam: 'Feestbeest',          beschrijving: 'De ultieme SIT social butterfly',    kleur: '#EF4444' },
  community:   { naam: 'Community Builder',   beschrijving: 'Help de SIT community groeien',      kleur: '#F29E18' },
}

const XP_SOURCES_TABLE = [
  { actie: 'Borrel check-in',         xp: '5',      categorie: 'social'  },
  { actie: 'Workshop / event',        xp: '10',     categorie: 'learn'   },
  { actie: 'Hackathon',               xp: '25',     categorie: 'code'    },
  { actie: 'Event organiseren',       xp: '40',     categorie: 'impact'  },
  { actie: 'Weekly quest',            xp: '10-25',  categorie: 'varies'  },
  { actie: 'Skill track milestone',   xp: '15-50',  categorie: 'varies'  },
  { actie: 'Track completion',        xp: '100',    categorie: 'varies'  },
  { actie: 'Boss fight bonus',        xp: '20-75',  categorie: 'n/a'     },
  { actie: 'Badge unlock bonus',      xp: '10-500', categorie: 'n/a'     },
] as const

// ---------------------------------------------------------------------------
// Hook: countdown
// ---------------------------------------------------------------------------

function useCountdown(deadline: string | null) {
  const getTimeLeft = useCallback(() => {
    if (!deadline) return null
    const diff = new Date(deadline).getTime() - Date.now()
    if (diff <= 0) return null
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { days, hours, minutes }
  }, [deadline])

  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 60_000)
    return () => clearInterval(interval)
  }, [getTimeLeft])

  return timeLeft
}

// ---------------------------------------------------------------------------
// Shared: section header
// ---------------------------------------------------------------------------

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="font-mono text-xs uppercase tracking-[0.2em]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
      <div className="flex-1 h-[1px]" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quest row
// ---------------------------------------------------------------------------

type QuestStatus = 'submit' | 'pending' | 'approved' | 'rejected'

function QuestRow({
  quest,
  submission,
  memberId,
}: {
  quest: QuestItem
  submission: SubmissionItem | undefined
  memberId: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const [proofUrl, setProofUrl] = useState('')
  const [proofText, setProofText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const timeLeft = useCountdown(quest.activeUntil)
  const cat = CATEGORY_STYLES[quest.category] ?? CATEGORY_STYLES.code

  const status: QuestStatus = submitted
    ? 'pending'
    : submission?.status === 'approved'
      ? 'approved'
      : submission?.status === 'rejected'
        ? 'rejected'
        : submission?.status === 'pending'
          ? 'pending'
          : 'submit'

  void memberId

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`/api/challenges/${quest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof_url: proofUrl || null,
          proof_text: proofText || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSubmitError(json.error || 'Fout bij indienen')
        return
      }
      setSubmitted(true)
      setExpanded(false)
    } catch {
      setSubmitError('Netwerkfout')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-start gap-3 px-5 py-4">
        {/* Category badge */}
        <div
          className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-0.5"
          style={{
            color: cat.color,
            border: `1px solid ${cat.color}30`,
            backgroundColor: `${cat.color}08`,
          }}
        >
          {cat.label}
        </div>

        {/* Quest info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {quest.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {quest.description}
          </p>
          {timeLeft && (
            <p className="font-mono text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Clock
                className="inline w-3 h-3 mr-1"
                style={{ verticalAlign: 'text-bottom' }}
              />
              {timeLeft.days > 0 && `${timeLeft.days}d `}{timeLeft.hours}h {timeLeft.minutes}m resterend
            </p>
          )}
        </div>

        {/* Right: XP + status */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-accent-gold)' }}>
            +{quest.points}xp
          </span>

          {status === 'approved' && (
            <span
              className="font-mono text-[10px] px-2 py-0.5 inline-flex items-center gap-1"
              style={{ color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <Check className="w-3 h-3" /> DONE
            </span>
          )}
          {status === 'pending' && (
            <span
              className="font-mono text-[10px] px-2 py-0.5 inline-flex items-center gap-1"
              style={{ color: 'var(--color-accent-gold)', border: '1px solid rgba(242,158,24,0.3)' }}
            >
              <Clock className="w-3 h-3" /> REVIEW
            </span>
          )}
          {status === 'rejected' && (
            <span
              className="font-mono text-[10px] px-2 py-0.5 inline-flex items-center gap-1"
              style={{ color: 'var(--color-accent-red)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <X className="w-3 h-3" /> REJECTED
            </span>
          )}
          {status === 'submit' && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="font-mono text-[10px] px-3 py-1 cursor-pointer transition-opacity"
              style={{
                color: 'var(--color-bg)',
                backgroundColor: cat.color,
                opacity: expanded ? 0.75 : 1,
              }}
            >
              {expanded ? 'SLUIT' : 'SUBMIT'}
            </button>
          )}
        </div>
      </div>

      {/* Expandable submit form */}
      <AnimatePresence>
        {expanded && status === 'submit' && (
          <motion.div
            className="px-5 pb-4"
            initial={shouldReduceMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="p-4 space-y-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                className="font-mono text-[10px] uppercase tracking-[0.15em]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {'>'} bewijs indienen
              </div>

              <div>
                <label
                  className="font-mono text-[10px] uppercase tracking-wider block mb-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Link / URL
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full font-mono text-xs px-3 py-2 outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              <div>
                <label
                  className="font-mono text-[10px] uppercase tracking-wider block mb-1"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Toelichting
                </label>
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  rows={3}
                  placeholder="Beschrijf wat je hebt gedaan..."
                  className="w-full font-mono text-xs px-3 py-2 outline-none resize-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              {submitError && (
                <p className="font-mono text-[10px]" style={{ color: 'var(--color-accent-red)' }}>
                  ! {submitError}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || (!proofUrl && !proofText)}
                className="font-mono text-[10px] uppercase tracking-wider px-4 py-2 cursor-pointer transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: cat.color, color: 'var(--color-bg)' }}
              >
                {submitting ? 'BEZIG...' : 'INDIENEN'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Active Quests section
// ---------------------------------------------------------------------------

function ActiveQuestsSection({
  quests,
  submissions,
  memberId,
}: {
  quests: QuestItem[]
  submissions: SubmissionItem[]
  memberId: string
}) {
  const submissionMap = new Map<string, SubmissionItem>()
  for (const s of submissions) {
    submissionMap.set(s.challengeId, s)
  }

  const statusOrder: Record<string, number> = { submit: 0, rejected: 1, pending: 2, approved: 3 }
  const sorted = [...quests].sort((a, b) => {
    const aStatus = submissionMap.get(a.id)?.status ?? 'submit'
    const bStatus = submissionMap.get(b.id)?.status ?? 'submit'
    return (statusOrder[aStatus] ?? 0) - (statusOrder[bStatus] ?? 0)
  })

  return (
    <div>
      <SectionHeader label="weekly.quests" />
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* Panel header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            active challenges
          </span>
          <span
            className="font-mono text-[10px] px-1.5 py-0.5"
            style={{ color: 'var(--color-accent-gold)', border: '1px solid rgba(242,158,24,0.2)' }}
          >
            {quests.length}
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {'>'} geen actieve quests momenteel...
            </p>
            <p className="font-mono text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              check later voor nieuwe challenges
            </p>
          </div>
        ) : (
          <div>
            {sorted.map((quest, i) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05, type: 'spring', stiffness: 400, damping: 28 }}
              >
                <QuestRow
                  quest={quest}
                  submission={submissionMap.get(quest.id)}
                  memberId={memberId}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skill Tracks section
// ---------------------------------------------------------------------------

function TrackMilestoneRow({
  milestone,
  isCurrent,
  trackColor,
  memberId,
}: {
  milestone: TrackMilestone
  isCurrent: boolean
  trackColor: string
  memberId: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const [proofUrl, setProofUrl] = useState('')
  const [proofText, setProofText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  void memberId

  const isCompleted = milestone.completed
  const isPending = submitted && !isCompleted
  const isLocked = !isCurrent && !isCompleted

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`/api/challenges/${milestone.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof_url: proofUrl || null,
          proof_text: proofText || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setSubmitError(json.error || 'Fout bij indienen')
        return
      }
      setSubmitted(true)
      setExpanded(false)
    } catch {
      setSubmitError('Netwerkfout')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-start gap-3 py-2">
      {/* Status dot */}
      <div className="shrink-0 mt-1 relative">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: isCompleted ? trackColor : 'transparent',
            border: isLocked
              ? '1px dashed rgba(255,255,255,0.12)'
              : isPending
                ? `2px solid ${trackColor}60`
                : `2px solid ${trackColor}`,
            opacity: isLocked ? 0.4 : 1,
          }}
        />
        {isCurrent && !isPending && !isCompleted && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `1px solid ${trackColor}` }}
            animate={shouldReduceMotion ? {} : { scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium"
            style={{
              color: isLocked ? 'rgba(255,255,255,0.25)' : 'var(--color-text)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              textDecorationColor: `${trackColor}60`,
            }}
          >
            {milestone.title}
          </span>
          {isCompleted && <Check className="w-3 h-3 shrink-0" style={{ color: trackColor }} />}
          {isPending && <Clock className="w-3 h-3 shrink-0" style={{ color: 'var(--color-accent-gold)' }} />}
        </div>

        {isCurrent && !isCompleted && !isPending && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="font-mono text-[10px] uppercase tracking-wider mt-2 px-2 py-1 cursor-pointer transition-opacity"
            style={{
              border: `1px solid ${trackColor}40`,
              color: trackColor,
              backgroundColor: `${trackColor}08`,
            }}
          >
            {expanded ? 'SLUIT' : 'BEWIJS INDIENEN'}
          </button>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden' }}
              className="mt-2"
            >
              <div
                className="p-3 space-y-2"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${trackColor}15`,
                }}
              >
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="Link / URL bewijs..."
                  className="w-full font-mono text-xs px-2 py-1.5 outline-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  rows={2}
                  placeholder="Toelichting..."
                  className="w-full font-mono text-xs px-2 py-1.5 outline-none resize-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                {submitError && (
                  <p className="font-mono text-[10px]" style={{ color: 'var(--color-accent-red)' }}>
                    ! {submitError}
                  </p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || (!proofUrl && !proofText)}
                  className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 cursor-pointer transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ backgroundColor: trackColor, color: 'var(--color-bg)' }}
                >
                  {submitting ? 'BEZIG...' : 'INDIENEN'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TrackCard({ track, memberId }: { track: TrackItem; memberId: string }) {
  const [open, setOpen] = useState(false)
  const meta = TRACK_META[track.trackId] ?? {
    naam: track.trackId,
    beschrijving: '',
    kleur: '#6B7280',
  }

  const completedCount = track.milestones.filter((m) => m.completed).length
  const totalCount = track.milestones.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const isComplete = completedCount === totalCount && totalCount > 0
  const currentMilestoneId = track.milestones.find((m) => !m.completed)?.id

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: `1px solid ${isComplete ? meta.kleur + '40' : 'var(--color-border)'}`,
      }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: meta.kleur }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Clickable header */}
      <button
        className="w-full text-left px-4 py-3 cursor-pointer"
        style={{ borderBottom: open ? `1px solid ${meta.kleur}15` : 'none' }}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: meta.kleur }}>
            track.{track.trackId}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {completedCount}/{totalCount}
            </span>
            {open
              ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
              : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            }
          </div>
        </div>

        <h3
          className="text-base font-bold uppercase tracking-wide"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          {meta.naam}
        </h3>

        {/* Progress bar */}
        <div className="mt-2 h-[3px] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: meta.kleur, boxShadow: `0 0 8px ${meta.kleur}40` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.2, duration: 0.7, type: 'spring', stiffness: 60, damping: 18 }}
          />
        </div>

        {isComplete && (
          <div className="mt-1.5 font-mono text-[10px] flex items-center gap-1.5" style={{ color: meta.kleur }}>
            <Star className="w-3 h-3 fill-current" /> TRACK VOLTOOID
          </div>
        )}
      </button>

      {/* Milestones — collapsible */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 py-3 space-y-1">
              {track.milestones.map((milestone) => (
                <TrackMilestoneRow
                  key={milestone.id}
                  milestone={milestone}
                  isCurrent={milestone.id === currentMilestoneId}
                  trackColor={meta.kleur}
                  memberId={memberId}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SkillTracksSection({ tracks, memberId }: { tracks: TrackItem[]; memberId: string }) {
  const TRACK_ORDER = ['fullstack', 'ai_engineer', 'security', 'feestbeest', 'community']
  const sorted = [...tracks].sort(
    (a, b) => TRACK_ORDER.indexOf(a.trackId) - TRACK_ORDER.indexOf(b.trackId)
  )

  return (
    <div>
      <SectionHeader label="skill.tracks" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((track, i) => (
          <motion.div
            key={track.trackId}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.07, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <TrackCard track={track} memberId={memberId} />
          </motion.div>
        ))}
      </div>
      {sorted.length === 0 && (
        <div className="py-8 text-center font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {'>'} geen skill tracks beschikbaar...
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// XP History section
// ---------------------------------------------------------------------------

function XpHistorySection({ xpHistory }: { xpHistory: XpHistoryItem[] }) {
  const [limit, setLimit] = useState(15)
  const visible = xpHistory.slice(0, limit)

  function getCatColor(category: string | null): string {
    if (!category) return 'rgba(255,255,255,0.25)'
    const cat = STAT_CATEGORIES.find((c) => c.id === category)
    return cat?.kleur ?? 'rgba(255,255,255,0.25)'
  }

  function formatSource(source: string): string {
    return source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div>
      <SectionHeader label="xp.history" />
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-blue)' }} />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
            transacties
          </span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            {xpHistory.length} totaal
          </span>
        </div>

        {xpHistory.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {'>'} nog geen XP verdiend...
            </p>
            <p className="font-mono text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              ga naar een event en scan je pas
            </p>
          </div>
        ) : (
          <div>
            {visible.map((item, i) => {
              const hash = item.id.slice(0, 7)
              const catColor = getCatColor(item.category)
              const isBadgeUnlock = item.source === 'badge_unlock'

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.02 + i * 0.02 }}
                  className="flex items-center gap-3 px-5 py-2.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  {/* Category dot */}
                  <div className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: catColor }} />

                  {/* Commit-style hash */}
                  <span
                    className="shrink-0 font-mono text-[10px]"
                    style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}
                  >
                    {hash}
                  </span>

                  {/* Source */}
                  <span
                    className="flex-1 min-w-0 text-xs truncate"
                    style={{ color: isBadgeUnlock ? 'var(--color-accent-gold)' : 'var(--color-text-muted)' }}
                  >
                    {isBadgeUnlock && (
                      <Zap
                        className="inline w-3 h-3 mr-1"
                        style={{ color: 'var(--color-accent-gold)', verticalAlign: 'text-bottom' }}
                      />
                    )}
                    {formatSource(item.source)}
                  </span>

                  {/* XP amount */}
                  <span className="shrink-0 font-mono text-xs font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                    +{item.amount}
                  </span>

                  {/* Date */}
                  <span className="shrink-0 font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {new Date(item.createdAt).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </motion.div>
              )
            })}

            {xpHistory.length > limit && (
              <button
                onClick={() => setLimit((v) => v + 15)}
                className="w-full font-mono text-[10px] uppercase tracking-wider py-3 cursor-pointer transition-opacity hover:opacity-80"
                style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}
              >
                laad meer ({xpHistory.length - limit} resterend)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hoe verdien ik XP (collapsible)
// ---------------------------------------------------------------------------

function XpGuideSection() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => setOpen((v) => !v)}
      >
        <HelpCircle className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        <span
          className="font-mono text-xs uppercase tracking-[0.15em] group-hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-muted)' }}
        >
          hoe verdien ik xp?
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
          : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
        }
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="mt-3 overflow-x-auto"
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}
            >
              <table className="w-full text-xs min-w-[360px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                      Actie
                    </th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                      XP
                    </th>
                    <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                      Categorie
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {XP_SOURCES_TABLE.map((row, i) => {
                    const catDef = STAT_CATEGORIES.find((c) => c.id === row.categorie)
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-2" style={{ color: 'var(--color-text)' }}>
                          {row.actie}
                        </td>
                        <td className="px-4 py-2 font-mono font-bold" style={{ color: 'var(--color-accent-gold)' }}>
                          {row.xp}
                        </td>
                        <td className="px-4 py-2">
                          {catDef ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: catDef.kleur }} />
                              <span style={{ color: 'var(--color-text-muted)' }}>{catDef.naam}</span>
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.2)' }}>{row.categorie}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function QuestsTab({
  quests,
  submissions,
  tracks,
  xpHistory,
  memberId,
}: QuestsTabProps) {
  return (
    <div className="space-y-8">
      <ActiveQuestsSection quests={quests} submissions={submissions} memberId={memberId} />
      <SkillTracksSection tracks={tracks} memberId={memberId} />
      <XpHistorySection xpHistory={xpHistory} />
      <XpGuideSection />
    </div>
  )
}
