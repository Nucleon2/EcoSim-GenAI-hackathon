import { useState } from "react"
import { LandingPage } from "@/pages/landing"
import { DashboardPage } from "@/pages/dashboard"
import { ComparisonPage } from "@/pages/comparison"
import { SimulationProvider } from "@/context/simulation-context"

type Page = "landing" | "dashboard" | "comparison"

export function App() {
  const [page, setPage] = useState<Page>("landing")

  if (page === "landing") {
    return <LandingPage onEnter={() => setPage("dashboard")} />
  }

  return (
    <SimulationProvider>
      {page === "comparison" ? (
        <ComparisonPage onNavigate={setPage} />
      ) : (
        <DashboardPage onNavigate={setPage} />
      )}
    </SimulationProvider>
  )
}

export default App
