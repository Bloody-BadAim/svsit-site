'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Star, X } from 'lucide-react'
import { inputStyle, labelStyle } from '@/components/admin/adminStyles'

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

interface ProjectForm {
  title: string
  description: string
  category: string
  repo_url: string
  demo_url: string
  image_url: string
  creators: string
  tech_stack: string
  featured: boolean
}

const EMPTY_FORM: ProjectForm = {
  title: '',
  description: '',
  category: 'community',
  repo_url: '',
  demo_url: '',
  image_url: '',
  creators: '',
  tech_stack: '',
  featured: false,
}

const CATEGORIES = [
  { key: 'hackathon', label: 'Hackathon' },
  { key: 'community', label: 'Community' },
  { key: 'game', label: 'Game' },
  { key: 'tool', label: 'Tool' },
]

export default function AdminProjectenPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/projecten')
      const { data, error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      setProjects(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij laden projecten')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
    setSaveError(null)
  }

  function openEdit(project: Project) {
    setForm({
      title: project.title,
      description: project.description || '',
      category: project.category,
      repo_url: project.repo_url || '',
      demo_url: project.demo_url || '',
      image_url: project.image_url || '',
      creators: project.creators.join(', '),
      tech_stack: project.tech_stack.join(', '),
      featured: project.featured,
    })
    setEditingId(project.id)
    setShowForm(true)
    setSaveError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) return
    setSaving(true)
    setSaveError(null)

    const body = {
      title: form.title,
      description: form.description || null,
      category: form.category,
      repo_url: form.repo_url || null,
      demo_url: form.demo_url || null,
      image_url: form.image_url || null,
      creators: form.creators ? form.creators.split(',').map((s) => s.trim()).filter(Boolean) : [],
      tech_stack: form.tech_stack ? form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean) : [],
      featured: form.featured,
    }

    try {
      const url = editingId ? `/api/projecten/${editingId}` : '/api/projecten'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const { error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      setShowForm(false)
      fetchProjects()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Project verwijderen?')) return
    try {
      const res = await fetch(`/api/projecten/${id}`, { method: 'DELETE' })
      const { error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      fetchProjects()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Verwijderen mislukt')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono text-lg font-bold" style={{ color: 'var(--color-text)' }}>
          Projecten beheer
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold"
          style={{
            backgroundColor: 'var(--color-accent-gold)',
            color: 'var(--color-bg)',
          }}
        >
          <Plus size={14} /> Nieuw project
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div
          className="mb-8 p-6 rounded-lg"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              {editingId ? 'Project bewerken' : 'Nieuw project'}
            </h2>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--color-text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Titel *</label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Categorie</label>
              <select
                style={inputStyle}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>Beschrijving</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80 }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Repository URL</label>
              <input
                style={inputStyle}
                value={form.repo_url}
                onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label style={labelStyle}>Demo URL</label>
              <input
                style={inputStyle}
                value={form.demo_url}
                onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label style={labelStyle}>Afbeelding URL</label>
              <input
                style={inputStyle}
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Creators (komma-gescheiden)</label>
              <input
                style={inputStyle}
                value={form.creators}
                onChange={(e) => setForm({ ...form, creators: e.target.value })}
                placeholder="Jan, Piet, Klaas"
              />
            </div>
            <div>
              <label style={labelStyle}>Tech stack (komma-gescheiden)</label>
              <input
                style={inputStyle}
                value={form.tech_stack}
                onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <label htmlFor="featured" className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Featured (uitgelicht)
              </label>
            </div>

            {saveError && (
              <p className="md:col-span-2 font-mono text-xs" style={{ color: 'var(--color-accent-red)' }}>
                {saveError}
              </p>
            )}

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 font-mono text-xs font-bold"
                style={{ backgroundColor: 'var(--color-accent-gold)', color: 'var(--color-bg)', opacity: saving ? 0.5 : 1 }}
              >
                {saving ? 'Opslaan...' : editingId ? 'Bijwerken' : 'Aanmaken'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 font-mono text-xs"
                style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects list */}
      {error ? (
        <div className="py-8 text-center">
          <p className="font-mono text-sm" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
          <button onClick={fetchProjects} className="font-mono text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Opnieuw laden
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p className="font-mono text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
          Nog geen projecten. Klik &quot;Nieuw project&quot; om te beginnen.
        </p>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center gap-4 p-4 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {project.featured && <Star size={12} style={{ color: 'var(--color-accent-gold)' }} fill="var(--color-accent-gold)" />}
                  <span className="font-mono text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>
                    {project.title}
                  </span>
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)' }}
                  >
                    {project.category}
                  </span>
                </div>
                {project.creators.length > 0 && (
                  <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {project.creators.join(', ')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(project)}
                  className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                  title="Bewerken"
                >
                  <Pencil size={14} style={{ color: 'var(--color-text-muted)' }} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                  title="Verwijderen"
                >
                  <Trash2 size={14} style={{ color: 'var(--color-accent-red)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
