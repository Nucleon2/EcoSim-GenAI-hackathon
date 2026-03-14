interface StatCardProps {
  label: string
  value: string
  unit?: string
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2 border border-mission-border bg-mission-surface/40">
      <p className="text-xs uppercase tracking-wider text-mission-muted">
        {label}
      </p>
      <p className="font-mono text-lg font-bold text-mission-stat">
        {value}
      </p>
      {unit && (
        <p className="text-xs text-mission-muted">{unit}</p>
      )}
    </div>
  )
}
