const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

export interface PolicyInput {
  carbon_tax: number
  renewable_adoption: number
  deforestation_reduction: number
  methane_reduction: number
  ev_adoption: number
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
