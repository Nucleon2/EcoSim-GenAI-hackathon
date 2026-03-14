import { useState } from "react"
import { Megaphone } from "lucide-react"
import { PolicyLetterModal } from "@/components/policy-letter-modal"
import type { PolicyInput, SimulationResult } from "@/services/api"

interface TakeActionButtonProps {
  policy: PolicyInput | null
  result: SimulationResult | null
}

export function TakeActionButton({ policy, result }: TakeActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!policy || !result) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-mission-accent/50 bg-mission-accent/10 text-mission-accent hover:bg-mission-accent/20 hover:border-mission-accent/70 transition-colors text-[10px] uppercase tracking-wider"
      >
        <Megaphone className="size-3" />
        Take Action
      </button>

      {isOpen && (
        <PolicyLetterModal
          policy={policy}
          result={result}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
