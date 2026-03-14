import { Sparkles } from "lucide-react"

export function AiExplanationPanel() {
  return (
    <div className="glass-panel glow-ring h-full flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-3.5 text-[--color-mission-glow]" />
        <h3 className="text-xs uppercase tracking-widest text-[--color-mission-muted]">
          AI Analysis
        </h3>
      </div>

      <div className="border-l-2 border-[--color-mission-glow]/50 pl-3 flex-1">
        <p className="text-sm text-[--color-mission-muted] leading-relaxed font-mono">
          Adjust the policy sliders to generate an AI-powered climate impact
          analysis...
        </p>
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs text-[--color-mission-muted]">
        <span className="size-1.5 rounded-full bg-[--color-mission-glow] animate-pulse" />
        Ready
      </span>
    </div>
  )
}
