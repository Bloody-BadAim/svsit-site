export default function DashboardLoading() {
  return (
    <div className="max-w-4xl space-y-8 animate-pulse">
      <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--color-surface)' }} />
      <div className="h-20 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }} />
        ))}
      </div>
      <div className="h-48 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }} />
    </div>
  )
}
