export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--color-surface)' }} />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }} />
        ))}
      </div>
    </div>
  )
}
