const CHART_WELLS = [
  { label: "Temp Trend" },
  { label: "CO₂ Projection" },
  { label: "Sea Level Rise" },
]

export function DataVizPlaceholder() {
  return (
    <div className="glass-panel glow-ring h-36 shrink-0 flex items-center justify-center gap-6 px-6">
      {CHART_WELLS.map(({ label }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <div className="h-20 w-28 bg-[--color-mission-surface] rounded-md animate-pulse" />
          <span className="text-xs text-[--color-mission-muted]">{label}</span>
        </div>
      ))}
    </div>
  )
}
