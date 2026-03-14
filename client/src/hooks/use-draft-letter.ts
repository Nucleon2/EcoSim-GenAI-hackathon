import { useMutation } from "@tanstack/react-query"
import { draftPolicyLetter, type PolicyLetterRequest } from "@/services/api"

export function useDraftLetter() {
  return useMutation({
    mutationFn: (request: PolicyLetterRequest) => draftPolicyLetter(request),
  })
}
