import { useMutation } from "@tanstack/react-query"
import { simulatePolicy, type PolicyInput, type SimulationResult } from "@/services/api"

interface ComparisonInput {
  scenarioA: PolicyInput
  scenarioB: PolicyInput
}

interface ComparisonResult {
  resultA: SimulationResult
  resultB: SimulationResult
}

export function useComparisonSimulation() {
  return useMutation<ComparisonResult, Error, ComparisonInput>({
    mutationFn: async ({ scenarioA, scenarioB }) => {
      const [resultA, resultB] = await Promise.all([
        simulatePolicy(scenarioA),
        simulatePolicy(scenarioB),
      ])
      return { resultA, resultB }
    },
  })
}
