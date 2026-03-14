import { BarChart3 } from "lucide-react"
import type { SimulationResult } from "@/services/api"

const LABELS: Record<string, string> = {
  renewable_adoption: "Renewables",
  carbon_tax: "Carbon Tax",
  deforestation_reduction: "Deforestation",
  methane_reduction: "Methane",
  ev_adoption: "EV Adoption",
}

const COLORS: Record<string, string> = {
  renewable_adoption: "oklch(0.72 0.19 145)",
  carbon_tax: "oklch(0.65 0.18 195)",
  deforestation_reduction: "oklch(0.75 0.20 165)",
  methane_reduction: "oklch(0.80 0.18 85)",
  ev_adoption: "oklch(0.65 0.16 250)",
}

interface EmissionsBreakdownProps {
  result?: SimulationResult
}

export function EmissionsBreakdown({ result }: EmissionsBreakdownProps) {
  const breakdown = result?.emissions_breakdown
  const entries = breakdown
    ? Object.entries(breakdown).sort(([, a], [, b]) => b - a)
    : []
  const maxVal = entries.length > 0 ? Math.max(...entries.map(([, v]) => v)) : 1

  return (
    <div className="glass-panel glow-ring h-full flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-3.5 text-mission-glow" />
        <h3 className="text-xs uppercase tracking-widest text-mission-muted">
          Emissions Reduction
        </h3>
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-mission-muted">
            Run a simulation to see breakdown
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 flex-1 justify-center">
          {entries.map(([key, value]) => (
            <div key={key} className="flex flex-col gap-0.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[9px] uppercase tracking-wider text-mission-muted">
                  {LABELS[key] ?? key}
                </span>
                <span className="font-mono text-[10px] text-mission-stat tabular-nums">
                  {(value * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-mission-surface overflow-hidden">
                <div
                  className="h-full transition-all duration-700 ease-out"
                  style={{
                    width: `${(value / maxVal) * 100}%`,
                    backgroundColor: COLORS[key] ?? "oklch(0.65 0.18 195)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
