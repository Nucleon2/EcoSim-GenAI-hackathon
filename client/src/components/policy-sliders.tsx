import { Slider } from "@/components/ui/slider"

export interface PolicyValues {
  carbonTax: number
  renewableAdoption: number
  deforestationReduction: number
  methaneReduction: number
  evAdoption: number
}

export const POLICY_DEFAULTS: PolicyValues = {
  carbonTax: 50,
  renewableAdoption: 30,
  deforestationReduction: 25,
  methaneReduction: 20,
  evAdoption: 15,
}

export const SLIDER_CONFIG = [
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

export function PolicySlider({ label, unit, value, min, max, onChange }: PolicySliderProps) {
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
