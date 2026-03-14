import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowRight, SlidersHorizontal, Globe2, BarChart3, Target } from "lucide-react"

const STEPS = [
  {
    icon: SlidersHorizontal,
    title: "Adjust Policy Levers",
    description: "Use the sliders on the left to set climate policy parameters like carbon tax rate, renewable adoption, and more.",
  },
  {
    icon: Globe2,
    title: "Watch the Globe React",
    description: "The 3D Earth visualization updates in real time — atmosphere color, emission plumes, and heatmap all respond to your policies.",
  },
  {
    icon: BarChart3,
    title: "Analyze the Impact",
    description: "View temperature, emissions, sea level, and risk metrics. Charts at the bottom show trends and breakdowns.",
  },
  {
    icon: Target,
    title: "Try Goal Mode",
    description: "Switch to Goal Mode to set climate targets and let AI recommend the optimal policy mix to achieve them.",
  },
]

interface OnboardingOverlayProps {
  onDismiss: () => void
}

export function OnboardingOverlay({ onDismiss }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key={step}
          className="relative max-w-sm w-full mx-4 glass-panel border border-[--color-mission-glow]/20 p-6 flex flex-col gap-4"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 text-[--color-mission-muted] hover:text-[--color-mission-text] transition-colors"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-[--color-mission-glow]/10 border border-[--color-mission-glow]/20">
              <Icon className="size-5 text-[--color-mission-glow]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-[--color-mission-muted]">
                Step {step + 1} of {STEPS.length}
              </span>
              <h3 className="text-sm font-semibold text-[--color-mission-text]">
                {current.title}
              </h3>
            </div>
          </div>

          <p className="text-xs text-[--color-mission-muted] leading-relaxed">
            {current.description}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 transition-colors duration-300"
                style={{
                  backgroundColor: i <= step ? "var(--color-mission-glow)" : "var(--color-mission-border)",
                }}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onDismiss}
              className="text-[10px] uppercase tracking-wider px-3 py-1.5 text-[--color-mission-muted] hover:text-[--color-mission-text] transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => (isLast ? onDismiss() : setStep(step + 1))}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-3 py-1.5 border border-[--color-mission-glow]/50 text-[--color-mission-glow] hover:bg-[--color-mission-glow]/10 transition-colors"
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ArrowRight className="size-3" />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const ONBOARDING_KEY = "ecosim-onboarded"

export function useOnboarding() {
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem(ONBOARDING_KEY)
    } catch {
      return true
    }
  })

  const dismiss = () => {
    setShow(false)
    try {
      sessionStorage.setItem(ONBOARDING_KEY, "1")
    } catch {
      // ignore
    }
  }

  return { showOnboarding: show, dismissOnboarding: dismiss }
}
