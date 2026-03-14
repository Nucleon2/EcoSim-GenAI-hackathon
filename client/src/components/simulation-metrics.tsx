import type { SimulationResult } from "@/services/api"
import { Thermometer, Factory, Waves, ShieldAlert } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  unit: string
  accentColor: string
  glowColor: string
}

function MetricCard({ icon: Icon, label, value, unit, accentColor, glowColor }: MetricCardProps) {
  return (
    <div
      className="relative flex items-start gap-3 px-4 py-3 bg-[--color-mission-surface]/50 border border-[--color-mission-border] overflow-hidden group"
      style={{ borderLeftWidth: 2, borderLeftColor: accentColor }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 50%, ${glowColor}, transparent 70%)` }}
      />

      <div className="relative mt-0.5 shrink-0">
        <Icon className="size-4" style={{ color: accentColor }} />
      </div>

      <div className="relative flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] uppercase tracking-widest text-[--color-mission-muted] leading-none">
          {label}
        </span>
        <span className="font-mono text-base font-bold text-[--color-mission-stat] leading-tight tabular-nums">
          {value}
        </span>
        <span className="text-[10px] text-[--color-mission-muted] leading-none">
          {unit}
        </span>
      </div>
    </div>
  )
}

function riskColor(score: number): string {
  if (score <= 30) return "oklch(0.72 0.19 145)"
  if (score <= 60) return "oklch(0.80 0.18 85)"
  return "oklch(0.70 0.22 25)"
}

interface SimulationMetricsProps {
  result?: SimulationResult
}

export function SimulationMetrics({ result }: SimulationMetricsProps) {
  const temp = result?.temperature_rise ?? 1.2
  const emissions = result?.co2_emissions ?? 36.8
  const seaLevel = result?.sea_level_rise ?? 3.7
  const risk = result?.risk_score ?? 68

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <MetricCard
        icon={Thermometer}
        label="Temperature Rise"
        value={`+${temp.toFixed(1)}°C`}
        unit="vs pre-industrial"
        accentColor="oklch(0.75 0.20 40)"
        glowColor="oklch(0.75 0.20 40 / 8%)"
      />
      <MetricCard
        icon={Factory}
        label="CO₂ Emissions"
        value={`${emissions.toFixed(1)} Gt`}
        unit="CO₂ per year"
        accentColor="oklch(0.65 0.18 195)"
        glowColor="oklch(0.65 0.18 195 / 8%)"
      />
      <MetricCard
        icon={Waves}
        label="Sea Level Rise"
        value={`+${seaLevel.toFixed(1)} mm`}
        unit="per year"
        accentColor="oklch(0.65 0.16 250)"
        glowColor="oklch(0.65 0.16 250 / 8%)"
      />
      <MetricCard
        icon={ShieldAlert}
        label="Risk Score"
        value={risk.toFixed(0)}
        unit="out of 100"
        accentColor={riskColor(risk)}
        glowColor={`${riskColor(risk).replace(")", " / 8%)")}`}
      />
    </div>
  )
}
