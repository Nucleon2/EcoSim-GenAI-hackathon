import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

// Suppress known third-party initialization warnings we cannot fix from userland:
// - THREE.Clock: deprecated in r183; @react-three/fiber 9.x instantiates it internally
// - Recharts width/height -1: ResponsiveContainer initialises with sentinel -1 before ResizeObserver fires
const _warn = console.warn.bind(console)
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && (
    args[0].includes("THREE.Clock") ||
    args[0].includes("width(-1)") ||
    args[0].includes("height(-1)")
  )) return
  _warn(...args)
}

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
