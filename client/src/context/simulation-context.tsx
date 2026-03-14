import { createContext, useContext, useState, type ReactNode } from "react"
import type { PolicyValues } from "@/components/policy-sliders"
import { POLICY_DEFAULTS } from "@/components/policy-sliders"
import type { SimulationResult } from "@/services/api"

interface SimulationState {
  /** Dashboard policy slider values */
  dashboardPolicy: PolicyValues
  setDashboardPolicy: (v: PolicyValues) => void
  /** Last simulation result from dashboard */
  dashboardResult: SimulationResult | undefined
  setDashboardResult: (r: SimulationResult | undefined) => void
}

const SimulationContext = createContext<SimulationState | null>(null)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [dashboardPolicy, setDashboardPolicy] = useState<PolicyValues>(POLICY_DEFAULTS)
  const [dashboardResult, setDashboardResult] = useState<SimulationResult | undefined>()

  return (
    <SimulationContext.Provider
      value={{ dashboardPolicy, setDashboardPolicy, dashboardResult, setDashboardResult }}
    >
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulationContext() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error("useSimulationContext must be used within SimulationProvider")
  return ctx
}
