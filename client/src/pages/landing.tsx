import { motion } from "framer-motion"
import { ArrowRight, Globe2 } from "lucide-react"
import { EarthScene } from "@/scenes/earth-scene"

interface LandingPageProps {
  onEnter: () => void
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-mission-bg">
      {/* Full-screen globe background */}
      <div className="absolute inset-0">
        <EarthScene />
      </div>

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-mission-bg via-mission-bg/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-mission-bg/60 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-16 pb-16 md:pb-24 max-w-2xl">
        <motion.div
          className="flex flex-col gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
          }}
        >
          <motion.div
            className="flex items-center gap-2"
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
            }}
          >
            <Globe2 className="size-5 text-mission-glow" />
            <span className="text-xs uppercase tracking-[0.3em] text-mission-glow">
              EcoSim
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-tight text-mission-text"
            variants={{
              hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7 } },
            }}
          >
            AI Climate Policy
            <br />
            <span className="text-mission-glow">Copilot</span>
          </motion.h1>

          <motion.p
            className="text-sm md:text-base text-mission-muted leading-relaxed max-w-md"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            Simulate the impact of climate policies on the planet. Adjust renewable adoption,
            carbon taxes, and deforestation targets — then watch the world respond in real time.
          </motion.p>

          <motion.div
            className="flex items-center gap-4 mt-2"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            <button
              onClick={onEnter}
              className="group flex items-center gap-3 px-6 py-3 border border-mission-glow/50 text-mission-glow hover:bg-mission-glow/10 transition-all duration-300 text-sm uppercase tracking-wider"
            >
              Launch Simulator
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <motion.div
            className="flex items-center gap-4 mt-4 text-[9px] uppercase tracking-wider text-mission-muted/60"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.6 } },
            }}
          >
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
