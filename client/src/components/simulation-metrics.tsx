import { useEffect, useRef } from "react"
import { useSpring, useTransform, motion } from "framer-motion"
import type { SimulationResult } from "@/services/api"
import { Thermometer, Factory, Waves, ShieldAlert } from "lucide-react"
import type { LucideIcon } from "lucide-react"

function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const spring = useSpring(value, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, (v) => format(v))
  const ref = useRef(value)

  useEffect(() => {
    if (ref.current !== value) {
      spring.set(value)
      ref.current = value
    }
  }, [value, spring])

  return <motion.span>{display}</motion.span>
}

interface MetricCardProps {
  icon: LucideIcon
  label: string
  numericValue: number
  format: (v: number) => string
  unit: string
  accentColor: string
  glowColor: string
}

function MetricCard({ icon: Icon, label, numericValue, format, unit, accentColor, glowColor }: MetricCardProps) {
  return (
    <div
      className="relative flex items-start gap-3 px-4 py-3 bg-mission-surface/50 border border-mission-border overflow-hidden group"
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
        <span className="text-[10px] uppercase tracking-widest text-mission-muted leading-none">
          {label}
        </span>
        <span className="font-mono text-base font-bold leading-tight tabular-nums" style={{ color: accentColor }}>
          <AnimatedNumber value={numericValue} format={format} />
        </span>
        <span className="text-[10px] text-mission-muted leading-none">
          {unit}
        </span>
      </div>
    </div>
  )
}

/** Severity color: green (good) -> amber (moderate) -> red (bad) */
function severityColor(value: number, thresholds: [number, number]): string {
  const [good, bad] = thresholds
  if (value <= good) return "oklch(0.72 0.19 145)" // green
  if (value <= bad)  return "oklch(0.80 0.18 85)"  // amber
  return "oklch(0.70 0.22 25)"                      // red
}

function glowFrom(color: string): string {
  return `${color.replace(")", " / 8%)")}`
}

interface SimulationMetricsProps {
  result?: SimulationResult
}

export function SimulationMetrics({ result }: SimulationMetricsProps) {
  const temp = result?.temperature_rise ?? 1.2
  const emissions = result?.co2_emissions ?? 36.8
  const seaLevel = result?.sea_level_rise ?? 3.7
  const risk = result?.risk_score ?? 68

  const tempColor = severityColor(temp, [1.5, 2.0])
  const emissionsColor = severityColor(emissions, [20, 30])
  const seaColor = severityColor(seaLevel, [4.0, 5.5])
  const riskColor = severityColor(risk, [30, 60])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <MetricCard
        icon={Thermometer}
        label="Temperature Rise"
        numericValue={temp}
        format={(v) => `+${v.toFixed(1)}°C`}
        unit="vs pre-industrial"
        accentColor={tempColor}
        glowColor={glowFrom(tempColor)}
      />
      <MetricCard
        icon={Factory}
        label="CO₂ Emissions"
        numericValue={emissions}
        format={(v) => `${v.toFixed(1)} Gt`}
        unit="CO₂ per year"
        accentColor={emissionsColor}
        glowColor={glowFrom(emissionsColor)}
      />
      <MetricCard
        icon={Waves}
        label="Sea Level Rise"
        numericValue={seaLevel}
        format={(v) => `+${v.toFixed(1)} mm`}
        unit="per year"
        accentColor={seaColor}
        glowColor={glowFrom(seaColor)}
      />
      <MetricCard
        icon={ShieldAlert}
        label="Risk Score"
        numericValue={risk}
        format={(v) => v.toFixed(0)}
        unit="out of 100"
        accentColor={riskColor}
        glowColor={glowFrom(riskColor)}
      />
    </div>
  )
}
