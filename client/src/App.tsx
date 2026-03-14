import { useState } from "react"
import { DashboardPage } from "@/pages/dashboard"
import { ComparisonPage } from "@/pages/comparison"

type Page = "dashboard" | "comparison"

export function App() {
  const [page, setPage] = useState<Page>("dashboard")

  if (page === "comparison") {
    return <ComparisonPage onNavigate={setPage} />
  }

  return <DashboardPage onNavigate={setPage} />
}

export default App
