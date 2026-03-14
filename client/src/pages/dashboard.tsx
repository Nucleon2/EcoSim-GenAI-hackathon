import { motion } from "framer-motion"
import { TopBar } from "@/components/top-bar"
import { PolicyPanel } from "@/components/policy-panel"
import { EarthScene } from "@/scenes/earth-scene"
import { DataVizPlaceholder } from "@/components/data-viz-placeholder"
import { AiExplanationPanel } from "@/components/ai-explanation-panel"

const pageVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const panelVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export function DashboardPage() {
  return (
    <motion.div
      className="h-screen overflow-hidden bg-[--color-mission-bg] p-2 gap-2 grid"
      style={{
        gridTemplateAreas: `"topbar topbar" "policy center" "policy bottom"`,
        gridTemplateRows: "auto 1fr auto",
        gridTemplateColumns: "320px 1fr",
      }}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top bar */}
      <motion.div style={{ gridArea: "topbar" }} variants={panelVariants}>
        <TopBar />
      </motion.div>

      {/* Left policy panel */}
      <motion.div style={{ gridArea: "policy" }} variants={panelVariants} className="min-h-0">
        <PolicyPanel />
      </motion.div>

      {/* Center globe */}
      <motion.div
        style={{ gridArea: "center" }}
        variants={panelVariants}
        className="glass-panel glow-ring overflow-hidden min-h-0"
      >
        <EarthScene />
      </motion.div>

      {/* Bottom AI panel */}
      <motion.div style={{ gridArea: "bottom" }} variants={panelVariants}>
        <AiExplanationPanel />
      </motion.div>
    </motion.div>
  )
}
