import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import type { SimulationResult } from "@/services/api"

interface ComparisonDiffProps {
  resultA: SimulationResult
  resultB: SimulationResult
}

interface DiffMetric {
  label: string
  unit: string
  valueA: number
  valueB: number
  /** For all climate metrics, lower is better */
  lowerIsBetter: boolean
  decimals: number
}

export function ComparisonDiff({ resultA, resultB }: ComparisonDiffProps) {
  const metrics: DiffMetric[] = [
    {
      label: "Temperature Rise",
      unit: "°C",
      valueA: resultA.temperature_rise,
      valueB: resultB.temperature_rise,
      lowerIsBetter: true,
      decimals: 2,
    },
    {
      label: "CO₂ Emissions",
      unit: "Gt/yr",
      valueA: resultA.co2_emissions,
      valueB: resultB.co2_emissions,
      lowerIsBetter: true,
      decimals: 1,
    },
    {
      label: "Sea Level Rise",
      unit: "mm/yr",
      valueA: resultA.sea_level_rise,
      valueB: resultB.sea_level_rise,
      lowerIsBetter: true,
      decimals: 1,
    },
    {
      label: "Risk Score",
      unit: "/ 100",
      valueA: resultA.risk_score,
      valueB: resultB.risk_score,
      lowerIsBetter: true,
      decimals: 0,
    },
  ]

  return (
    <div className="glass-panel glow-ring p-4">
      <h3 className="text-[10px] uppercase tracking-widest text-[--color-mission-muted] mb-3">
        Scenario Differences — B relative to A
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const delta = m.valueB - m.valueA
          const absDelta = Math.abs(delta)
          const pct = m.valueA !== 0 ? (delta / m.valueA) * 100 : 0

          const isNeutral = absDelta < 0.01
          const isBetter = m.lowerIsBetter ? delta < -0.01 : delta > 0.01
          const color = isNeutral
            ? "text-[--color-mission-muted]"
            : isBetter
              ? "text-emerald-400"
              : "text-red-400"

          const Icon = isNeutral ? Minus : delta > 0 ? ArrowUp : ArrowDown

          return (
            <div key={m.label} className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-widest text-[--color-mission-muted]">
                {m.label}
              </span>
              <div className={`flex items-center gap-1.5 ${color}`}>
                <Icon className="size-3.5" />
                <span className="font-mono text-sm font-bold tabular-nums">
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(m.decimals)} {m.unit}
                </span>
              </div>
              {!isNeutral && (
                <span className={`text-[10px] font-mono tabular-nums ${color}`}>
                  {pct > 0 ? "+" : ""}
                  {pct.toFixed(1)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
