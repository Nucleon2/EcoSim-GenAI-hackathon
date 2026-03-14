import { useState } from "react"
import { LandingPage } from "@/pages/landing"
import { DashboardPage } from "@/pages/dashboard"
import { ComparisonPage } from "@/pages/comparison"
import { SimulationProvider } from "@/context/simulation-context"
import { decodePolicy } from "@/components/share-button"

type Page = "landing" | "dashboard" | "comparison"

function getInitialPage(): Page {
  // Skip landing if a shared policy link was used
  if (window.location.hash && decodePolicy(window.location.hash)) {
    return "dashboard"
  }
  return "landing"
}

export function App() {
  const [page, setPage] = useState<Page>(getInitialPage)

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
