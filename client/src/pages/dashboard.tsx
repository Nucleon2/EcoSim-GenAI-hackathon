import { useEffect, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { TopBar } from "@/components/top-bar"
import { SimulationMetrics } from "@/components/simulation-metrics"
import { PolicyPanel, type PolicyValues } from "@/components/policy-panel"
import { EarthScene } from "@/scenes/earth-scene"
import { AiExplanationPanel } from "@/components/ai-explanation-panel"
import { RiskTrendChart } from "@/components/risk-trend-chart"
import { TemperatureProjectionChart } from "@/components/temperature-projection-chart"
import { useSimulation } from "@/hooks/use-simulation"
import { useExplanation } from "@/hooks/use-explanation"
import type { PolicyInput } from "@/services/api"

const DEFAULT_SCENE_POLICY: PolicyInput = {
  carbon_tax: 50,
  renewable_adoption: 30,
  deforestation_reduction: 25,
  methane_reduction: 20,
  ev_adoption: 15,
}

const pageVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
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
  const explanation = useExplanation()
  const [scenePolicy, setScenePolicy] = useState<PolicyInput>(DEFAULT_SCENE_POLICY)

  const handleSimulate = (values: PolicyValues) => {
    const input = toApiInput(values)
    setScenePolicy(input)
    simulation.mutate(input)
  }

  useEffect(() => {
    if (simulation.data) {
      explanation.mutate({
        policy: scenePolicy,
        result: simulation.data,
      })
    }
  }, [explanation, scenePolicy, simulation.data])

  return (
    <motion.div
      className="dashboard-grid h-screen overflow-auto bg-[--color-mission-bg] p-2 gap-2"
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
        className="glass-panel glow-ring overflow-hidden min-h-[360px] lg:min-h-0"
      >
        <EarthScene policy={scenePolicy} result={simulation.data} />
      </motion.div>

      {/* Bottom panel row */}
      <motion.div style={{ gridArea: "bottom" }} variants={panelVariants}>
        <div className="grid min-h-[200px] grid-cols-1 gap-2 md:h-[200px] md:grid-cols-3">
          <RiskTrendChart riskScore={simulation.data?.risk_score} />
          <TemperatureProjectionChart temperatureRise={simulation.data?.temperature_rise} />
          <AiExplanationPanel
            explanation={explanation.data?.explanation}
            isPending={explanation.isPending}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
