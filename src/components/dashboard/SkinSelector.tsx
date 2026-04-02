'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { CARD_SKINS } from '@/lib/cardSkins'

interface SkinSelectorProps {
  memberId: string
  activeSkin: string
  unlockedSkins: string[]
  onSkinChange?: (skinId: string) => void
}

export default function SkinSelector({ memberId, activeSkin, unlockedSkins, onSkinChange }: SkinSelectorProps) {
  const [selected, setSelected] = useState(activeSkin)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSelect(skinId: string) {
    if (skinId === selected || loading) return
    setSelected(skinId)
    onSkinChange?.(skinId)
    setLoading(skinId)
    try {
      await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_skin: skinId }),
      })
    } catch {
      // silently fail — local state still updated for instant feedback
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className="relative overflow-hidden w-full"
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

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <span
          className="font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          equipped.skin
        </span>
        <span
          className="font-mono text-[10px] px-2 py-0.5"
          style={{
            color: 'var(--color-accent-gold)',
            border: '1px solid rgba(242,158,24,0.3)',
          }}
        >
          {CARD_SKINS.find(s => s.id === selected)?.naam ?? 'Default'}
        </span>
      </div>

      {/* Skin thumbnails */}
      <div className="px-5 py-4">
        <div
          className="flex gap-3"
          style={{ overflowX: 'auto', paddingBottom: 4 }}
        >
          {CARD_SKINS.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id)
            const isActive = selected === skin.id
            const isLoading = loading === skin.id

            // Extract the border color for thumbnail preview
            const borderIsGradient =
              skin.border.startsWith('conic-gradient') ||
              skin.border.startsWith('linear-gradient')
            const gradientBorderValue = skin.border.replace(/\s+1$/, '')

            return (
              <button
                key={skin.id}
                disabled={!isUnlocked || isLoading}
                onClick={() => handleSelect(skin.id)}
                title={isUnlocked ? skin.naam : `Vergrendeld — ${skin.unlockRequirement}`}
                style={{
                  flexShrink: 0,
                  width: 60,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.4,
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                }}
              >
                {/* Thumbnail card */}
                <div
                  style={{
                    width: 60,
                    height: 80,
                    position: 'relative',
                    padding: 2,
                    ...(isActive
                      ? {
                          background: 'conic-gradient(from 0deg, var(--color-accent-gold), rgba(242,158,24,0.3), var(--color-accent-gold))',
                          boxShadow: '0 0 10px rgba(242,158,24,0.6)',
                        }
                      : borderIsGradient
                      ? { background: gradientBorderValue }
                      : { background: 'transparent', border: skin.border }),
                  }}
                >
                  {/* Inner card body */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: skin.background,
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Accent dot */}
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: skin.accent,
                        boxShadow: `0 0 8px ${skin.accent}80`,
                        opacity: isUnlocked ? 1 : 0.4,
                      }}
                    />

                    {/* Lock overlay */}
                    {!isUnlocked && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(9,9,11,0.6)',
                          gap: 2,
                        }}
                      >
                        <Lock size={12} color="rgba(255,255,255,0.3)" />
                      </div>
                    )}

                    {/* Loading pulse */}
                    {isLoading && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `${skin.accent}20`,
                          animation: 'pulse 1s ease-in-out infinite',
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Skin name */}
                <div
                  className="font-mono text-center mt-1"
                  style={{
                    fontSize: 9,
                    color: isActive
                      ? 'var(--color-accent-gold)'
                      : isUnlocked
                      ? 'var(--color-text-muted)'
                      : 'rgba(255,255,255,0.2)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: 60,
                    lineHeight: 1.2,
                  }}
                >
                  {skin.naam}
                </div>

                {/* Unlock requirement for locked skins */}
                {!isUnlocked && (
                  <div
                    className="font-mono text-center"
                    style={{
                      fontSize: 8,
                      color: 'rgba(255,255,255,0.2)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: 60,
                      lineHeight: 1.2,
                      marginTop: 1,
                    }}
                  >
                    {skin.unlockRequirement}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
