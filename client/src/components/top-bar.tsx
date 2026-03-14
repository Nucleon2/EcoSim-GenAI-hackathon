import { Globe2 } from "lucide-react"
import { StatCard } from "@/components/stat-card"

const STATS = [
  { label: "Temp Rise", value: "+1.2°C", unit: "vs pre-industrial" },
  { label: "Emissions", value: "36.8 Gt", unit: "CO₂ per year" },
  { label: "Sea Level", value: "+3.7 mm", unit: "per year" },
]

export function TopBar() {
  return (
    <header className="glass-panel glow-ring flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-3">
        <Globe2 className="size-5 text-[--color-mission-glow]" />
        <h1 className="text-sm font-semibold tracking-widest uppercase text-[--color-mission-glow]">
          AI Climate Policy Copilot
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </header>
  )
}
