import { Globe2 } from "lucide-react"

export function TopBar() {
  return (
    <header className="glass-panel glow-ring flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-3">
        <Globe2 className="size-5 text-mission-glow" />
        <h1 className="text-sm font-semibold tracking-widest uppercase text-mission-glow">
          AI Climate Policy Copilot
        </h1>
      </div>
    </header>
  )
}
