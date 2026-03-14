import { Sparkles } from "lucide-react"

interface AiExplanationPanelProps {
  explanation?: string
  isPending?: boolean
}

export function AiExplanationPanel({ explanation, isPending }: AiExplanationPanelProps) {
  return (
    <div className="glass-panel glow-ring h-full flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-3.5 text-[--color-mission-glow]" />
        <h3 className="text-xs uppercase tracking-widest text-[--color-mission-muted]">
          AI Analysis
        </h3>
      </div>

      <div className="border-l-2 border-[--color-mission-glow]/50 pl-3 flex-1 overflow-y-auto">
        {isPending ? (
          <p className="text-[11px] text-[--color-mission-glow] leading-snug font-mono animate-pulse">
            Analyzing policy impact...
          </p>
        ) : explanation ? (
          <p className="text-[11px] text-[--color-mission-stat] leading-snug font-mono">
            {explanation}
          </p>
        ) : (
          <p className="text-[11px] text-[--color-mission-muted] leading-snug font-mono">
            Adjust the policy sliders and run a simulation to generate an
            AI-powered climate impact analysis...
          </p>
        )}
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs text-[--color-mission-muted]">
        <span
          className={`size-1.5 rounded-full ${
            isPending
              ? "bg-[--color-mission-glow] animate-pulse"
              : explanation
                ? "bg-[--color-mission-accent]"
                : "bg-[--color-mission-muted]"
          }`}
        />
        {isPending ? "Analyzing" : explanation ? "Complete" : "Ready"}
      </span>
    </div>
  )
}
