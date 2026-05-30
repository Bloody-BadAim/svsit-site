'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import OverviewTab from '@/components/dashboard/tabs/OverviewTab'
import type { OverviewTabProps } from '@/components/dashboard/tabs/OverviewTab'
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

type Tab = 'overview' | 'card' | 'quests' | 'badges'

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
  activityItems: ActivityItem[]
  nextUnlock: NextUnlock | null
  xpToday: number

  // Overview tab
  overviewProps: OverviewTabProps

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
  { id: 'overview', label: 'OVERZICHT' },
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
    initialTab && ['overview', 'card', 'quests', 'badges'].includes(initialTab) ? initialTab : 'overview'
  )

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    router.replace(`/dashboard?tab=${tab}`, { scroll: false })
  }

  const {
    level, levelTitle, tierColor, xpCurrent, xpMax, xpPercent,
    streak, coins, isWelcome,
    cardData, equipment, memberId, activeSkin,
    activityItems, nextUnlock, xpToday,
    overviewProps, questsTabProps, badgesTabProps,
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

      {/* Persistent top bar - minimal */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold font-mono"
            style={{ color: tierColor }}
          >
            LVL {level}
          </span>
          <span className="text-white text-sm font-mono">
            {levelTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-24 h-1 rounded overflow-hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded transition-all duration-700"
              style={{ width: `${xpPercent}%`, background: tierColor }}
            />
          </div>
          <span className="text-gray-600 text-[10px] font-mono">
            {xpCurrent}/{xpMax} XP
          </span>
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
      {activeTab === 'overview' && <OverviewTab {...overviewProps} />}
      {activeTab === 'card' && (
        <MyCardTab
          cardData={cardData}
          equipment={equipment}
          memberId={memberId}
          activeSkin={activeSkin}
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
// Main export - wraps in Suspense (required for useSearchParams)
// ---------------------------------------------------------------------------

export default function DashboardClient(props: DashboardClientProps) {
  return (
    <Suspense fallback={<div />}>
      <DashboardContent {...props} />
    </Suspense>
  )
}
