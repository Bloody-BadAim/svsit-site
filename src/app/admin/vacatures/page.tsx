'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react'
import { inputStyle, labelStyle } from '@/components/admin/adminStyles'

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

interface VacatureForm {
  title: string
  company: string
  company_logo: string
  type: string
  description: string
  requirements: string
  location: string
  url: string
  contact_email: string
  deadline: string
  active: boolean
}

const EMPTY_FORM: VacatureForm = {
  title: '',
  company: '',
  company_logo: '',
  type: 'stage',
  description: '',
  requirements: '',
  location: '',
  url: '',
  contact_email: '',
  deadline: '',
  active: true,
}

const TYPE_KEYS = ['stage', 'werkplek', 'bijbaan', 'afstuderen'] as const

const TYPE_LABEL_KEYS: Record<string, string> = {
  stage: 'typeStage',
  werkplek: 'typeWerkplek',
  bijbaan: 'typeBijbaan',
  afstuderen: 'typeAfstuderen',
}

export default function AdminVacaturesPage() {
  const t = useTranslations('adminVacatures')
  const [vacatures, setVacatures] = useState<Vacature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VacatureForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)

  const fetchVacatures = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch all vacatures (including inactive) for admin
      const res = await fetch('/api/vacatures?all=true')
      const { data, error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      setVacatures(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorLoad'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { fetchVacatures() }, [fetchVacatures])

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(true)
    setSaveError(null)
  }

  function openEdit(vacature: Vacature) {
    setForm({
      title: vacature.title,
      company: vacature.company,
      company_logo: vacature.company_logo || '',
      type: vacature.type,
      description: vacature.description || '',
      requirements: vacature.requirements || '',
      location: vacature.location || '',
      url: vacature.url || '',
      contact_email: vacature.contact_email || '',
      deadline: vacature.deadline ? vacature.deadline.slice(0, 16) : '',
      active: vacature.active,
    })
    setEditingId(vacature.id)
    setShowForm(true)
    setSaveError(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.company) return
    setSaving(true)
    setSaveError(null)

    const body = {
      title: form.title,
      company: form.company,
      company_logo: form.company_logo || null,
      type: form.type,
      description: form.description || null,
      requirements: form.requirements || null,
      location: form.location || null,
      url: form.url || null,
      contact_email: form.contact_email || null,
      deadline: form.deadline || null,
      active: form.active,
    }

    try {
      const url = editingId ? `/api/vacatures/${editingId}` : '/api/vacatures'
      const method = editingId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const { error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      setShowForm(false)
      fetchVacatures()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('errorSave'))
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    setSaveError(null)
    try {
      const data = new FormData()
      data.append('file', file)
      const res = await fetch('/api/vacatures/logo', { method: 'POST', body: data })
      const { data: result, error: apiError } = await res.json()
      if (!res.ok || apiError) throw new Error(apiError || t('errorLogoStatus', { status: res.status }))
      setForm((prev) => ({ ...prev, company_logo: result.url }))
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('errorLogo'))
    } finally {
      setLogoUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('confirmDelete'))) return
    try {
      const res = await fetch(`/api/vacatures/${id}`, { method: 'DELETE' })
      const { error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      fetchVacatures()
    } catch (err) {
      alert(err instanceof Error ? err.message : t('errorDelete'))
    }
  }

  async function handleToggleActive(vacature: Vacature) {
    try {
      const res = await fetch(`/api/vacatures/${vacature.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !vacature.active }),
      })
      const { error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)
      fetchVacatures()
    } catch (err) {
      alert(err instanceof Error ? err.message : t('errorToggle'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono text-lg font-bold" style={{ color: 'var(--color-text)' }}>
          {t('heading')}
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold"
          style={{
            backgroundColor: 'var(--color-accent-gold)',
            color: 'var(--color-bg)',
          }}
        >
          <Plus size={14} /> {t('newVacature')}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          className="mb-8 p-6 rounded-lg"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              {editingId ? t('editTitle') : t('createTitle')}
            </h2>
            <button onClick={() => setShowForm(false)} style={{ color: 'var(--color-text-muted)' }}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>{t('labelTitle')}</label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>{t('labelCompany')}</label>
              <input
                style={inputStyle}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>{t('labelType')}</label>
              <select
                style={inputStyle}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPE_KEYS.map((key) => (
                  <option key={key} value={key}>{t(TYPE_LABEL_KEYS[key])}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('labelLocation')}</label>
              <input
                style={inputStyle}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder={t('placeholderLocation')}
              />
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>{t('labelDescription')}</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80 }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>{t('labelRequirements')}</label>
              <textarea
                style={{ ...inputStyle, minHeight: 60 }}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('labelLogo')}</label>
              <div className="flex items-center gap-3">
                {form.company_logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.company_logo}
                    alt={t('logoAlt')}
                    className="w-10 h-10 object-contain rounded shrink-0"
                    style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                  />
                )}
                <label
                  className="px-3 py-2 font-mono text-xs cursor-pointer shrink-0"
                  style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', opacity: logoUploading ? 0.5 : 1 }}
                >
                  {logoUploading ? t('logoUploading') : form.company_logo ? t('logoReplace') : t('logoChoose')}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                    className="hidden"
                  />
                </label>
                {form.company_logo && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, company_logo: '' })}
                    className="font-mono text-xs"
                    style={{ color: 'var(--color-accent-red)' }}
                  >
                    {t('logoRemove')}
                  </button>
                )}
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('labelUrl')}</label>
              <input
                style={inputStyle}
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label style={labelStyle}>{t('labelContactEmail')}</label>
              <input
                style={inputStyle}
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>{t('labelDeadline')}</label>
              <input
                style={inputStyle}
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <label htmlFor="active" className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t('labelActive')}
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
                {saving ? t('saving') : editingId ? t('update') : t('create')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 font-mono text-xs"
                style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vacatures list */}
      {error ? (
        <div className="py-8 text-center">
          <p className="font-mono text-sm" style={{ color: 'var(--color-accent-red)' }}>{error}</p>
          <button onClick={fetchVacatures} className="font-mono text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            {t('reload')}
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          ))}
        </div>
      ) : vacatures.length === 0 ? (
        <p className="font-mono text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
          {t('empty')}
        </p>
      ) : (
        <div className="space-y-2">
          {vacatures.map((vacature) => {
            const isExpired = vacature.deadline && new Date(vacature.deadline) < new Date()
            return (
              <div
                key={vacature.id}
                className="flex items-center gap-4 p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  opacity: vacature.active ? 1 : 0.6,
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>
                      {vacature.title}
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ color: 'var(--color-accent-blue)', backgroundColor: 'rgba(59,130,246,0.1)' }}
                    >
                      {vacature.type}
                    </span>
                    {!vacature.active && (
                      <span className="font-mono text-[10px] uppercase" style={{ color: 'var(--color-accent-red)' }}>
                        {t('inactive')}
                      </span>
                    )}
                    {isExpired && (
                      <span className="font-mono text-[10px] uppercase" style={{ color: 'var(--color-accent-red)' }}>
                        {t('expired')}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {vacature.company}{vacature.location ? ` - ${vacature.location}` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(vacature)}
                    className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                    title={vacature.active ? t('deactivate') : t('activate')}
                  >
                    {vacature.active
                      ? <Eye size={14} style={{ color: 'var(--color-accent-green)' }} />
                      : <EyeOff size={14} style={{ color: 'var(--color-text-muted)' }} />
                    }
                  </button>
                  <button
                    onClick={() => openEdit(vacature)}
                    className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                    title={t('edit')}
                  >
                    <Pencil size={14} style={{ color: 'var(--color-text-muted)' }} />
                  </button>
                  <button
                    onClick={() => handleDelete(vacature.id)}
                    className="p-2 rounded hover:bg-[var(--color-bg)] transition-colors"
                    title={t('delete')}
                  >
                    <Trash2 size={14} style={{ color: 'var(--color-accent-red)' }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
