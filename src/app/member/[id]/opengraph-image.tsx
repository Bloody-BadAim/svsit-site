import { ImageResponse } from 'next/og'
import { createServiceClient } from '@/lib/supabase'
import { getLevelForXp, getLevelProgress } from '@/lib/levelEngine'

export const runtime = 'edge'
export const alt = 'SIT Member Card'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: member } = await supabase
    .from('members')
    .select('display_name, email, total_xp, current_level, role')
    .eq('id', id)
    .single()

  if (!member) {
    return new ImageResponse(
      (
        <div
          style={{
            background: '#09090B',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ color: '#EF4444', fontSize: 48, display: 'flex' }}>
            Member niet gevonden
          </div>
          <div style={{ color: '#A1A1AA', fontSize: 24, marginTop: 16, display: 'flex' }}>
            svsit.nl
          </div>
        </div>
      ),
      { ...size },
    )
  }

  const displayName = member.display_name || member.email.split('@')[0]
  const level = getLevelForXp(member.total_xp)
  const progress = getLevelProgress(member.total_xp)
  const roleLabel = member.role.charAt(0).toUpperCase() + member.role.slice(1)

  // Progress bar width (percentage of 400px)
  const progressBarWidth = Math.max(4, Math.round((progress.percent / 100) * 400))

  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090B',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 80px',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold gradient glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-8%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 70%)',
          }}
        />

        {/* Tier color glow bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-5%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${level.color}15 0%, transparent 70%)`,
          }}
        />

        {/* Top: SIT branding + subtitle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', fontSize: 36, fontWeight: 800 }}>
            <span style={{ color: '#F59E0B' }}>{'{'}</span>
            <span style={{ color: '#FAFAFA' }}>SIT</span>
            <span style={{ color: '#F59E0B' }}>{'}'}</span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#71717A',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Member Card
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '100%',
            height: 1,
            background: 'linear-gradient(to right, #F59E0B44, #27272A, transparent)',
            marginTop: 28,
            marginBottom: 40,
          }}
        />

        {/* Member name */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 800,
            color: '#FAFAFA',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            maxWidth: '100%',
          }}
        >
          {displayName.length > 18 ? displayName.slice(0, 18) + '...' : displayName}
        </div>

        {/* Role tag */}
        <div
          style={{
            display: 'flex',
            marginTop: 16,
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '6px 16px',
              background: `${level.color}22`,
              border: `1px solid ${level.color}44`,
              borderRadius: 6,
              fontSize: 18,
              color: level.color,
              fontWeight: 700,
            }}
          >
            {roleLabel}
          </div>
          <div
            style={{
              display: 'flex',
              padding: '6px 16px',
              background: '#F59E0B15',
              border: '1px solid #F59E0B33',
              borderRadius: 6,
              fontSize: 18,
              color: '#F59E0B',
              fontWeight: 700,
            }}
          >
            Studievereniging ICT
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            gap: 60,
            alignItems: 'flex-end',
          }}
        >
          {/* Level */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', fontSize: 14, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Level
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: level.color }}>
                {level.level}
              </span>
              <span style={{ fontSize: 22, color: '#A1A1AA', fontWeight: 600 }}>
                {level.title}
              </span>
            </div>
          </div>

          {/* XP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', fontSize: 14, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Total XP
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 48, fontWeight: 800, color: '#F59E0B' }}>
                {member.total_xp.toLocaleString('nl-NL')}
              </span>
              <span style={{ fontSize: 22, color: '#71717A' }}>xp</span>
            </div>
          </div>

          {/* Progress to next level */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', fontSize: 14, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {progress.percent === 100 ? 'Max Level' : `${progress.percent}% naar level ${level.level + 1}`}
            </div>
            <div
              style={{
                display: 'flex',
                width: 400,
                height: 12,
                background: '#27272A',
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: progressBarWidth,
                  height: '100%',
                  background: `linear-gradient(to right, ${level.color}, ${level.color}CC)`,
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom gradient bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(to right, #F59E0B, #3B82F6, #EF4444, #22C55E)',
          }}
        />
      </div>
    ),
    { ...size },
  )
}
