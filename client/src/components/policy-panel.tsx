import { useState } from "react"
import { SlidersHorizontal, Target } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { GoalModePanel } from "@/components/goal-mode-panel"
import type { PolicyInput } from "@/services/api"

interface PolicyValues {
  carbonTax: number
  renewableAdoption: number
  deforestationReduction: number
  methaneReduction: number
  evAdoption: number
}

const DEFAULTS: PolicyValues = {
  carbonTax: 50,
  renewableAdoption: 30,
  deforestationReduction: 25,
  methaneReduction: 20,
  evAdoption: 15,
}

const SLIDER_CONFIG = [
  { key: "carbonTax" as const, label: "Carbon Tax Rate", min: 0, max: 300, unit: "$/tonne" },
  { key: "renewableAdoption" as const, label: "Renewable Adoption", min: 0, max: 100, unit: "%" },
  { key: "deforestationReduction" as const, label: "Deforestation Reduction", min: 0, max: 100, unit: "%" },
  { key: "methaneReduction" as const, label: "Methane Reduction", min: 0, max: 100, unit: "%" },
  { key: "evAdoption" as const, label: "EV Adoption", min: 0, max: 100, unit: "%" },
]

interface PolicySliderProps {
  label: string
  unit: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}

function PolicySlider({ label, unit, value, min, max, onChange }: PolicySliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[--color-mission-muted]">{label}</span>
        <span className="font-mono text-xs text-[--color-mission-stat]">
          {value} {unit}
        </span>
      </div>
      <Slider
        value={value}
        onValueChange={(v) => onChange(Array.isArray(v) ? (v as number[])[0] : (v as number))}
        min={min}
        max={max}
      />
    </div>
  )
}

type Mode = "manual" | "goal"

interface PolicyPanelProps {
  onSimulate?: (values: PolicyValues) => void
  isPending?: boolean
}

export type { PolicyValues }

function fromApiPolicy(api: PolicyInput): PolicyValues {
  return {
    carbonTax: api.carbon_tax,
    renewableAdoption: api.renewable_adoption,
    deforestationReduction: api.deforestation_reduction,
    methaneReduction: api.methane_reduction,
    evAdoption: api.ev_adoption,
  }
}

export function PolicyPanel({ onSimulate, isPending }: PolicyPanelProps) {
  const [mode, setMode] = useState<Mode>("manual")
  const [policy, setPolicy] = useState<PolicyValues>(DEFAULTS)

  const update = (key: keyof PolicyValues) => (v: number) =>
    setPolicy((prev) => ({ ...prev, [key]: v }))

  const handleApplyGoal = (recommended: PolicyInput) => {
    const values = fromApiPolicy(recommended)
    setPolicy(values)
    setMode("manual")
    onSimulate?.(values)
  }

  return (
    <div className="glass-panel glow-ring h-full flex flex-col gap-6 p-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mode === "manual" ? (
            <SlidersHorizontal className="size-3.5 text-[--color-mission-glow]" />
          ) : (
            <Target className="size-3.5 text-[--color-mission-glow]" />
          )}
          <h2 className="text-xs uppercase tracking-widest text-[--color-mission-muted]">
            {mode === "manual" ? "Policy Controls" : "Goal Mode"}
          </h2>
        </div>
        <button
          onClick={() => setMode(mode === "manual" ? "goal" : "manual")}
          className="text-[10px] uppercase tracking-wider px-2 py-1 border border-white/10 text-[--color-mission-muted] hover:text-[--color-mission-glow] hover:border-[--color-mission-glow]/30 transition-colors"
        >
          {mode === "manual" ? "Goal Mode" : "Manual"}
        </button>
      </div>

      {mode === "manual" ? (
        <>
          <div className="flex flex-col gap-6 flex-1">
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

          <Button
            variant="outline"
            className="w-full border-[--color-mission-glow]/40 text-[--color-mission-glow] hover:bg-[--color-mission-glow]/10"
            disabled={isPending}
            onClick={() => onSimulate?.(policy)}
          >
            {isPending ? "Simulating..." : "Run Simulation"}
          </Button>
        </>
      ) : (
        <GoalModePanel onApply={handleApplyGoal} />
      )}
    </div>
  )
}
