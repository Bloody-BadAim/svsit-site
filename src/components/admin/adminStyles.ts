import type React from 'react'

export const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  padding: '6px 10px',
  outline: 'none',
  width: '100%',
  borderRadius: 0,
}

export const labelStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: 4,
}
