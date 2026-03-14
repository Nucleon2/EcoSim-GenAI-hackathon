import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, ArrowLeft, Copy, Check, Mail, FileText, Users, Loader2, ExternalLink } from "lucide-react"
import { useDraftLetter } from "@/hooks/use-draft-letter"
import type { PolicyInput, SimulationResult } from "@/services/api"

interface PolicyLetterModalProps {
  policy: PolicyInput
  result: SimulationResult
  onClose: () => void
}

type LetterType = "representative" | "memo"
type Step = "form" | "result"

export function PolicyLetterModal({ policy, result, onClose }: PolicyLetterModalProps) {
  const [step, setStep] = useState<Step>("form")
  const [letterType, setLetterType] = useState<LetterType>("representative")
  const [userName, setUserName] = useState("")
  const [userLocation, setUserLocation] = useState("")
  const [copied, setCopied] = useState(false)
  const draft = useDraftLetter()

  // WebGL canvases render above all CSS z-index layers — hide them while modal is open
  useEffect(() => {
    const canvases = document.querySelectorAll<HTMLElement>("canvas")
    canvases.forEach((c) => { c.style.visibility = "hidden" })
    document.body.style.overflow = "hidden"
    return () => {
      canvases.forEach((c) => { c.style.visibility = "visible" })
      document.body.style.overflow = ""
    }
  }, [])

  const handleGenerate = () => {
    draft.mutate(
      {
        policy,
        result,
        letter_type: letterType,
        user_name: userName,
        user_location: userLocation,
      },
      { onSuccess: () => setStep("result") }
    )
  }

  const handleCopy = async () => {
    if (!draft.data?.letter) return
    try {
      await navigator.clipboard.writeText(draft.data.letter)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt("Copy this letter:", draft.data.letter)
    }
  }

  const handleMailTo = () => {
    if (!draft.data) return
    const subject = encodeURIComponent(draft.data.subject)
    const body = encodeURIComponent(draft.data.letter)
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-panel glow-ring w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mission-border">
          <div className="flex items-center gap-3">
            {step === "result" && (
              <button
                onClick={() => setStep("form")}
                className="text-mission-muted hover:text-mission-glow transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-medium text-mission-stat uppercase tracking-widest">
                Take Action
              </h2>
              <p className="text-[10px] text-mission-muted mt-0.5">
                {step === "form"
                  ? "Draft a professional advocacy document from your simulation"
                  : letterType === "representative"
                  ? "Letter to Representative"
                  : "Policy Memorandum"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-mission-muted hover:text-mission-glow transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          {step === "form" ? (
            <div className="space-y-6">
              {/* Summary of simulation */}
              <div className="border border-mission-border bg-mission-surface/30 p-4 space-y-1">
                <p className="text-[10px] text-mission-muted uppercase tracking-widest mb-2">
                  Simulation targets to advocate for
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <span className="text-[11px] text-mission-muted">Carbon Tax</span>
                  <span className="text-[11px] text-mission-stat font-mono">${policy.carbon_tax}/tonne</span>
                  <span className="text-[11px] text-mission-muted">Renewable Adoption</span>
                  <span className="text-[11px] text-mission-stat font-mono">{policy.renewable_adoption}%</span>
                  <span className="text-[11px] text-mission-muted">Deforestation Reduction</span>
                  <span className="text-[11px] text-mission-stat font-mono">{policy.deforestation_reduction}%</span>
                  <span className="text-[11px] text-mission-muted">Projected Temp Rise</span>
                  <span className="text-[11px] text-mission-stat font-mono">{result.temperature_rise.toFixed(2)}°C</span>
                  <span className="text-[11px] text-mission-muted">Projected CO₂</span>
                  <span className="text-[11px] text-mission-stat font-mono">{result.co2_emissions.toFixed(1)} GtCO₂/yr</span>
                </div>
              </div>

              {/* Document type */}
              <div className="space-y-2">
                <label className="text-[10px] text-mission-muted uppercase tracking-widest">
                  Document Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLetterType("representative")}
                    className={`flex items-center gap-3 p-3 border transition-all text-left ${
                      letterType === "representative"
                        ? "border-mission-accent/60 bg-mission-accent/10 text-mission-accent"
                        : "border-mission-border text-mission-muted hover:border-mission-glow/40 hover:text-mission-glow"
                    }`}
                  >
                    <Users className="size-4 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide">Letter to Rep</p>
                      <p className="text-[10px] opacity-70 mt-0.5">Personal appeal to your official</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setLetterType("memo")}
                    className={`flex items-center gap-3 p-3 border transition-all text-left ${
                      letterType === "memo"
                        ? "border-mission-accent/60 bg-mission-accent/10 text-mission-accent"
                        : "border-mission-border text-mission-muted hover:border-mission-glow/40 hover:text-mission-glow"
                    }`}
                  >
                    <FileText className="size-4 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide">Policy Memo</p>
                      <p className="text-[10px] opacity-70 mt-0.5">Formal institutional document</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Optional fields */}
              <div className="space-y-3">
                <label className="text-[10px] text-mission-muted uppercase tracking-widest">
                  Your Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-mission-surface/40 border border-mission-border px-3 py-2 text-[12px] text-mission-stat placeholder:text-mission-muted focus:outline-none focus:border-mission-glow/50 transition-colors font-mono"
                />
                <input
                  type="text"
                  placeholder="Your city / state / country"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="w-full bg-mission-surface/40 border border-mission-border px-3 py-2 text-[12px] text-mission-stat placeholder:text-mission-muted focus:outline-none focus:border-mission-glow/50 transition-colors font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {draft.isPending ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="size-6 text-mission-glow animate-spin" />
                  <p className="text-[11px] text-mission-muted font-mono animate-pulse">
                    Drafting your {letterType === "memo" ? "policy memo" : "letter"}...
                  </p>
                </div>
              ) : draft.data ? (
                <>
                  {/* Subject preview */}
                  <div className="border border-mission-border/50 bg-mission-surface/20 px-4 py-2">
                    <span className="text-[10px] text-mission-muted uppercase tracking-widest">Subject: </span>
                    <span className="text-[11px] text-mission-stat font-mono">{draft.data.subject}</span>
                  </div>

                  {/* Letter body */}
                  <div className="border border-mission-border bg-mission-surface/20 p-4 max-h-[40vh] overflow-y-auto">
                    <pre className="text-[11px] text-mission-stat font-mono leading-relaxed whitespace-pre-wrap">
                      {draft.data.letter}
                    </pre>
                  </div>
                </>
              ) : draft.isError ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <p className="text-[12px] text-red-400 font-mono">Failed to generate letter.</p>
                  <button
                    onClick={() => setStep("form")}
                    className="text-[11px] text-mission-muted hover:text-mission-glow underline"
                  >
                    Try again
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-mission-border px-6 py-4">
          {step === "form" ? (
            <button
              onClick={handleGenerate}
              disabled={draft.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-mission-accent/20 border border-mission-accent/50 text-mission-accent text-[11px] uppercase tracking-wider hover:bg-mission-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {draft.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="size-3.5" />
                  Generate {letterType === "memo" ? "Policy Memo" : "Letter"}
                </>
              )}
            </button>
          ) : draft.data ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-mission-border text-mission-muted text-[11px] uppercase tracking-wider hover:border-mission-glow/40 hover:text-mission-glow transition-colors"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied!" : "Copy Letter"}
                </button>
                <button
                  onClick={handleMailTo}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-mission-accent/20 border border-mission-accent/50 text-mission-accent text-[11px] uppercase tracking-wider hover:bg-mission-accent/30 transition-colors"
                >
                  <Mail className="size-3.5" />
                  Open in Email Client
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-mission-muted">
                <ExternalLink className="size-3 shrink-0" />
                <span>
                  Find your representative at{" "}
                  <a
                    href="https://www.congress.gov/members/find-your-member"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mission-glow hover:underline"
                  >
                    congress.gov
                  </a>{" "}
                  or contact your local city council
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
