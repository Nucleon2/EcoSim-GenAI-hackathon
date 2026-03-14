import { Globe2 } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import type { SimulationResult } from "@/services/api"

interface TopBarProps {
  result?: SimulationResult
}

function buildStats(result?: SimulationResult) {
  if (!result) {
    return [
      { label: "Temp Rise", value: "+1.2°C", unit: "vs pre-industrial" },
      { label: "Emissions", value: "36.8 Gt", unit: "CO₂ per year" },
      { label: "Sea Level", value: "+3.7 mm", unit: "per year" },
    ]
  }
  return [
    { label: "Temp Rise", value: `+${result.temperature_rise.toFixed(1)}°C`, unit: "vs pre-industrial" },
    { label: "Emissions", value: `${result.co2_emissions.toFixed(1)} Gt`, unit: "CO₂ per year" },
    { label: "Sea Level", value: `+${result.sea_level_rise.toFixed(1)} mm`, unit: "per year" },
  ]
}

export function TopBar({ result }: TopBarProps) {
  return (
    <header className="glass-panel glow-ring flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-3">
        <Globe2 className="size-5 text-[--color-mission-glow]" />
        <h1 className="text-sm font-semibold tracking-widest uppercase text-[--color-mission-glow]">
          AI Climate Policy Copilot
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {buildStats(result).map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </header>
  )
}
