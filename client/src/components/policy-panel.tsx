import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

const SLIDER_SHELLS = [
  { label: "Renewable Energy Adoption", unit: "%" },
  { label: "Carbon Tax Rate", unit: "$/tonne" },
  { label: "Deforestation Reduction", unit: "%" },
]

function PolicySliderShell({ label, unit }: { label: string; unit: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[--color-mission-muted]">{label}</span>
        <span className="font-mono text-xs text-[--color-mission-stat]">
          -- {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[--color-mission-surface] relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-[--color-mission-glow]/50" />
      </div>
    </div>
  )
}

export function PolicyPanel() {
  return (
    <div className="glass-panel glow-ring h-full flex flex-col gap-6 p-5 overflow-y-auto">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="size-3.5 text-[--color-mission-glow]" />
        <h2 className="text-xs uppercase tracking-widest text-[--color-mission-muted]">
          Policy Controls
        </h2>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        {SLIDER_SHELLS.map((s) => (
          <PolicySliderShell key={s.label} {...s} />
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
