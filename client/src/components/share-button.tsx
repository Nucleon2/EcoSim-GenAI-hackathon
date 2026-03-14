import { useState } from "react"
import { Share2, Check } from "lucide-react"
import type { PolicyValues } from "@/components/policy-sliders"

interface ShareButtonProps {
  policy: PolicyValues
}

function encodePolicy(p: PolicyValues): string {
  const params = new URLSearchParams({
    ct: String(p.carbonTax),
    ra: String(p.renewableAdoption),
    dr: String(p.deforestationReduction),
    mr: String(p.methaneReduction),
    ev: String(p.evAdoption),
    yr: String(p.targetYear),
  })
  return params.toString()
}

export function decodePolicy(hash: string): PolicyValues | null {
  try {
    const params = new URLSearchParams(hash.replace(/^#/, ""))
    const ct = params.get("ct")
    if (!ct) return null
    return {
      carbonTax: Number(params.get("ct")),
      renewableAdoption: Number(params.get("ra")),
      deforestationReduction: Number(params.get("dr")),
      methaneReduction: Number(params.get("mr")),
      evAdoption: Number(params.get("ev")),
      targetYear: Number(params.get("yr")) || 2050,
    }
  } catch {
    return null
  }
}

export function ShareButton({ policy }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${encodePolicy(policy)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      prompt("Copy this link:", url)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 border border-[--color-mission-border] text-[--color-mission-muted] hover:text-[--color-mission-glow] hover:border-[--color-mission-glow]/30 transition-colors text-[10px] uppercase tracking-wider"
    >
      {copied ? <Check className="size-3" /> : <Share2 className="size-3" />}
      {copied ? "Copied!" : "Share"}
    </button>
  )
}
