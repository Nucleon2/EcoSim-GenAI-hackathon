import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { BarChart3 } from "lucide-react"

const LEVER_LABELS: Record<string, string> = {
  renewable_adoption: "Renewables",
  carbon_tax: "Carbon Tax",
  deforestation_reduction: "Deforestation",
  methane_reduction: "Methane",
  ev_adoption: "EV Adoption",
}

const LEVER_ORDER = [
  "renewable_adoption",
  "carbon_tax",
  "ev_adoption",
  "deforestation_reduction",
  "methane_reduction",
]

interface EmissionsBreakdownChartProps {
  breakdown: Record<string, number> | undefined
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload?.length) {
    const { name, value } = payload[0].payload
    return (
      <div
        className="px-3 py-2 text-xs font-mono border border-[--color-mission-border]"
        style={{ backgroundColor: "oklch(0.13 0.018 240 / 90%)", backdropFilter: "blur(8px)" }}
      >
        <span className="text-[--color-mission-stat]">{name}</span>
        <span className="text-[--color-mission-muted] ml-2">{(value * 100).toFixed(1)}%</span>
      </div>
    )
  }
  return null
}

export function EmissionsBreakdownChart({ breakdown }: EmissionsBreakdownChartProps) {
  const data = LEVER_ORDER.map((key) => ({
    name: LEVER_LABELS[key],
    value: breakdown?.[key] ?? 0,
  }))

  const hasData = breakdown !== undefined

  return (
    <div className="glass-panel glow-ring h-full flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-3.5 text-[--color-mission-glow]" />
        <h3 className="text-xs uppercase tracking-widest text-[--color-mission-muted]">
          Emissions Breakdown
        </h3>
      </div>

      <div className="flex-1 min-h-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <XAxis
                type="number"
                domain={[0, 0.3]}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                tick={{ fill: "oklch(0.45 0.05 220)", fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={85}
                tick={{ fill: "oklch(0.45 0.05 220)", fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="value" radius={0} maxBarSize={14}>
                {data.map((_, i) => (
                  <Cell key={i} fill="oklch(0.65 0.18 195)" fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-[--color-mission-muted] font-mono">
              Run a simulation to see breakdown
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
