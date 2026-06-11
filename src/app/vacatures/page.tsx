'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { MapPin, Clock, ExternalLink, Briefcase } from 'lucide-react'
import Navbar from '@/components/Navbar'

interface Vacature {
  id: string
  title: string
  company: string
  company_logo: string | null
  type: string
  description: string | null
  requirements: string | null
  location: string | null
  url: string | null
  contact_email: string | null
  deadline: string | null
  active: boolean
  created_at: string
}

const TYPE_FILTERS = [
  { key: 'all' },
  { key: 'stage' },
  { key: 'werkplek' },
  { key: 'bijbaan' },
  { key: 'afstuderen' },
] as const

const TYPE_COLORS: Record<string, string> = {
  stage: 'var(--color-accent-blue)',
  werkplek: 'var(--color-accent-green)',
  bijbaan: 'var(--color-accent-gold)',
  afstuderen: 'var(--color-accent-red)',
}

export default function VacaturesPage() {
  const t = useTranslations('pageVacatures')
  const locale = useLocale()
  const [vacatures, setVacatures] = useState<Vacature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/vacatures')
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          setError(res.error)
        } else {
          setVacatures(res.data || [])
        }
      })
      .catch(() => setError(t('loadError')))
      .finally(() => setLoading(false))
  }, [t])

  const filtered = filter === 'all' ? vacatures : vacatures.filter((v) => v.type === filter)

  return (
    <>
    <Navbar />
    <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 lg:px-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="max-w-[1200px] mx-auto mb-12">
        <h1
          className="font-mono text-2xl md:text-3xl font-bold mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          {'>'} {t('heading')}
        </h1>
        <p className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-[1200px] mx-auto mb-8 flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="font-mono text-[11px] tracking-widest uppercase px-3.5 py-2 rounded-md transition-all"
              style={{
                background: active ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                color: active ? 'var(--color-accent-gold)' : 'var(--color-text-muted)',
                border: active ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--color-border)',
              }}
            >
              {t(`filters.${f.key}`)}
            </button>
          )
        })}
      </div>

      {/* Vacatures list */}
      <div className="max-w-[1200px] mx-auto">
        {error ? (
          <div
            className="py-16 text-center rounded-lg"
            style={{ border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
          >
            <p className="font-mono text-sm mb-3" style={{ color: 'var(--color-accent-red)' }}>
              {error}
            </p>
            <button
              onClick={() => { setError(null); setLoading(true); fetch('/api/vacatures').then(r => r.json()).then(res => { if (res.error) setError(res.error); else setVacatures(res.data || []); }).catch(() => setError(t('loadError'))).finally(() => setLoading(false)); }}
              className="font-mono text-xs px-4 py-2 rounded-md"
              style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            >
              {t('retry')}
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="py-16 text-center font-mono text-sm rounded-lg"
            style={{ color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)' }}
          >
            {t('empty')}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((vacature) => {
              const typeColor = TYPE_COLORS[vacature.type] || 'var(--color-text-muted)'
              const isExpired = vacature.deadline && new Date(vacature.deadline) < new Date()

              return (
                <div
                  key={vacature.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    opacity: isExpired ? 0.6 : 1,
                  }}
                >
                  {/* Company logo placeholder */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                  >
                    {vacature.company_logo ? (
                      <img src={vacature.company_logo} alt={vacature.company} className="w-8 h-8 object-contain" />
                    ) : (
                      <Briefcase size={16} style={{ color: 'var(--color-text-muted)' }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-mono text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>
                        {vacature.title}
                      </h3>
                      <span
                        className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
                        style={{
                          color: typeColor,
                          backgroundColor: `${typeColor}15`,
                          border: `1px solid ${typeColor}40`,
                        }}
                      >
                        {vacature.type}
                      </span>
                    </div>

                    <p className="font-mono text-xs mb-1" style={{ color: 'var(--color-accent-gold)' }}>
                      {vacature.company}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      {vacature.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {vacature.location}
                        </span>
                      )}
                      {vacature.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {t('deadline')} {new Date(vacature.deadline).toLocaleDateString(locale === 'en' ? 'en-GB' : 'nl-NL')}
                          {isExpired && t('expired')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  {vacature.url && !isExpired && (
                    <a
                      href={vacature.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-md shrink-0 transition-colors"
                      style={{
                        color: 'var(--color-accent-green)',
                        border: '1px solid var(--color-accent-green)',
                      }}
                    >
                      <ExternalLink size={12} /> {t('view')}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
    </>
  )
}
