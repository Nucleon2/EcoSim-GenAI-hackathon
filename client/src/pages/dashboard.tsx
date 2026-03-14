import { motion } from "framer-motion"
import { TopBar } from "@/components/top-bar"
import { SimulationMetrics } from "@/components/simulation-metrics"
import { PolicyPanel, type PolicyValues } from "@/components/policy-panel"
import { EarthScene } from "@/scenes/earth-scene"
import { AiExplanationPanel } from "@/components/ai-explanation-panel"
import { RiskTrendChart } from "@/components/risk-trend-chart"
import { TemperatureProjectionChart } from "@/components/temperature-projection-chart"
import { useSimulation } from "@/hooks/use-simulation"
import type { PolicyInput } from "@/services/api"

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

function toApiInput(values: PolicyValues): PolicyInput {
  return {
    carbon_tax: values.carbonTax,
    renewable_adoption: values.renewableAdoption,
    deforestation_reduction: values.deforestationReduction,
    methane_reduction: values.methaneReduction,
    ev_adoption: values.evAdoption,
  }
}

export function DashboardPage() {
  const simulation = useSimulation()

  const handleSimulate = (values: PolicyValues) => {
    simulation.mutate(toApiInput(values))
  }

  return (
    <motion.div
      className="h-screen overflow-hidden bg-[--color-mission-bg] p-2 gap-2 grid"
      style={{
        gridTemplateAreas: `
          "topbar topbar"
          "metrics metrics"
          "policy center"
          "policy bottom"
        `,
        gridTemplateRows: "auto auto 1fr auto",
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

      {/* Simulation metrics */}
      <motion.div style={{ gridArea: "metrics" }} variants={panelVariants}>
        <SimulationMetrics result={simulation.data} />
      </motion.div>

      {/* Left policy panel */}
      <motion.div style={{ gridArea: "policy" }} variants={panelVariants} className="min-h-0">
        <PolicyPanel onSimulate={handleSimulate} isPending={simulation.isPending} />
      </motion.div>

      {/* Center globe */}
      <motion.div
        style={{ gridArea: "center" }}
        variants={panelVariants}
        className="glass-panel glow-ring overflow-hidden min-h-0"
      >
        <EarthScene />
      </motion.div>

      {/* Bottom panel row */}
      <motion.div style={{ gridArea: "bottom" }} variants={panelVariants}>
        <div className="grid grid-cols-3 gap-2 h-[200px]">
          <RiskTrendChart riskScore={simulation.data?.risk_score} />
          <TemperatureProjectionChart temperatureRise={simulation.data?.temperature_rise} />
          <AiExplanationPanel />
        </div>
      </motion.div>
    </motion.div>
  )
}
