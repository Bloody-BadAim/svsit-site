'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Flame, Coins } from 'lucide-react'
import MyCardTab from '@/components/dashboard/tabs/MyCardTab'
import QuestsTab from '@/components/dashboard/tabs/QuestsTab'
import BadgesTab from '@/components/dashboard/tabs/BadgesTab'
import type { MemberCardData, MemberCardEquipment } from '@/components/MemberCard'
import type { ActivityItem, NextUnlock } from '@/components/dashboard/tabs/MyCardTab'
import type { QuestsTabProps } from '@/components/dashboard/tabs/QuestsTab'
import type { BadgesTabProps } from '@/components/dashboard/tabs/BadgesTab'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = 'card' | 'quests' | 'badges'

export interface DashboardClientProps {
  // Top bar
  level: number
  levelTitle: string
  tierColor: string
  xpCurrent: number
  xpMax: number
  xpPercent: number
  streak: number
  coins: number

  // Card tab
  cardData: MemberCardData
  equipment?: MemberCardEquipment
  memberId: string
  activeSkin: string
  hasBoss: boolean
  activityItems: ActivityItem[]
  nextUnlock: NextUnlock | null
  xpToday: number

  // Quests tab
  questsTabProps: QuestsTabProps

  // Badges tab
  badgesTabProps: BadgesTabProps

  // Welcome banner
  isWelcome: boolean
}

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const TABS: { id: Tab; label: string }[] = [
  { id: 'card', label: 'MY CARD' },
  { id: 'quests', label: 'QUESTS' },
  { id: 'badges', label: 'BADGES' },
]

// ---------------------------------------------------------------------------
// Inner component (needs Suspense boundary because of useSearchParams)
// ---------------------------------------------------------------------------

function DashboardContent(props: DashboardClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialTab = searchParams.get('tab') as Tab | null
  const [activeTab, setActiveTab] = useState<Tab>(
    initialTab && ['card', 'quests', 'badges'].includes(initialTab) ? initialTab : 'card'
  )

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    router.replace(`/dashboard?tab=${tab}`, { scroll: false })
  }

  const {
    level, levelTitle, tierColor, xpCurrent, xpMax, xpPercent,
    streak, coins, isWelcome,
    cardData, equipment, memberId, activeSkin, hasBoss,
    activityItems, nextUnlock, xpToday,
    questsTabProps, badgesTabProps,
  } = props

  return (
    <div>
      {/* Welcome banner */}
      {isWelcome && (
        <div
          className="px-4 py-3 mb-0"
          style={{
            backgroundColor: 'rgba(242, 158, 24, 0.03)',
            borderBottom: '1px solid rgba(242, 158, 24, 0.1)',
          }}
        >
          <span className="font-mono text-sm" style={{ color: 'var(--color-accent-gold)' }}>
            membership activated -- welkom bij SIT
          </span>
        </div>
      )}

      {/* Persistent top bar */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 gap-2 sm:gap-0"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          {/* Level badge */}
          <span
            className="text-xs font-bold font-mono"
            style={{ color: tierColor }}
          >
            LVL {level}
          </span>

          {/* Level title */}
          <span className="text-white text-sm font-mono">
            {levelTitle}
          </span>

          {/* XP bar */}
          <div className="flex items-center gap-2">
            <div
              className="w-32 h-1 rounded overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="h-full rounded transition-all duration-700"
                style={{ width: `${xpPercent}%`, background: tierColor }}
              />
            </div>
            <span className="text-gray-600 text-xs font-mono">
              {xpCurrent}/{xpMax}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Streak */}
          <div className="flex items-center gap-1 text-xs font-mono">
            <Flame className="w-3 h-3 text-red-500" />
            <span className="text-red-500">{streak}</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1 text-xs font-mono">
            <Coins className="w-3 h-3" style={{ color: 'var(--color-accent-gold)' }} />
            <span style={{ color: 'var(--color-accent-gold)' }}>{coins.toLocaleString('nl-NL')}</span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className="px-5 py-2.5 text-xs font-mono tracking-wider transition-colors cursor-pointer"
            style={{
              color: activeTab === tab.id ? 'var(--color-accent-gold)' : 'rgba(255,255,255,0.3)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'card' && (
        <MyCardTab
          cardData={cardData}
          equipment={equipment}
          memberId={memberId}
          activeSkin={activeSkin}
          hasBoss={hasBoss}
          activityItems={activityItems}
          nextUnlock={nextUnlock}
          xpToday={xpToday}
          streak={streak}
        />
      )}
      {activeTab === 'quests' && <QuestsTab {...questsTabProps} />}
      {activeTab === 'badges' && <BadgesTab {...badgesTabProps} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export — wraps in Suspense (required for useSearchParams)
// ---------------------------------------------------------------------------

export default function DashboardClient(props: DashboardClientProps) {
  return (
    <Suspense fallback={<div />}>
      <DashboardContent {...props} />
    </Suspense>
  )
}
