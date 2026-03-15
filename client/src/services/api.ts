const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8001/api"
export interface PolicyInput {
  carbon_tax: number
  renewable_adoption: number
  deforestation_reduction: number
  methane_reduction: number
  ev_adoption: number
  target_year?: number
}

export interface SimulationResult {
  co2_emissions: number
  temperature_rise: number
  sea_level_rise: number
  risk_score: number
  emissions_breakdown: Record<string, number>
}

export interface ExplanationRequest {
  policy: PolicyInput
  result: SimulationResult
}

export interface ExplanationResponse {
  explanation: string
}

export async function simulatePolicy(
  input: PolicyInput
): Promise<SimulationResult> {
  const response = await fetch(`${API_BASE_URL}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Simulation failed: ${response.status}`)
  }

  return response.json()
}

export interface OptimizeRequest {
  temperature_rise?: number
  co2_emissions?: number
  sea_level_rise?: number
  risk_score?: number
}

export interface OptimizeResponse {
  recommended_policies: PolicyInput
  projected_results: SimulationResult
  explanation: string
}

export async function optimizePolicy(
  request: OptimizeRequest
): Promise<OptimizeResponse> {
  const response = await fetch(`${API_BASE_URL}/optimize-policy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Optimization failed: ${response.status}`)
  }

  return response.json()
}

export interface ComparisonExplanationRequest {
  policy_a: PolicyInput
  result_a: SimulationResult
  policy_b: PolicyInput
  result_b: SimulationResult
}

export async function explainComparison(
  request: ComparisonExplanationRequest
): Promise<ExplanationResponse> {
  const response = await fetch(`${API_BASE_URL}/explain-comparison`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Comparison explanation failed: ${response.status}`)
  }

  return response.json()
}

export async function explainPolicy(
  request: ExplanationRequest
): Promise<ExplanationResponse> {
  const response = await fetch(`${API_BASE_URL}/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Explanation failed: ${response.status}`)
  }

  return response.json()
}

export interface PolicyLetterRequest {
  policy: PolicyInput
  result: SimulationResult
  letter_type: "representative" | "memo"
  user_name: string
  user_location: string
}

export interface PolicyLetterResponse {
  letter: string
  subject: string
}

export async function draftPolicyLetter(
  request: PolicyLetterRequest
): Promise<PolicyLetterResponse> {
  const response = await fetch(`${API_BASE_URL}/draft-letter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Letter drafting failed: ${response.status}`)
  }

  return response.json()
}
