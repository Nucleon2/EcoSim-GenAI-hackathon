import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp } from "lucide-react"

const BASELINE_2025 = 1.2
const BASELINE_2100 = 2.5

interface DataPoint {
  year: number
  baseline: number
  policy?: number
}

function generateProjection(temperatureRise?: number): DataPoint[] {
  const years = Array.from({ length: 16 }, (_, i) => 2025 + i * 5)

  return years.map((year) => {
    const t = (year - 2025) / 75
    const baseline = +(BASELINE_2025 + t * (BASELINE_2100 - BASELINE_2025)).toFixed(2)

    if (temperatureRise === undefined) {
      return { year, baseline }
    }

    const policy = +(BASELINE_2025 + t * (temperatureRise - BASELINE_2025)).toFixed(2)
    return { year, baseline, policy }
  })
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div
        className="px-3 py-2 text-xs font-mono border border-[--color-mission-border] space-y-1"
        style={{ backgroundColor: "oklch(0.13 0.018 240 / 90%)", backdropFilter: "blur(8px)" }}
      >
        <div className="text-[--color-mission-muted]">{label}</div>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} style={{ color: entry.stroke }}>
            {entry.dataKey === "baseline" ? "Baseline" : "With Policy"}: {entry.value}°C
          </div>
        ))}
      </div>
    )
  }
  return null
}

interface TemperatureProjectionChartProps {
  temperatureRise: number | undefined
}

export function TemperatureProjectionChart({ temperatureRise }: TemperatureProjectionChartProps) {
  const data = generateProjection(temperatureRise)

  return (
    <div className="glass-panel glow-ring h-full flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="size-3.5 text-[--color-mission-glow]" />
        <h3 className="text-xs uppercase tracking-widest text-[--color-mission-muted]">
          Temperature Projection
        </h3>
      </div>

      <div className="flex-1 min-h-0" style={{ minHeight: 100, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="policyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.75 0.20 165)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="oklch(0.75 0.20 165)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              tick={{ fill: "oklch(0.45 0.05 220)", fontSize: 10, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <YAxis
              domain={[0.5, 3]}
              tick={{ fill: "oklch(0.45 0.05 220)", fontSize: 10, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}°`}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={1.5}
              stroke="oklch(0.45 0.05 220 / 60%)"
              strokeDasharray="4 4"
              label={{
                value: "1.5°C Paris",
                position: "right",
                fill: "oklch(0.45 0.05 220 / 60%)",
                fontSize: 9,
              }}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="oklch(0.70 0.22 25)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              name="Baseline"
            />
            {temperatureRise !== undefined && (
              <Area
                type="monotone"
                dataKey="policy"
                stroke="oklch(0.75 0.20 165)"
                strokeWidth={2}
                fill="url(#policyGradient)"
                dot={false}
                name="With Policy"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
