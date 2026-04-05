'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { Download } from 'lucide-react'
import MemberCard from '@/components/MemberCard'
import type { MemberCardData, MemberCardEquipment } from '@/components/MemberCard'

interface LedenpasClientProps {
  data: MemberCardData
  skin: string
  memberId: string
  unlockedSkins: string[]
  equipment?: MemberCardEquipment
}

export default function LedenpasClient({ data, skin: initialSkin, equipment }: LedenpasClientProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)

    try {
      const options = {
        pixelRatio: 3,
        backgroundColor: '#09090B',
        cacheBust: true,
        fontEmbedCSS: '',
        filter: (node: HTMLElement) => {
          const bg = node.style?.backgroundImage || ''
          if (bg.includes('feTurbulence')) return false
          return true
        },
      }

      const dataUrl = await toPng(cardRef.current, options)

      if (dataUrl) {
        const link = document.createElement('a')
        link.download = `sit-ledenpas-${data.name}.png`
        link.href = dataUrl
        link.click()
      }
    } catch {
      // Fallback: user kan screenshot maken
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div ref={cardRef}>
        <MemberCard
          className="w-full max-w-[400px]"
          showQR
          data={{ ...data, skin: initialSkin }}
          equipment={equipment}
        />
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 py-3 px-6 font-semibold text-sm transition-all disabled:opacity-50"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--color-accent-gold)',
          border: '1px solid var(--color-accent-gold)',
        }}
      >
        <Download size={16} />
        {downloading ? 'Downloaden...' : 'Download als PNG'}
      </button>
    </div>
  )
}
