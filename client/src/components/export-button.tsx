import { Download } from "lucide-react"
import type { SimulationResult } from "@/services/api"

interface ExportButtonProps {
  result?: SimulationResult
}

function exportCsv(result: SimulationResult) {
  const lines = [
    "Metric,Value,Unit",
    `Temperature Rise,${result.temperature_rise},°C`,
    `CO2 Emissions,${result.co2_emissions},GtCO2/year`,
    `Sea Level Rise,${result.sea_level_rise},mm/year`,
    `Risk Score,${result.risk_score},/100`,
    "",
    "Sector,Reduction Factor",
    ...Object.entries(result.emissions_breakdown).map(
      ([k, v]) => `${k},${(v * 100).toFixed(1)}%`
    ),
  ]

  const blob = new Blob([lines.join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `ecosim-results-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportButton({ result }: ExportButtonProps) {
  if (!result) return null

  return (
    <button
      onClick={() => exportCsv(result)}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-mission-border text-mission-muted hover:text-mission-glow hover:border-mission-glow/30 transition-colors text-[10px] uppercase tracking-wider"
    >
      <Download className="size-3" />
      Export CSV
    </button>
  )
}
