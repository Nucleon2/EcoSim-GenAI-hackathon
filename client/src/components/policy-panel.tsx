import { useRef, useState, useEffect, useCallback } from "react"
import { SlidersHorizontal, Target, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GoalModePanel } from "@/components/goal-mode-panel"
import { PolicySlider, SLIDER_CONFIG, POLICY_DEFAULTS, type PolicyValues } from "@/components/policy-sliders"
import type { PolicyInput } from "@/services/api"

const YEAR_OPTIONS = [2030, 2040, 2050, 2060, 2070, 2080, 2100]

type Mode = "manual" | "goal"

const PRESETS: { label: string; values: PolicyValues }[] = [
  {
    label: "Business as Usual",
    values: { carbonTax: 0, renewableAdoption: 10, deforestationReduction: 5, methaneReduction: 5, evAdoption: 5, targetYear: 2050 },
  },
  {
    label: "Paris Agreement",
    values: { carbonTax: 100, renewableAdoption: 60, deforestationReduction: 50, methaneReduction: 40, evAdoption: 30, targetYear: 2050 },
  },
  {
    label: "Net Zero 2050",
    values: { carbonTax: 250, renewableAdoption: 95, deforestationReduction: 85, methaneReduction: 80, evAdoption: 90, targetYear: 2050 },
  },
]

interface PolicyPanelProps {
  onSimulate?: (values: PolicyValues) => void
  isPending?: boolean
  initialPolicy?: PolicyValues
  onPolicyChange?: (values: PolicyValues) => void
}

export type { PolicyValues }

function fromApiPolicy(api: PolicyInput): PolicyValues {
  return {
    carbonTax: api.carbon_tax,
    renewableAdoption: api.renewable_adoption,
    deforestationReduction: api.deforestation_reduction,
    methaneReduction: api.methane_reduction,
    evAdoption: api.ev_adoption,
    targetYear: api.target_year ?? 2050,
  }
}

function policyChanged(a: PolicyValues, b: PolicyValues | null): boolean {
  if (!b) return true
  return (Object.keys(a) as (keyof PolicyValues)[]).some((k) => a[k] !== b[k])
}

export function PolicyPanel({ onSimulate, isPending, initialPolicy, onPolicyChange }: PolicyPanelProps) {
  const [mode, setMode] = useState<Mode>("manual")
  const [policy, setPolicy] = useState<PolicyValues>(initialPolicy ?? POLICY_DEFAULTS)
  const lastSimulated = useRef<PolicyValues | null>(null)

  const hasChanges = policyChanged(policy, lastSimulated.current)

  const updatePolicy = (next: PolicyValues) => {
    setPolicy(next)
    onPolicyChange?.(next)
  }

  const update = (key: keyof PolicyValues) => (v: number) =>
    updatePolicy({ ...policy, [key]: v })

  // Keyboard shortcut: Enter to run simulation
  const handleKeySimulate = useCallback(() => {
    if (mode === "manual" && hasChanges && !isPending) {
      lastSimulated.current = { ...policy }
      onSimulate?.(policy)
    }
  }, [mode, hasChanges, isPending, policy, onSimulate])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
        handleKeySimulate()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [handleKeySimulate])

  const handleApplyGoal = (recommended: PolicyInput) => {
    const values = fromApiPolicy(recommended)
    updatePolicy(values)
    lastSimulated.current = { ...values }
    setMode("manual")
    onSimulate?.(values)
  }

  return (
    <div className="glass-panel glow-ring h-full flex flex-col gap-6 p-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mode === "manual" ? (
            <SlidersHorizontal className="size-3.5 text-mission-glow" />
          ) : (
            <Target className="size-3.5 text-mission-glow" />
          )}
          <h2 className="text-xs uppercase tracking-widest text-mission-muted">
            {mode === "manual" ? "Policy Controls" : "Goal Mode"}
          </h2>
        </div>
        <button
          onClick={() => setMode(mode === "manual" ? "goal" : "manual")}
          className="text-[10px] uppercase tracking-wider px-2 py-1 border border-white/10 text-mission-muted hover:text-mission-glow hover:border-mission-glow/30 transition-colors"
        >
          {mode === "manual" ? "Goal Mode" : "Manual"}
        </button>
      </div>

      {mode === "manual" ? (
        <>
          {/* Year Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3 text-mission-muted" />
              <span className="text-[10px] uppercase tracking-wider text-mission-muted">
                Projection Year
              </span>
            </div>
            <div className="flex gap-1">
              {YEAR_OPTIONS.map((year) => (
                <button
                  key={year}
                  onClick={() => updatePolicy({ ...policy, targetYear: year })}
                  className={`flex-1 text-[10px] font-mono py-1 border transition-colors ${
                    policy.targetYear === year
                      ? "border-mission-glow/50 text-mission-glow bg-mission-glow/10"
                      : "border-mission-border text-mission-muted hover:text-mission-glow hover:border-mission-glow/30"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Scenarios */}
          <div className="flex gap-1.5 flex-wrap">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => updatePolicy({ ...preset.values, targetYear: policy.targetYear })}
                className="text-[9px] uppercase tracking-wider px-2 py-1 border border-mission-border text-mission-muted hover:text-mission-glow hover:border-mission-glow/30 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

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

          <div className="flex flex-col items-center gap-1">
            <Button
              variant="outline"
              className="w-full border-mission-glow/40 text-mission-glow hover:bg-mission-glow/10 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={isPending || !hasChanges}
              onClick={() => {
                lastSimulated.current = { ...policy }
                onSimulate?.(policy)
              }}
            >
              {isPending ? "Simulating..." : (
                <span className="flex items-center gap-2">
                  Run Simulation
                  <kbd className="hidden md:inline text-[9px] opacity-50 border border-current/30 px-1 py-0.5 leading-none">Enter</kbd>
                </span>
              )}
            </Button>
            {!hasChanges && !isPending && (
              <span className="text-[9px] text-mission-muted animate-pulse">
                Adjust sliders or pick a preset to simulate
              </span>
            )}
          </div>
        </>
      ) : (
        <GoalModePanel onApply={handleApplyGoal} />
      )}
    </div>
  )
}
