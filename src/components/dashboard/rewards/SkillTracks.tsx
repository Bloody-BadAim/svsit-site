'use client'

import { useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'motion/react'
import type { Challenge, ChallengeSubmission } from '@/types/database'
import { Check, Clock, X, Star } from 'lucide-react'

interface TrackData {
  trackId: string
  milestones: Challenge[]
  submissions: ChallengeSubmission[]
}

interface SkillTracksProps {
  tracks: TrackData[]
  memberId: string
}

const TRACK_META: Record<string, { naam: string; beschrijving: string; kleur: string }> = {
  fullstack:   { naam: 'Full Stack Dev',      beschrijving: 'Bouw complete web applicaties',        kleur: '#3B82F6' },
  ai_engineer: { naam: 'AI Engineer',          beschrijving: 'Machine learning en AI tooling',      kleur: '#A855F7' },
  security:    { naam: 'Security Specialist',  beschrijving: 'Cyber security en ethical hacking',   kleur: '#22C55E' },
  feestbeest:  { naam: 'Feestbeest',           beschrijving: 'De ultieme SIT social butterfly',     kleur: '#EF4444' },
  community:   { naam: 'Community Builder',    beschrijving: 'Help de SIT community groeien',       kleur: '#F29E18' },
}

function MilestoneItem({
  milestone,
  submission,
  isCurrentMilestone,
  memberId,
  trackColor,
}: {
  milestone: Challenge
  submission: ChallengeSubmission | undefined
  isCurrentMilestone: boolean
  memberId: string
  trackColor: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const [proofUrl, setProofUrl] = useState('')
  const [proofText, setProofText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const isCompleted = submission?.status === 'approved'
  const isPending = submission?.status === 'pending' || submitted
  const isRejected = submission?.status === 'rejected'
  const isLocked = !isCurrentMilestone && !isCompleted && !isPending && !isRejected

  // Suppress unused var warning
  void memberId

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
    <div className="relative flex items-start gap-3 py-2">
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
                : isRejected
                  ? '2px solid rgba(239,68,68,0.5)'
                  : isCurrentMilestone
                    ? `2px solid ${trackColor}`
                    : `2px solid ${trackColor}`,
            opacity: isLocked ? 0.4 : 1,
          }}
        />
        {isCurrentMilestone && !isPending && !isCompleted && !isRejected && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `1px solid ${trackColor}` }}
            animate={shouldReduceMotion ? {} : { scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Milestone content */}
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
          {isCompleted && (
            <Check className="w-3 h-3 shrink-0" style={{ color: trackColor }} />
          )}
          {isPending && (
            <Clock className="w-3 h-3 shrink-0" style={{ color: 'var(--color-accent-gold)' }} />
          )}
          {isRejected && (
            <X className="w-3 h-3 shrink-0" style={{ color: 'var(--color-accent-red)' }} />
          )}
        </div>

        {!isLocked && (
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {milestone.description}
          </p>
        )}

        {/* Submit button for current milestone */}
        {isCurrentMilestone && !isCompleted && !isPending && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-mono text-[10px] md:text-xs uppercase tracking-wider mt-2 px-2 py-1 cursor-pointer transition-opacity"
            style={{
              border: `1px solid ${trackColor}40`,
              color: trackColor,
              backgroundColor: `${trackColor}08`,
            }}
          >
            {expanded ? 'SLUIT' : 'BEWIJS INDIENEN'}
          </button>
        )}

        {/* Inline submit form */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={shouldReduceMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
              className="mt-2"
            >
              <div
                className="p-3 space-y-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${trackColor}15` }}
              >
                {(milestone.proof_type === 'link' || milestone.proof_type === 'screenshot') && (
                  <input
                    type="url"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="Link / URL bewijs..."
                    className="w-full font-mono text-xs md:text-sm px-2 py-1.5 outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                )}
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  rows={2}
                  placeholder="Toelichting..."
                  className="w-full font-mono text-xs md:text-sm px-2 py-1.5 outline-none resize-none"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                {submitError && (
                  <p className="font-mono text-[10px] md:text-xs" style={{ color: 'var(--color-accent-red)' }}>
                    ! {submitError}
                  </p>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || (!proofUrl && !proofText)}
                  className="font-mono text-[10px] md:text-xs uppercase tracking-wider px-3 py-1.5 cursor-pointer transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ backgroundColor: trackColor, color: 'var(--color-bg)' }}
                >
                  {submitting ? 'BEZIG...' : 'INDIENEN'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Points */}
      <span
        className="shrink-0 font-mono text-xs"
        style={{ color: isLocked ? 'rgba(255,255,255,0.12)' : `${trackColor}80` }}
      >
        +{milestone.points}xp
      </span>
    </div>
  )
}

function TrackCard({ track, memberId }: { track: TrackData; memberId: string }) {
  const meta = TRACK_META[track.trackId] ?? {
    naam: track.trackId,
    beschrijving: '',
    kleur: '#6B7280',
  }

  // Sort milestones by track_order
  const sorted = [...track.milestones].sort(
    (a, b) => (a.track_order ?? 0) - (b.track_order ?? 0)
  )

  const submissionMap = new Map<string, ChallengeSubmission>()
  for (const sub of track.submissions) {
    submissionMap.set(sub.challenge_id, sub)
  }

  const completedCount = sorted.filter(
    (m) => submissionMap.get(m.id)?.status === 'approved'
  ).length
  const totalCount = sorted.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const isComplete = completedCount === totalCount && totalCount > 0

  // Find current milestone (first non-completed, non-pending)
  const currentMilestoneId = sorted.find((m) => {
    const sub = submissionMap.get(m.id)
    return !sub || sub.status === 'rejected'
  })?.id

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: `1px solid ${isComplete ? meta.kleur + '40' : 'var(--color-border)'}`,
      }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: meta.kleur }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Track header */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${meta.kleur}15` }}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: meta.kleur }}>
            track.{track.trackId}
          </span>
          <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <h3
          className="text-lg font-bold uppercase tracking-wide"
          style={{
            color: 'var(--color-text)',
            fontFamily: "'Big Shoulders Display', var(--font-geist-sans), sans-serif",
          }}
        >
          {meta.naam}
        </h3>
        <p className="text-xs md:text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {meta.beschrijving}
        </p>

        {/* Progress bar */}
        <div className="mt-3 h-[3px] overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <motion.div
            className="h-full"
            style={{
              backgroundColor: meta.kleur,
              boxShadow: `0 0 8px ${meta.kleur}40`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.3, duration: 0.8, type: 'spring', stiffness: 60, damping: 18 }}
          />
        </div>

        {isComplete && (
          <div className="mt-2 font-mono text-xs flex items-center gap-1.5" style={{ color: meta.kleur }}>
            <Star className="w-3.5 h-3.5 fill-current" /> TRACK VOLTOOID
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="px-4 py-3 space-y-1">
        {sorted.map((milestone) => (
          <MilestoneItem
            key={milestone.id}
            milestone={milestone}
            submission={submissionMap.get(milestone.id)}
            isCurrentMilestone={milestone.id === currentMilestoneId}
            memberId={memberId}
            trackColor={meta.kleur}
          />
        ))}
      </div>
    </div>
  )
}

export default function SkillTracks({ tracks, memberId }: SkillTracksProps) {
  const shouldReduceMotion = useReducedMotion()

  // Order tracks by defined order
  const trackOrder = ['fullstack', 'ai_engineer', 'security', 'feestbeest', 'community']
  const sorted = [...tracks].sort(
    (a, b) => trackOrder.indexOf(a.trackId) - trackOrder.indexOf(b.trackId)
  )

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
          skill.tracks
        </span>
        <div className="flex-1 h-[1px]" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Track grid — 2 cols on large, 1 col on small */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((track, i) => (
          <motion.div
            key={track.trackId}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
          >
            <TrackCard track={track} memberId={memberId} />
          </motion.div>
        ))}
      </div>

      {sorted.length === 0 && (
        <div
          className="py-8 text-center font-mono text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {'>'} geen skill tracks beschikbaar...
        </div>
      )}
    </div>
  )
}
