import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Slider } from "@base-ui/react/slider"
import { Button } from "@/components/ui/button"

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
      <Slider.Root
        value={value}
        onValueChange={onChange}
        min={min}
        max={max}
      >
        <Slider.Control className="policy-slider-track">
          <Slider.Track className="h-1.5 w-full rounded-full bg-[oklch(0.25_0.03_240)]">
            <Slider.Indicator className="rounded-full bg-gradient-to-r from-[--color-mission-glow] to-[--color-mission-accent]" />
            <Slider.Thumb className="policy-slider-thumb size-4 rounded-full bg-[--color-mission-bg] border-2 border-[--color-mission-glow] shadow-[0_0_8px_var(--color-mission-glow)]" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </div>
  )
}

export function PolicyPanel() {
  const [policy, setPolicy] = useState<PolicyValues>(DEFAULTS)

  const update = (key: keyof PolicyValues) => (v: number) =>
    setPolicy((prev) => ({ ...prev, [key]: v }))

  return (
    <div className="glass-panel glow-ring h-full flex flex-col gap-6 p-5 overflow-y-auto">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="size-3.5 text-[--color-mission-glow]" />
        <h2 className="text-xs uppercase tracking-widest text-[--color-mission-muted]">
          Policy Controls
        </h2>
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

      <Button
        variant="outline"
        className="w-full border-[--color-mission-glow]/40 text-[--color-mission-glow] hover:bg-[--color-mission-glow]/10"
      >
        Run Simulation
      </Button>
    </div>
  )
}
