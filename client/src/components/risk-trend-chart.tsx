import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { ShieldAlert } from "lucide-react"

const BASELINE_RISK_2025 = 68
const BASELINE_RISK_2100 = 92

interface DataPoint {
  year: number
  baseline: number
  policy?: number
}

function generateRiskProjection(riskScore?: number): DataPoint[] {
  const years = Array.from({ length: 16 }, (_, i) => 2025 + i * 5)

  return years.map((year) => {
    const t = (year - 2025) / 75
    // Baseline risk accelerates over time (quadratic curve)
    const baseline = +(
      BASELINE_RISK_2025 +
      t * t * (BASELINE_RISK_2100 - BASELINE_RISK_2025) * 0.4 +
      t * (BASELINE_RISK_2100 - BASELINE_RISK_2025) * 0.6
    ).toFixed(1)

    if (riskScore === undefined) {
      return { year, baseline }
    }

    // Policy risk trends toward the simulated score
    const policy = +(
      BASELINE_RISK_2025 +
      t * (riskScore - BASELINE_RISK_2025)
    ).toFixed(1)
    return { year, baseline, policy }
  })
}

function riskColor(score: number): string {
  if (score <= 30) return "oklch(0.72 0.19 145)"
  if (score <= 60) return "oklch(0.80 0.18 85)"
  return "oklch(0.70 0.22 25)"
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div
        className="space-y-1 border border-[--color-mission-border] px-3 py-2 font-mono text-xs"
        style={{
          backgroundColor: "oklch(0.13 0.018 240 / 90%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="text-[--color-mission-muted]">{label}</div>
        {payload.map((entry: any) => (
          <div
            key={entry.dataKey}
            style={{
              color:
                entry.color ??
                entry.stroke ??
                (entry.dataKey === "baseline"
                  ? "oklch(0.70 0.22 25)"
                  : "oklch(0.72 0.19 145)"),
            }}
          >
            {entry.dataKey === "baseline" ? "Baseline" : "With Policy"}:{" "}
            {entry.value}
          </div>
        ))}
      </div>
    )
  }
  return null
}

interface RiskTrendChartProps {
  riskScore: number | undefined
}

export function RiskTrendChart({ riskScore }: RiskTrendChartProps) {
  const data = generateRiskProjection(riskScore)
  const policyColor =
    riskScore !== undefined ? riskColor(riskScore) : "oklch(0.72 0.19 145)"

  return (
    <div className="glass-panel glow-ring flex h-full flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-3.5 text-[--color-mission-glow]" />
        <h3 className="text-xs tracking-widest text-[--color-mission-muted] uppercase">
          Risk Trend
        </h3>
      </div>

      <div className="min-h-0 flex-1" style={{ minHeight: 100, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient
                id="baselineRiskGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="oklch(0.70 0.22 25)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(0.70 0.22 25)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="policyRiskGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={policyColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={policyColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              tick={{
                fill: "oklch(0.45 0.05 220)",
                fontSize: 10,
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <YAxis
              domain={[0, 100]}
              tick={{
                fill: "oklch(0.45 0.05 220)",
                fontSize: 10,
                fontFamily: "monospace",
              }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={50}
              stroke="oklch(0.45 0.05 220 / 40%)"
              strokeDasharray="4 4"
              label={{
                value: "Moderate",
                position: "right",
                fill: "oklch(0.45 0.05 220 / 50%)",
                fontSize: 9,
              }}
            />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="oklch(0.70 0.22 25)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              fill="url(#baselineRiskGradient)"
              fillOpacity={1}
              dot={false}
              name="Baseline"
            />
            {riskScore !== undefined && (
              <Area
                type="monotone"
                dataKey="policy"
                stroke={policyColor}
                strokeWidth={2}
                fill="url(#policyRiskGradient)"
                fillOpacity={1}
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
