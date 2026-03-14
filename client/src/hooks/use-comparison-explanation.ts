import { useMutation } from "@tanstack/react-query"
import { explainComparison, type ComparisonExplanationRequest, type ExplanationResponse } from "@/services/api"

export function useComparisonExplanation() {
  return useMutation<ExplanationResponse, Error, ComparisonExplanationRequest>({
    mutationFn: explainComparison,
  })
}
