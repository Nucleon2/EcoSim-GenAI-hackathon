import { Globe2, Database } from "lucide-react"

export function TopBar() {
  return (
    <header className="glass-panel glow-ring flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-3">
        <Globe2 className="size-5 text-[--color-mission-glow]" />
        <h1 className="text-sm font-semibold tracking-widest uppercase text-[--color-mission-glow]">
          AI Climate Policy Copilot
        </h1>
      </div>
      <div className="hidden md:flex items-center gap-1.5 text-[--color-mission-muted]">
        <Database className="size-3" />
        <span className="text-[9px] tracking-wider uppercase">
          NASA &middot; World Bank &middot; Global Carbon Project
        </span>
      </div>
    </header>
  )
}
