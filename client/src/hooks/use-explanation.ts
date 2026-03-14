import { useMutation } from "@tanstack/react-query"
import { explainPolicy, type ExplanationRequest, type ExplanationResponse } from "@/services/api"

export function useExplanation() {
  return useMutation<ExplanationResponse, Error, ExplanationRequest>({
    mutationFn: explainPolicy,
  })
}
