'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Github, Star } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string | null
  category: string
  repo_url: string | null
  demo_url: string | null
  image_url: string | null
  creators: string[]
  tech_stack: string[]
  featured: boolean
  created_at: string
}

const CATEGORY_FILTERS = [
  { key: 'all', label: 'Alles' },
  { key: 'hackathon', label: 'Hackathons' },
  { key: 'community', label: 'Community' },
  { key: 'game', label: 'Games' },
  { key: 'tool', label: 'Tools' },
]

export default function ProjectenPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/projecten')
      .then((r) => r.json())
      .then(({ data }) => setProjects(data || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.category === filter)

  return (
    <main className="min-h-screen pt-28 pb-20 px-6 md:px-12 lg:px-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="max-w-[1200px] mx-auto mb-12">
        <h1
          className="font-mono text-2xl md:text-3xl font-bold mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          {'>'} projecten
        </h1>
        <p className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Gebouwd door SIT leden — hackathon winnaars, community tools, games en meer
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-[1200px] mx-auto mb-8 flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((f) => {
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
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Projects grid */}
      <div className="max-w-[1200px] mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="py-16 text-center font-mono text-sm rounded-lg"
            style={{ color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)' }}
          >
            Nog geen projecten in deze categorie
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="relative flex flex-col p-5 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: project.featured
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : '1px solid var(--color-border)',
                }}
              >
                {project.featured && (
                  <div className="absolute top-3 right-3">
                    <Star size={14} style={{ color: 'var(--color-accent-gold)' }} fill="var(--color-accent-gold)" />
                  </div>
                )}

                <h3 className="font-mono text-sm font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                  {project.title}
                </h3>

                {project.description && (
                  <p className="text-xs mb-3 line-clamp-3" style={{ color: 'var(--color-text-muted)' }}>
                    {project.description}
                  </p>
                )}

                {/* Tech stack */}
                {project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[10px] px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: 'rgba(59, 130, 246, 0.08)',
                          color: 'var(--color-accent-blue)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Creators */}
                {project.creators.length > 0 && (
                  <p className="text-[11px] font-mono mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    door {project.creators.join(', ')}
                  </p>
                )}

                {/* Links */}
                <div className="mt-auto flex items-center gap-3 pt-2">
                  {project.repo_url && (
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-mono text-[11px] transition-colors"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Github size={12} /> Repo
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-mono text-[11px] transition-colors"
                      style={{ color: 'var(--color-accent-green)' }}
                    >
                      <ExternalLink size={12} /> Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
