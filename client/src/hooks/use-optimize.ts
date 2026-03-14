import { useMutation } from "@tanstack/react-query"
import { optimizePolicy, type OptimizeRequest, type OptimizeResponse } from "@/services/api"

export function useOptimize() {
  return useMutation<OptimizeResponse, Error, OptimizeRequest>({
    mutationFn: optimizePolicy,
  })
}
