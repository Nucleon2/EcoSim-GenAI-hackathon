import { Sparkles } from "lucide-react"

interface ComparisonAiPanelProps {
  explanation?: string
  isPending?: boolean
}

export function ComparisonAiPanel({ explanation, isPending }: ComparisonAiPanelProps) {
  return (
    <div className="glass-panel glow-ring flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-3.5 text-mission-glow" />
        <h3 className="text-xs uppercase tracking-widest text-mission-muted">
          AI Comparison Analysis
        </h3>
      </div>

      <div className="border-l-2 border-mission-glow/50 pl-3">
        {isPending ? (
          <p className="text-[11px] text-mission-glow leading-snug font-mono animate-pulse">
            Analyzing scenarios...
          </p>
        ) : explanation ? (
          <p className="text-[11px] text-mission-stat leading-snug font-mono">
            {explanation}
          </p>
        ) : (
          <p className="text-[11px] text-mission-muted leading-snug font-mono">
            Run a comparison to generate an AI-powered analysis of how the two scenarios differ and which performs better.
          </p>
        )}
      </div>

      <span className="inline-flex items-center gap-1.5 text-xs text-mission-muted">
        <span
          className={`size-1.5 rounded-full ${
            isPending
              ? "bg-mission-glow animate-pulse"
              : explanation
                ? "bg-mission-accent"
                : "bg-mission-muted"
          }`}
        />
        {isPending ? "Analyzing" : explanation ? "Complete" : "Ready"}
      </span>
    </div>
  )
}
