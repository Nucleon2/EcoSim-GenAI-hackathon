import { Thermometer, Factory, Waves, ShieldAlert } from "lucide-react"
import { PolicySlider, SLIDER_CONFIG, type PolicyValues } from "@/components/policy-sliders"
import { EarthScene } from "@/scenes/earth-scene"
import type { SimulationResult } from "@/services/api"

interface ScenarioColumnProps {
  label: string
  accent: string
  policy: PolicyValues
  onPolicyChange: (values: PolicyValues) => void
  result?: SimulationResult
  isPending: boolean
}

function riskColor(score: number): string {
  if (score <= 30) return "oklch(0.72 0.19 145)"
  if (score <= 60) return "oklch(0.80 0.18 85)"
  return "oklch(0.70 0.22 25)"
}

export function ScenarioColumn({
  label,
  accent,
  policy,
  onPolicyChange,
  result,
  isPending,
}: ScenarioColumnProps) {
  const update = (key: keyof PolicyValues) => (v: number) =>
    onPolicyChange({ ...policy, [key]: v })

  const temp = result?.temperature_rise ?? 1.2
  const emissions = result?.co2_emissions ?? 36.8
  const seaLevel = result?.sea_level_rise ?? 3.7
  const risk = result?.risk_score ?? 68

  return (
    <div className="flex flex-col gap-2 min-h-0">
      {/* Label */}
      <div
        className="glass-panel px-4 py-2 flex items-center gap-2"
        style={{ borderLeftWidth: 3, borderLeftColor: accent }}
      >
        <div className="size-2" style={{ backgroundColor: accent }} />
        <span className="text-xs uppercase tracking-widest text-[--color-mission-muted] font-medium">
          {label}
        </span>
      </div>

      {/* Sliders */}
      <div className="glass-panel p-4 flex flex-col gap-4">
        {SLIDER_CONFIG.map((s) => (
          <PolicySlider
            key={s.key}
            label={s.label}
            unit={s.unit}
            value={policy[s.key]}
            min={s.min}
            max={s.max}
            onChange={update(s.key)}
          />
        ))}
      </div>

      {/* Globe */}
      <div className="glass-panel glow-ring overflow-hidden flex-1 min-h-[280px]">
        {isPending ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="size-12 border-2 border-[--color-mission-glow]/30 border-t-[--color-mission-glow] animate-spin" />
          </div>
        ) : (
          <EarthScene result={result} compact />
        )}
      </div>

      {/* Metrics 2x2 */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCell
          icon={<Thermometer className="size-3.5" style={{ color: "oklch(0.75 0.20 40)" }} />}
          label="Temperature"
          value={`+${temp.toFixed(1)}°C`}
          accentColor="oklch(0.75 0.20 40)"
        />
        <MetricCell
          icon={<Factory className="size-3.5" style={{ color: "oklch(0.65 0.18 195)" }} />}
          label="Emissions"
          value={`${emissions.toFixed(1)} Gt`}
          accentColor="oklch(0.65 0.18 195)"
        />
        <MetricCell
          icon={<Waves className="size-3.5" style={{ color: "oklch(0.65 0.16 250)" }} />}
          label="Sea Level"
          value={`+${seaLevel.toFixed(1)} mm`}
          accentColor="oklch(0.65 0.16 250)"
        />
        <MetricCell
          icon={<ShieldAlert className="size-3.5" style={{ color: riskColor(risk) }} />}
          label="Risk Score"
          value={risk.toFixed(0)}
          accentColor={riskColor(risk)}
        />
      </div>
    </div>
  )
}

interface MetricCellProps {
  icon: React.ReactNode
  label: string
  value: string
  accentColor: string
}

function MetricCell({ icon, label, value, accentColor }: MetricCellProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 bg-[--color-mission-surface]/50 border border-[--color-mission-border]"
      style={{ borderLeftWidth: 2, borderLeftColor: accentColor }}
    >
      {icon}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[9px] uppercase tracking-widest text-[--color-mission-muted] leading-none">
          {label}
        </span>
        <span className="font-mono text-sm font-bold text-[--color-mission-stat] leading-tight tabular-nums">
          {value}
        </span>
      </div>
    </div>
  )
}
