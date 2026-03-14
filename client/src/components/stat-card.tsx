interface StatCardProps {
  label: string
  value: string
  unit?: string
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2 border border-[--color-mission-border] bg-[--color-mission-surface]/40">
      <p className="text-xs uppercase tracking-wider text-[--color-mission-muted]">
        {label}
      </p>
      <p className="font-mono text-lg font-bold text-[--color-mission-stat]">
        {value}
      </p>
      {unit && (
        <p className="text-xs text-[--color-mission-muted]">{unit}</p>
      )}
    </div>
  )
}
