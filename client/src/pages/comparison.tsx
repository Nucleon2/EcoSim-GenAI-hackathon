import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, GitCompareArrows } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScenarioColumn } from "@/components/scenario-column"
import { ComparisonDiff } from "@/components/comparison-diff"
import { ComparisonAiPanel } from "@/components/comparison-ai-panel"
import { POLICY_DEFAULTS, type PolicyValues } from "@/components/policy-sliders"
import { useComparisonSimulation } from "@/hooks/use-comparison-simulation"
import { useComparisonExplanation } from "@/hooks/use-comparison-explanation"
import type { PolicyInput } from "@/services/api"

const pageVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}

const panelVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
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

interface ComparisonPageProps {
  onNavigate: (page: "dashboard" | "comparison") => void
}

export function ComparisonPage({ onNavigate }: ComparisonPageProps) {
  const [scenarioA, setScenarioA] = useState<PolicyValues>(POLICY_DEFAULTS)
  const [scenarioB, setScenarioB] = useState<PolicyValues>({
    ...POLICY_DEFAULTS,
    carbonTax: 150,
    renewableAdoption: 60,
  })

  const comparison = useComparisonSimulation()
  const comparisonExplanation = useComparisonExplanation()

  useEffect(() => {
    if (comparison.data) {
      comparisonExplanation.mutate({
        policy_a: toApiInput(scenarioA),
        result_a: comparison.data.resultA,
        policy_b: toApiInput(scenarioB),
        result_b: comparison.data.resultB,
      })
    }
  }, [comparison.data])

  const handleCompare = () => {
    comparison.mutate({
      scenarioA: toApiInput(scenarioA),
      scenarioB: toApiInput(scenarioB),
    })
  }

  return (
    <motion.div
      className="h-screen overflow-y-auto bg-[--color-mission-bg] p-2 flex flex-col gap-2"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top bar */}
      <motion.div variants={panelVariants} className="glass-panel px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-1.5 text-[--color-mission-muted] hover:text-[--color-mission-glow] transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span className="text-xs uppercase tracking-wider">Dashboard</span>
          </button>
          <div className="w-px h-4 bg-[--color-mission-border]" />
          <div className="flex items-center gap-2">
            <GitCompareArrows className="size-3.5 text-[--color-mission-glow]" />
            <h1 className="text-xs uppercase tracking-widest text-[--color-mission-muted] font-medium">
              Scenario Comparison
            </h1>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-[--color-mission-glow]/40 text-[--color-mission-glow] hover:bg-[--color-mission-glow]/10 text-xs px-4"
          disabled={comparison.isPending}
          onClick={handleCompare}
        >
          {comparison.isPending ? "Simulating..." : "Compare Scenarios"}
        </Button>
      </motion.div>

      {/* Two-column comparison */}
      <motion.div variants={panelVariants} className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <ScenarioColumn
          label="Scenario A"
          accent="oklch(0.65 0.18 195)"
          policy={scenarioA}
          onPolicyChange={setScenarioA}
          result={comparison.data?.resultA}
          isPending={comparison.isPending}
        />
        <ScenarioColumn
          label="Scenario B"
          accent="oklch(0.80 0.18 85)"
          policy={scenarioB}
          onPolicyChange={setScenarioB}
          result={comparison.data?.resultB}
          isPending={comparison.isPending}
        />
      </motion.div>

      {/* Diff panel */}
      {comparison.data && (
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="visible"
        >
          <ComparisonDiff
            resultA={comparison.data.resultA}
            resultB={comparison.data.resultB}
          />
        </motion.div>
      )}

      {/* AI Comparison panel */}
      <motion.div variants={panelVariants}>
        <ComparisonAiPanel
          explanation={comparisonExplanation.data?.explanation}
          isPending={comparisonExplanation.isPending}
        />
      </motion.div>

      {/* Error */}
      {comparison.isError && (
        <div className="glass-panel p-3 border-red-500/30 text-red-400 text-xs">
          Simulation failed: {comparison.error.message}
        </div>
      )}
    </motion.div>
  )
}
