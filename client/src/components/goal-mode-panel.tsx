import { useState } from "react"
import { Target, AlertTriangle, Thermometer, Factory, Waves, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOptimize } from "@/hooks/use-optimize"
import type { PolicyInput, OptimizeRequest } from "@/services/api"

const TARGET_CONFIG = [
  { key: "temperature_rise" as const, label: "Temperature Rise", unit: "°C", placeholder: "1.5", step: 0.1, resultKey: "temperature_rise" as const },
  { key: "co2_emissions" as const, label: "CO₂ Emissions", unit: "GtCO₂/yr", placeholder: "18.0", step: 0.5, resultKey: "co2_emissions" as const },
  { key: "sea_level_rise" as const, label: "Sea Level Rise", unit: "mm/yr", placeholder: "4.0", step: 0.1, resultKey: "sea_level_rise" as const },
  { key: "risk_score" as const, label: "Risk Score", unit: "/100", placeholder: "25", step: 1, resultKey: "risk_score" as const },
] as const

type TargetKey = (typeof TARGET_CONFIG)[number]["key"]

interface GoalModePanelProps {
  onApply: (policies: PolicyInput) => void
}

export function GoalModePanel({ onApply }: GoalModePanelProps) {
  const [enabled, setEnabled] = useState<Record<TargetKey, boolean>>({
    temperature_rise: false,
    co2_emissions: false,
    sea_level_rise: false,
    risk_score: false,
  })
  const [values, setValues] = useState<Record<TargetKey, string>>({
    temperature_rise: "",
    co2_emissions: "",
    sea_level_rise: "",
    risk_score: "",
  })
  const optimize = useOptimize()

  const hasAnyTarget = Object.values(enabled).some(Boolean)

  const handleGenerate = () => {
    const request: OptimizeRequest = {}
    for (const t of TARGET_CONFIG) {
      if (enabled[t.key] && values[t.key]) {
        request[t.key] = parseFloat(values[t.key])
      }
    }
    optimize.mutate(request)
  }

  const result = optimize.data

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-3">
        <span className="text-xs text-[--color-mission-muted]">Set Climate Targets</span>
        {TARGET_CONFIG.map((t) => (
          <div key={t.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={enabled[t.key]}
              onChange={(e) =>
                setEnabled((prev) => ({ ...prev, [t.key]: e.target.checked }))
              }
              className="accent-[--color-mission-glow] size-3.5 shrink-0"
            />
            <span className="text-xs text-[--color-mission-muted] w-[100px] shrink-0">{t.label}</span>
            {enabled[t.key] && (
              <div className="flex items-center gap-1 flex-1">
                <span className="text-[10px] text-[--color-mission-muted]">&lt;</span>
                <input
                  type="number"
                  step={t.step}
                  placeholder={t.placeholder}
                  value={values[t.key]}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [t.key]: e.target.value }))
                  }
                  className="w-full bg-white/5 border border-white/10 text-xs text-[--color-mission-text] font-mono px-2 py-1 focus:outline-none focus:border-[--color-mission-glow]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-[10px] text-[--color-mission-muted] shrink-0">{t.unit}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full border-[--color-mission-glow]/40 text-[--color-mission-glow] hover:bg-[--color-mission-glow]/10"
        disabled={optimize.isPending || !hasAnyTarget}
        onClick={handleGenerate}
      >
        {optimize.isPending ? (
          <span className="animate-pulse">Optimizing...</span>
        ) : (
          <>
            <Target className="size-3.5 mr-2" />
            Generate Strategy
          </>
        )}
      </Button>

      {result && (
        <div className="flex flex-col gap-3 flex-1">
          {/* Warn if any target not met */}
          {TARGET_CONFIG.some(
            (t) =>
              enabled[t.key] &&
              values[t.key] &&
              result.projected_results[t.resultKey] > parseFloat(values[t.key])
          ) && (
            <div className="flex items-start gap-2 text-amber-400 text-[10px]">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
              <span>Some targets exceed what maximum policies can achieve. Showing best-effort results.</span>
            </div>
          )}

          {/* Projected Outcomes */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-[--color-mission-muted]">
              Projected Outcomes
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <OutcomeCard
                icon={Thermometer}
                label="Temperature"
                value={`+${result.projected_results.temperature_rise.toFixed(1)}°C`}
                target={enabled.temperature_rise && values.temperature_rise ? parseFloat(values.temperature_rise) : undefined}
                actual={result.projected_results.temperature_rise}
              />
              <OutcomeCard
                icon={Factory}
                label="CO₂ Emissions"
                value={`${result.projected_results.co2_emissions.toFixed(1)} Gt`}
                target={enabled.co2_emissions && values.co2_emissions ? parseFloat(values.co2_emissions) : undefined}
                actual={result.projected_results.co2_emissions}
              />
              <OutcomeCard
                icon={Waves}
                label="Sea Level"
                value={`+${result.projected_results.sea_level_rise.toFixed(1)} mm`}
                target={enabled.sea_level_rise && values.sea_level_rise ? parseFloat(values.sea_level_rise) : undefined}
                actual={result.projected_results.sea_level_rise}
              />
              <OutcomeCard
                icon={ShieldAlert}
                label="Risk Score"
                value={result.projected_results.risk_score.toFixed(0)}
                target={enabled.risk_score && values.risk_score ? parseFloat(values.risk_score) : undefined}
                actual={result.projected_results.risk_score}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-[--color-mission-muted]">
              Recommended Policies
            </span>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <PolicyRow label="Carbon Tax" value={`$${result.recommended_policies.carbon_tax}/t`} />
              <PolicyRow label="Renewables" value={`${result.recommended_policies.renewable_adoption}%`} />
              <PolicyRow label="Deforestation" value={`${result.recommended_policies.deforestation_reduction}%`} />
              <PolicyRow label="Methane" value={`${result.recommended_policies.methane_reduction}%`} />
              <PolicyRow label="EV Adoption" value={`${result.recommended_policies.ev_adoption}%`} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-[--color-mission-muted]">
              AI Analysis
            </span>
            <p className="text-xs text-[--color-mission-text]/80 leading-relaxed">
              {result.explanation}
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full mt-auto border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10"
            onClick={() => onApply(result.recommended_policies)}
          >
            Apply & Simulate
          </Button>
        </div>
      )}
    </div>
  )
}

function OutcomeCard({
  icon: Icon,
  label,
  value,
  target,
  actual,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  target?: number
  actual: number
}) {
  const met = target == null || actual <= target
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-2 bg-[--color-mission-surface]/50 border border-[--color-mission-border]"
      style={{ borderLeftWidth: 2, borderLeftColor: met ? "oklch(0.72 0.19 145)" : "oklch(0.80 0.18 85)" }}
    >
      <Icon className="size-3.5 shrink-0 text-[--color-mission-muted]" />
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] uppercase tracking-wider text-[--color-mission-muted] leading-none">{label}</span>
        <span className="font-mono text-sm font-bold tabular-nums" style={{ color: met ? "oklch(0.72 0.19 145)" : "oklch(0.80 0.18 85)" }}>
          {value}
        </span>
        {target != null && (
          <span className="text-[9px] text-[--color-mission-muted]">
            target: &lt;{target}
          </span>
        )}
      </div>
    </div>
  )
}

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[--color-mission-muted]">{label}</span>
      <span className="font-mono text-[--color-mission-stat]">{value}</span>
    </div>
  )
}
