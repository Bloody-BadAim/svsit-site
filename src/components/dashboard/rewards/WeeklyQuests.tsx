'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'motion/react'
import type { Challenge, ChallengeSubmission, StatCategory } from '@/types/database'

interface WeeklyQuestsProps {
  quests: Challenge[]
  submissions: ChallengeSubmission[]
  memberId: string
}

const CATEGORY_STYLES: Record<StatCategory, { color: string; label: string }> = {
  code:   { color: '#3B82F6', label: 'CODE' },
  social: { color: '#F29E18', label: 'SOCIAL' },
  learn:  { color: '#22C55E', label: 'LEARN' },
  impact: { color: '#EF4444', label: 'IMPACT' },
}

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

function QuestItem({
  quest,
  submission,
  memberId,
}: {
  quest: Challenge
  submission: ChallengeSubmission | undefined
  memberId: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const [proofUrl, setProofUrl] = useState('')
  const [proofText, setProofText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const timeLeft = useCountdown(quest.active_until)
  const cat = CATEGORY_STYLES[quest.category] ?? CATEGORY_STYLES.code

  const status: 'submit' | 'pending' | 'approved' | 'rejected' = submitted
    ? 'pending'
    : submission?.status === 'approved'
      ? 'approved'
      : submission?.status === 'rejected'
        ? 'rejected'
        : submission?.status === 'pending'
          ? 'pending'
          : 'submit'

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

  // Suppress unused var warning — memberId used for future server actions
  void memberId

  return (
    <div
      className="relative"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Category badge */}
        <div
          className="shrink-0 font-mono text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-1 mt-0.5"
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
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {quest.description}
          </p>
          {timeLeft && (
            <p className="font-mono text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {timeLeft.days > 0 && `${timeLeft.days}d `}{timeLeft.hours}h {timeLeft.minutes}m resterend
            </p>
          )}
        </div>

        {/* Right side: points + status */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-accent-gold)' }}>
            +{quest.points}xp
          </span>

          {status === 'approved' && (
            <span className="font-mono text-xs px-2 py-0.5" style={{ color: 'var(--color-accent-green)', border: '1px solid rgba(34,197,94,0.3)' }}>
              &#10003; DONE
            </span>
          )}
          {status === 'pending' && (
            <span className="font-mono text-xs px-2 py-0.5" style={{ color: 'var(--color-accent-gold)', border: '1px solid rgba(242,158,24,0.3)' }}>
              &#8987; REVIEW
            </span>
          )}
          {status === 'rejected' && (
            <span className="font-mono text-xs px-2 py-0.5" style={{ color: 'var(--color-accent-red)', border: '1px solid rgba(239,68,68,0.3)' }}>
              &#10007; REJECTED
            </span>
          )}
          {status === 'submit' && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="font-mono text-xs px-3 py-1 cursor-pointer transition-all duration-200"
              style={{
                color: 'var(--color-bg)',
                backgroundColor: cat.color,
                opacity: expanded ? 0.8 : 1,
              }}
            >
              {expanded ? 'SLUIT' : 'SUBMIT'}
            </button>
          )}
        </div>
      </div>

      {/* Inline submit form */}
      <AnimatePresence>
        {expanded && status === 'submit' && (
          <motion.div
            className="px-5 pb-4"
            initial={shouldReduceMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="p-4 space-y-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
            >
              <div className="font-mono text-xs uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--color-text-muted)' }}>
                {'>'} bewijs indienen
              </div>

              {(quest.proof_type === 'link' || quest.proof_type === 'screenshot') && (
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>
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
              )}

              {(quest.proof_type === 'text' || !quest.proof_type || quest.proof_type === 'link') && (
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>
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
              )}

              {submitError && (
                <p className="font-mono text-xs" style={{ color: 'var(--color-accent-red)' }}>
                  ! {submitError}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || (!proofUrl && !proofText)}
                className="font-mono text-xs uppercase tracking-wider px-4 py-2 cursor-pointer transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: cat.color,
                  color: 'var(--color-bg)',
                }}
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

export default function WeeklyQuests({ quests, submissions, memberId }: WeeklyQuestsProps) {
  const shouldReduceMotion = useReducedMotion()

  const submissionMap = new Map<string, ChallengeSubmission>()
  for (const sub of submissions) {
    submissionMap.set(sub.challenge_id, sub)
  }

  // Sort: submit-able first, then pending, then completed
  const sortedQuests = [...quests].sort((a, b) => {
    const aStatus = submissionMap.get(a.id)?.status
    const bStatus = submissionMap.get(b.id)?.status
    const order = { undefined: 0, pending: 1, rejected: 2, approved: 3 }
    return (order[aStatus as keyof typeof order] ?? 0) - (order[bStatus as keyof typeof order] ?? 0)
  })

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: 'var(--color-accent-gold)' }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
          weekly.quests
        </span>
        <motion.span
          className="font-mono text-xs px-1.5 py-0.5"
          style={{ color: 'var(--color-accent-gold)', border: '1px solid rgba(242, 158, 24, 0.2)' }}
          initial={shouldReduceMotion ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 500, damping: 15 }}
        >
          {quests.length}
        </motion.span>
      </div>

      {/* Quest list */}
      {sortedQuests.length === 0 ? (
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
          {sortedQuests.map((quest, i) => (
            <motion.div
              key={quest.id}
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
            >
              <QuestItem
                quest={quest}
                submission={submissionMap.get(quest.id)}
                memberId={memberId}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
