'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { RANKS } from '@/lib/constants'
import type { Reward } from '@/types/database'

interface MerchClaimsProps {
  rewards: Reward[]
  currentRank: string
  memberId: string
}

interface MerchTier {
  merchId: string
  naam: string
  beschrijving: string
  requiredRank: string
}

const MERCH_TIERS: MerchTier[] = [
  {
    merchId: 'merch_sticker_pack',
    naam: 'SIT Sticker Pack',
    beschrijving: 'Exclusive SIT stickers voor je laptop',
    requiredRank: 'Gold',
  },
  {
    merchId: 'merch_hoodie',
    naam: 'SIT Hoodie',
    beschrijving: 'Officiele SIT hoodie met logo',
    requiredRank: 'Platinum',
  },
  {
    merchId: 'merch_limited_edition',
    naam: 'Limited Edition',
    beschrijving: 'Mystery limited edition item',
    requiredRank: 'Diamond',
  },
]

export default function MerchClaims({ rewards, currentRank, memberId }: MerchClaimsProps) {
  const shouldReduceMotion = useReducedMotion()

  const rankOrder = RANKS.map((r) => r.naam)
  const currentRankIndex = rankOrder.indexOf(currentRank)

  // Local state for claimed rewards so UI updates immediately
  const [claimedRewards, setClaimedRewards] = useState<Map<string, Reward>>(() => {
    const map = new Map<string, Reward>()
    for (const reward of rewards) {
      if (reward.type === 'merch_claim') {
        map.set(reward.reward_id, reward)
      }
    }
    return map
  })

  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)

  async function handleClaim(merchId: string) {
    setClaiming(merchId)
    setClaimError(null)

    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_id: merchId }),
      })

      const json = await res.json() as { data: Reward | null; error: string | null; meta: null }

      if (!res.ok || json.error) {
        setClaimError(json.error ?? 'Claim mislukt')
        return
      }

      if (json.data) {
        setClaimedRewards((prev) => {
          const next = new Map(prev)
          next.set(merchId, json.data!)
          return next
        })
      }
    } catch {
      setClaimError('Netwerkfout — probeer opnieuw')
    } finally {
      setClaiming(null)
    }
  }

  // Suppress unused var
  void memberId

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
          merch.claims
        </span>
        {claimError && (
          <span className="font-mono text-[9px]" style={{ color: 'var(--color-accent-red)' }}>
            {claimError}
          </span>
        )}
      </div>

      {/* Merch list */}
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        {MERCH_TIERS.map((tier, i) => {
          const tierRankIndex = rankOrder.indexOf(tier.requiredRank)
          const isUnlocked = currentRankIndex >= tierRankIndex
          const reward = claimedRewards.get(tier.merchId)
          const isClaimed = !!reward?.claimed_at
          // Eligible: unlocked and not yet claimed (reward may or may not exist in DB yet)
          const isEligible = isUnlocked && !isClaimed
          const isLoading = claiming === tier.merchId

          const tierRank = RANKS.find((r) => r.naam === tier.requiredRank)
          const rankColor = tierRank?.kleur ?? '#6B7280'

          return (
            <motion.div
              key={tier.merchId}
              className="flex items-center gap-4 px-5 py-4"
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                opacity: isUnlocked ? 1 : 0.35,
              }}
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -8 }}
              animate={{ opacity: isUnlocked ? 1 : 0.35, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 400, damping: 28 }}
            >
              {/* Rank indicator */}
              <div
                className="shrink-0 w-10 h-10 flex items-center justify-center"
                style={{
                  border: isUnlocked ? `1px solid ${rankColor}40` : '1px dashed rgba(255,255,255,0.08)',
                  backgroundColor: isUnlocked ? `${rankColor}08` : 'transparent',
                }}
              >
                {isUnlocked ? (
                  <span
                    className="font-mono text-[11px] font-bold"
                    style={{ color: rankColor }}
                  >
                    {tier.requiredRank === 'Gold' ? 'AU' : tier.requiredRank === 'Platinum' ? 'PT' : 'DI'}
                  </span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="7" width="12" height="8" rx="1" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium"
                  style={{ color: isUnlocked ? 'var(--color-text)' : 'rgba(255,255,255,0.3)' }}
                >
                  {tier.naam}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: isUnlocked ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.15)' }}>
                  {tier.beschrijving}
                </p>
              </div>

              {/* Status */}
              <div className="shrink-0">
                {isClaimed ? (
                  <div className="text-right">
                    <span
                      className="font-mono text-[10px] px-2 py-0.5"
                      style={{ color: 'var(--color-accent-green)', border: '1px solid rgba(34,197,94,0.3)' }}
                    >
                      &#10003; CLAIMED
                    </span>
                    {reward.claimed_at && (
                      <p className="font-mono text-[9px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {new Date(reward.claimed_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                ) : isEligible ? (
                  <button
                    disabled={isLoading}
                    onClick={() => handleClaim(tier.merchId)}
                    className="font-mono text-[10px] px-3 py-1 transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--color-accent-gold)',
                      color: 'var(--color-bg)',
                      border: 'none',
                      cursor: isLoading ? 'wait' : 'pointer',
                    }}
                  >
                    {isLoading ? '...' : 'CLAIM'}
                  </button>
                ) : !isUnlocked ? (
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                    Bereik {tier.requiredRank}
                  </span>
                ) : (
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    &#8212;
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
