import { useState } from "react"
import { DashboardPage } from "@/pages/dashboard"
import { ComparisonPage } from "@/pages/comparison"
import { SimulationProvider } from "@/context/simulation-context"

type Page = "dashboard" | "comparison"

export function App() {
  const [page, setPage] = useState<Page>("dashboard")

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
