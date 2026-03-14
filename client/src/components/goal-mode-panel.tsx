import { useState } from "react"
import { Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOptimize } from "@/hooks/use-optimize"
import type { PolicyInput } from "@/services/api"

const GOALS = [
  { id: "limit_warming_1_5", label: "Keep warming below 1.5°C" },
  { id: "limit_warming_2", label: "Keep warming below 2.0°C" },
  { id: "reduce_emissions_50", label: "Cut emissions by 50%" },
  { id: "minimize_risk", label: "Minimize climate risk" },
] as const

interface GoalModePanelProps {
  onApply: (policies: PolicyInput) => void
}

export function GoalModePanel({ onApply }: GoalModePanelProps) {
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0].id)
  const optimize = useOptimize()

  const handleGenerate = () => {
    optimize.mutate({ goal: selectedGoal })
  }

  const result = optimize.data

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-[--color-mission-muted]">Climate Goal</span>
        <select
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-sm text-[--color-mission-text] p-2 focus:outline-none focus:border-[--color-mission-glow]/50"
        >
          {GOALS.map((g) => (
            <option key={g.id} value={g.id} className="bg-[--color-mission-bg]">
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <Button
        variant="outline"
        className="w-full border-[--color-mission-glow]/40 text-[--color-mission-glow] hover:bg-[--color-mission-glow]/10"
        disabled={optimize.isPending}
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

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[--color-mission-muted]">{label}</span>
      <span className="font-mono text-[--color-mission-stat]">{value}</span>
    </div>
  )
}
