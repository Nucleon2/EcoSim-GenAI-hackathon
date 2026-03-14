import { useMutation } from "@tanstack/react-query"
import { simulatePolicy, type PolicyInput, type SimulationResult } from "@/services/api"

export function useSimulation() {
  return useMutation<SimulationResult, Error, PolicyInput>({
    mutationFn: simulatePolicy,
  })
}
