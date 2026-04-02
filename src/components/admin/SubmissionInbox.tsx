'use client'

import { useState, useEffect, useCallback } from 'react'

interface EnrichedSubmission {
  id: string
  challenge_id: string
  challenge_title: string
  member_id: string
  member_email: string
  proof_url: string | null
  proof_text: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function SubmissionInbox() {
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/challenges/submissions')
      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error ?? 'Laden mislukt')
        return
      }
      setSubmissions(json.data ?? [])
    } catch {
      setError('Netwerkfout — probeer opnieuw')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  async function handleAction(id: string, status: 'approved' | 'rejected') {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/challenges/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        alert(json.error ?? 'Actie mislukt')
        return
      }
      // Remove from list after action
      setSubmissions((prev) => prev.filter((s) => s.id !== id))
    } catch {
      alert('Netwerkfout — probeer opnieuw')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div
      className="p-5 rounded-lg space-y-4"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center justify-between">
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {'>'} submissions.inbox()
        </h2>
        <button
          onClick={fetchSubmissions}
          className="text-xs px-3 py-1 rounded-md"
          style={{
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          refresh
        </button>
      </div>

      {error && (
        <p
          className="text-xs py-2 px-3 rounded-lg"
          style={{
            color: 'var(--color-accent-red)',
            backgroundColor: 'rgba(239,68,68,0.08)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ✗ {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg animate-pulse"
              style={{ backgroundColor: 'var(--color-bg)' }}
            />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div
          className="py-8 text-center rounded-lg"
          style={{ backgroundColor: 'var(--color-bg)', border: '1px dashed var(--color-border)' }}
        >
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            // geen pending submissions
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 rounded-lg space-y-2"
              style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
                  >
                    {sub.challenge_title}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {sub.member_email}
                  </p>
                </div>
                <span
                  className="text-xs shrink-0"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {new Date(sub.created_at).toLocaleString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Proof */}
              {(sub.proof_url || sub.proof_text) && (
                <div
                  className="p-2 rounded text-xs space-y-1"
                  style={{ backgroundColor: 'var(--color-surface)', fontFamily: 'var(--font-mono)' }}
                >
                  {sub.proof_url && (
                    <a
                      href={sub.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate underline"
                      style={{ color: 'var(--color-accent-blue)' }}
                    >
                      {sub.proof_url}
                    </a>
                  )}
                  {sub.proof_text && (
                    <p style={{ color: 'var(--color-text-muted)' }}>{sub.proof_text}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleAction(sub.id, 'approved')}
                  disabled={actionLoading === sub.id}
                  className="py-1.5 px-4 rounded-lg text-xs font-bold disabled:opacity-40 transition-opacity"
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: 'var(--color-accent-green)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {actionLoading === sub.id ? '...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => handleAction(sub.id, 'rejected')}
                  disabled={actionLoading === sub.id}
                  className="py-1.5 px-4 rounded-lg text-xs font-bold disabled:opacity-40 transition-opacity"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    color: 'var(--color-accent-red)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {actionLoading === sub.id ? '...' : '✗ Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
