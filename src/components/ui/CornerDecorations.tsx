import type React from 'react'

export function CornerDecorations({ color = 'var(--color-accent-gold)' }: { color?: string }) {
  const s = (pos: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    width: 10,
    height: 10,
    borderColor: color,
    borderStyle: 'solid',
    borderWidth: 0,
    ...pos,
  })
  return (
    <>
      <span style={s({ top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 })} />
      <span style={s({ top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 })} />
      <span style={s({ bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 })} />
      <span style={s({ bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 })} />
    </>
  )
}
