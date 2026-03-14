import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { GitCompareArrows } from "lucide-react"
import { TopBar } from "@/components/top-bar"
import { SimulationMetrics } from "@/components/simulation-metrics"
import { PolicyPanel, type PolicyValues } from "@/components/policy-panel"
import { EarthScene } from "@/scenes/earth-scene"
import { AiExplanationPanel } from "@/components/ai-explanation-panel"
import { RiskTrendChart } from "@/components/risk-trend-chart"
import { TemperatureProjectionChart } from "@/components/temperature-projection-chart"
import { EmissionsBreakdown } from "@/components/emissions-breakdown"
import { useSimulation } from "@/hooks/use-simulation"
import { useExplanation } from "@/hooks/use-explanation"
import { useSimulationContext } from "@/context/simulation-context"
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
    target_year: values.targetYear,
  }
}

interface DashboardPageProps {
  onNavigate: (page: "dashboard" | "comparison") => void
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const simulation = useSimulation()
  const explanation = useExplanation()
  const lastPolicyRef = useRef<PolicyInput | null>(null)
  const { dashboardPolicy, setDashboardPolicy, dashboardResult, setDashboardResult } = useSimulationContext()

  // Use persisted result when returning from another page
  const displayResult = simulation.data ?? dashboardResult

  const handleSimulate = (values: PolicyValues) => {
    const input = toApiInput(values)
    lastPolicyRef.current = input
    simulation.mutate(input)
  }

  useEffect(() => {
    if (simulation.data) {
      setDashboardResult(simulation.data)
      if (lastPolicyRef.current) {
        explanation.mutate({
          policy: lastPolicyRef.current,
          result: simulation.data,
        })
      }
    }
  }, [simulation.data])

  return (
    <motion.div
      className="dashboard-layout bg-[--color-mission-bg] p-2 gap-2"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top bar */}
      <motion.div style={{ gridArea: "topbar" }} variants={panelVariants} className="flex gap-2 items-stretch">
        <div className="flex-1">
          <TopBar />
        </div>
        <button
          onClick={() => onNavigate("comparison")}
          className="glass-panel glow-ring flex items-center gap-2 px-4 text-[--color-mission-muted] hover:text-[--color-mission-glow] hover:border-[--color-mission-glow]/30 transition-colors"
        >
          <GitCompareArrows className="size-3.5" />
          <span className="text-xs uppercase tracking-wider">Compare</span>
        </button>
      </motion.div>

      {/* Simulation metrics */}
      <motion.div style={{ gridArea: "metrics" }} variants={panelVariants}>
        <SimulationMetrics result={displayResult} />
      </motion.div>

      {/* Left policy panel */}
      <motion.div style={{ gridArea: "policy" }} variants={panelVariants} className="min-h-0">
        <PolicyPanel
          onSimulate={handleSimulate}
          isPending={simulation.isPending}
          initialPolicy={dashboardPolicy}
          onPolicyChange={setDashboardPolicy}
        />
      </motion.div>

      {/* Center globe */}
      <motion.div
        style={{ gridArea: "center" }}
        variants={panelVariants}
        className="glass-panel glow-ring overflow-hidden min-h-[300px] md:min-h-0"
      >
        <EarthScene result={displayResult} />
      </motion.div>

      {/* Bottom panel row */}
      <motion.div style={{ gridArea: "bottom" }} variants={panelVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:h-[200px] [&>*]:min-h-[180px] sm:[&>*]:min-h-0">
          <RiskTrendChart riskScore={displayResult?.risk_score} />
          <TemperatureProjectionChart temperatureRise={displayResult?.temperature_rise} />
          <EmissionsBreakdown result={displayResult} />
          <AiExplanationPanel
            explanation={explanation.data?.explanation}
            isPending={explanation.isPending}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
