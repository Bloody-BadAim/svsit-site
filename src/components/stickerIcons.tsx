import { Code, Coffee, Bug, GraduationCap, Hand, type LucideIcon } from 'lucide-react'

// Card-stickers als SVG i.p.v. emoji. De stickers worden in de DB nog met een
// `emoji`-glyph in preview_data opgeslagen; we mappen die glyph naar een SVG.
// Onbekende glyphs vallen terug op de tekst zelf (al vector, geen emoji-bitmap).

const LUCIDE_BY_GLYPH: Record<string, LucideIcon> = {
  '🐛': Bug,
  '☕': Coffee,
  '👋': Hand,
  '🎓': GraduationCap,
  '</>': Code,
}

function AmsterdamCrosses({ size }: { size: number }) {
  // Drie Andreaskruisen (Amsterdam)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {[5, 12, 19].map((cx) => (
        <g key={cx} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1={cx - 2.5} y1="8.5" x2={cx + 2.5} y2="15.5" />
          <line x1={cx + 2.5} y1="8.5" x2={cx - 2.5} y2="15.5" />
        </g>
      ))}
    </svg>
  )
}

function GlyphText({ text, size }: { text: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-mono), monospace"
        fontWeight="700"
        fontSize={text.length > 2 ? 8 : 11}
        fill="currentColor"
      >
        {text}
      </text>
    </svg>
  )
}

export function StickerIcon({ glyph, size = 20 }: { glyph: string; size?: number }) {
  const Lucide = LUCIDE_BY_GLYPH[glyph]
  if (Lucide) return <Lucide size={size} strokeWidth={2} />
  if (glyph === '×××' || glyph === 'XXX') return <AmsterdamCrosses size={size} />
  if (glyph === '🏠' || glyph === 'SIT') return <GlyphText text="SIT" size={size} />
  if (glyph === '42') return <GlyphText text="42" size={size} />
  // Onbekend: render de glyph als vector-tekst
  return <GlyphText text={glyph} size={size} />
}
