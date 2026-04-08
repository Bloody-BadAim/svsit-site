'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { QrCode, Palette, Share2, Download, Lock, ChevronRight, Zap, Target, Check } from 'lucide-react'
import { useToast } from '@/components/Toast'
import MemberCard from '@/components/MemberCard'
import type { MemberCardData, MemberCardEquipment } from '@/components/MemberCard'
import { BossFightWidget } from '@/components/dashboard/BossFightWidget'
import QRCode from 'react-qr-code'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActivityItem {
  id: string
  type: 'scan' | 'challenge' | 'badge'
  points: number
  reason: string
  event_name: string | null
  created_at: string
  category?: string | null
}

export interface NextUnlock {
  skinName: string
  xpToGo: number
  progressPercent: number
  nextLevel: number
}

export interface MyCardTabProps {
  cardData: MemberCardData
  equipment?: MemberCardEquipment
  memberId: string
  activeSkin: string
  hasBoss: boolean
  activityItems: ActivityItem[]
  nextUnlock: NextUnlock | null
  xpToday: number
  streak: number
}

// ---------------------------------------------------------------------------
// QR flip card wrapper
// ---------------------------------------------------------------------------

function FlipCard({
  showQR,
  memberId,
  cardData,
  equipment,
  activeSkin,
}: {
  showQR: boolean
  memberId: string
  cardData: MemberCardData
  equipment?: MemberCardEquipment
  activeSkin: string
}) {
  return (
    <div style={{ perspective: '1000px' }}>
      <div
        className="relative transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: showQR ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front: Member Card */}
        <div data-card style={{ backfaceVisibility: 'hidden' }}>
          <MemberCard
            data={{ ...cardData, skin: activeSkin }}
            equipment={equipment}
          />
        </div>

        {/* Back: QR Code */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-none"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: '#0c0c0e',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="p-4 rounded-lg"
            style={{ background: '#ffffff' }}
          >
            <QRCode
              value={`https://svsit.nl/scan/${memberId}`}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#09090B"
            />
          </div>
          <p className="text-xs text-gray-500 font-mono mt-4 tracking-wider">
            Scan bij events voor XP
          </p>
          <p className="text-[10px] text-gray-700 font-mono mt-1 opacity-50">
            {memberId.slice(0, 8)}...
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Activity row
// ---------------------------------------------------------------------------

function ActivityRow({ item }: { item: ActivityItem }) {
  const time = new Date(item.created_at)
  const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`

  // Use state to avoid hydration mismatch from new Date() on server vs client
  const [dateLabel, setDateLabel] = useState<string>(
    time.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
  )

  useEffect(() => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isToday = time.toDateString() === now.toDateString()
    const isYesterday = time.toDateString() === yesterday.toDateString()
    setDateLabel(
      isToday ? 'vandaag' : isYesterday ? 'gisteren' : time.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
    )
  }, [item.created_at])

  const isBadge = item.type === 'badge'
  const isChallenge = item.type === 'challenge'

  const dotColor = isChallenge
    ? 'var(--color-accent-blue)'
    : isBadge
      ? '#8B5CF6'
      : 'var(--color-accent-gold)'

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-white/[0.02]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Category dot */}
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}66` }}
      />

      {/* Description */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        {isBadge && (
          <span className="text-[10px] font-mono" style={{ color: '#8B5CF6' }}>&#10022;</span>
        )}
        <span className="text-xs font-mono text-white/80 truncate">{item.reason}</span>
      </div>

      {/* XP */}
      <span
        className="shrink-0 text-xs font-mono font-bold"
        style={{ color: isChallenge ? 'var(--color-accent-blue)' : 'var(--color-accent-gold)' }}
      >
        +{item.points}xp
      </span>

      {/* Time */}
      <span className="shrink-0 text-[10px] font-mono text-gray-600 w-16 text-right">
        {dateLabel} {timeStr}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Next unlock teaser
// ---------------------------------------------------------------------------

function NextUnlockTeaser({ unlock }: { unlock: NextUnlock }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        border: '1px solid rgba(34, 197, 94, 0.15)',
        backgroundColor: 'rgba(34, 197, 94, 0.02)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #22C55E, transparent)' }}
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-green-500/60">
            NEXT UNLOCK
          </span>
          <span className="text-[10px] font-mono text-green-400/80">
            LVL {unlock.nextLevel}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          {/* Blurred/locked thumbnail */}
          <div
            className="w-10 h-10 shrink-0 flex items-center justify-center"
            style={{
              background: 'rgba(34, 197, 94, 0.06)',
              border: '1px solid rgba(34, 197, 94, 0.12)',
            }}
          >
            <Lock size={14} className="text-green-500/50" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono text-white/90 font-bold truncate">
              {unlock.skinName}
            </p>
            <p className="text-[10px] font-mono text-green-400/70">
              {unlock.xpToGo} XP te gaan
            </p>
          </div>
          <ChevronRight size={14} className="text-green-500/30 shrink-0" />
        </div>

        {/* Progress bar */}
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${unlock.progressPercent}%`,
              background: 'linear-gradient(90deg, #22C55E, #84CC16)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Daily stats
// ---------------------------------------------------------------------------

function DailyStats({ xpToday, streak }: { xpToday: number; streak: number }) {
  const xpColor = xpToday > 0 ? '#22C55E' : '#EF4444'
  const streakColor = streak > 0 ? '#EF4444' : 'rgba(255,255,255,0.2)'

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* XP today */}
      <div
        className="p-3"
        style={{
          border: `1px solid ${xpToday > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
          backgroundColor: xpToday > 0 ? 'rgba(34,197,94,0.02)' : 'rgba(239,68,68,0.02)',
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={11} style={{ color: xpColor }} />
          <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-gray-500">
            Vandaag
          </span>
        </div>
        <p className="text-lg font-mono font-bold" style={{ color: xpColor }}>
          {xpToday} <span className="text-xs font-normal">XP</span>
        </p>
      </div>

      {/* Streak */}
      <div
        className="p-3"
        style={{
          border: `1px solid ${streak > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
          backgroundColor: streak > 0 ? 'rgba(239,68,68,0.02)' : 'rgba(255,255,255,0.02)',
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Target size={11} style={{ color: streakColor }} />
          <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-gray-500">
            Streak
          </span>
        </div>
        <p className="text-lg font-mono font-bold" style={{ color: streakColor }}>
          {streak} <span className="text-xs font-normal">dagen</span>
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function MyCardTab({
  cardData,
  equipment,
  memberId,
  activeSkin,
  hasBoss,
  activityItems,
  nextUnlock,
  xpToday,
  streak,
}: MyCardTabProps) {
  const [showQR, setShowQR] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'done'>('idle')
  const cardRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const captureCard = useCallback(async (): Promise<Blob | null> => {
    const el = cardRef.current?.querySelector('[data-card]') as HTMLElement | null
    if (!el) return null
    const { toPng } = await import('html-to-image')
    const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: '#09090B' })
    const res = await fetch(dataUrl)
    return res.blob()
  }, [])

  const handleShare = async () => {
    try {
      const blob = await captureCard()
      if (blob && navigator.share) {
        const file = new File([blob], 'sit-card.png', { type: 'image/png' })
        await navigator.share({ title: 'Mijn SIT Card', files: [file] })
      } else {
        await navigator.clipboard.writeText(`https://svsit.nl/member/${memberId}`)
        toast('Link gekopieerd naar klembord', 'success')
      }
      setShareStatus('done')
      setTimeout(() => setShareStatus('idle'), 2000)
    } catch {
      // User cancelled share sheet -- not an error
    }
  }

  const handleDownload = async () => {
    try {
      const blob = await captureCard()
      if (!blob) {
        toast('Kon kaart niet genereren', 'error')
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sit-card.png'
      a.click()
      URL.revokeObjectURL(url)
      setShareStatus('done')
      setTimeout(() => setShareStatus('idle'), 2000)
      toast('Kaart gedownload', 'success')
    } catch {
      toast('Download mislukt', 'error')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_300px] gap-6 p-4 sm:p-6">
      {/* Left column: Card + actions */}
      <div className="flex flex-col gap-4" ref={cardRef}>
        <FlipCard
          showQR={showQR}
          memberId={memberId}
          cardData={cardData}
          equipment={equipment}
          activeSkin={activeSkin}
        />

        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex flex-col items-center gap-1.5 py-3 px-2 text-xs font-mono tracking-wider transition-colors cursor-pointer"
            style={{
              border: showQR ? '1px solid var(--color-accent-gold)' : '1px solid rgba(255,255,255,0.06)',
              backgroundColor: showQR ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
              color: showQR ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
            }}
          >
            <QrCode size={16} />
            <span className="text-[10px]">QR</span>
          </button>

          <a
            href="/dashboard/card-editor"
            className="flex flex-col items-center gap-1.5 py-3 px-2 text-xs font-mono tracking-wider transition-colors"
            style={{
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(255,255,255,0.02)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Palette size={16} />
            <span className="text-[10px]">EDIT</span>
          </a>

          <button
            onClick={handleDownload}
            className="flex flex-col items-center gap-1.5 py-3 px-2 text-xs font-mono tracking-wider transition-colors cursor-pointer"
            style={{
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(255,255,255,0.02)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Download size={16} />
            <span className="text-[10px]">SAVE</span>
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1.5 py-3 px-2 text-xs font-mono tracking-wider transition-colors cursor-pointer"
            style={{
              border: shareStatus === 'done' ? '1px solid #22C55E' : '1px solid rgba(255,255,255,0.06)',
              backgroundColor: shareStatus === 'done' ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
              color: shareStatus === 'done' ? '#22C55E' : 'var(--color-text-muted)',
            }}
          >
            {shareStatus === 'done' ? <Check size={16} /> : <Share2 size={16} />}
            <span className="text-[10px]">{shareStatus === 'done' ? 'DONE' : 'SHARE'}</span>
          </button>
        </div>
      </div>

      {/* Right column: Widgets */}
      <div className="flex flex-col gap-4">
        {/* Next unlock teaser */}
        {nextUnlock && <NextUnlockTeaser unlock={nextUnlock} />}

        {/* Boss fight */}
        {hasBoss && (
          <div>
            <BossFightWidget />
          </div>
        )}

        {/* Daily stats */}
        <DailyStats xpToday={xpToday} streak={streak} />

        {/* Recent activity */}
        <div
          className="overflow-hidden"
          style={{
            border: '1px solid rgba(255,255,255,0.06)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-500">
              Recent Activity
            </span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5"
              style={{
                color: 'var(--color-accent-gold)',
                border: '1px solid rgba(242, 158, 24, 0.2)',
              }}
            >
              {activityItems.length}
            </span>
          </div>

          {activityItems.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Zap size={20} className="mx-auto mb-2 text-gray-600" />
              <p className="text-xs font-mono text-gray-600">
                {'>'} awaiting first event scan...
              </p>
            </div>
          ) : (
            <div>
              {activityItems.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
