import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react"
import type { SimulationResult } from "@/services/api"
import {
  buildHeatmapData,
  buildRiskRingsData,
  buildRiskHtmlElementsData,
  getAtmosphereColor,
  getHeatmapSaturation,
} from "./globe-data"
import type { HTMLLabelDatum } from "./globe-data"

const Globe = lazy(() => import("react-globe.gl"))

// ---------------------------------------------------------------------------
// Baseline defaults shown before the first simulation runs
// ---------------------------------------------------------------------------
const BASELINE_TEMP = 2.0
const BASELINE_RISK = 55

function GlobeSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="size-16 rounded-full border-2 border-[--color-mission-glow]/30 border-t-[--color-mission-glow] animate-spin" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EarthSceneProps {
  result?: SimulationResult
  compact?: boolean
}

export function EarthScene({ result, compact }: EarthSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      setDims({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // ---- Derive values from simulation result (or use baselines) ----
  const temp = result?.temperature_rise ?? BASELINE_TEMP
  const risk = result?.risk_score ?? BASELINE_RISK

  // ---- Heatmap layer data ----
  const heatmapData = useMemo(() => buildHeatmapData(result), [result])
  const heatmapSaturation = useMemo(() => getHeatmapSaturation(temp), [temp])

  // ---- Rings layer data (Risks only) ----
  const ringsData = useMemo(() => {
    return buildRiskRingsData(result)
  }, [result])

  // ---- HTML Labels layer data ----
  const htmlLabelsData = useMemo(() => buildRiskHtmlElementsData(result), [result])

  // ---- Dynamic atmosphere ----
  const atmosphereColor = useMemo(() => getAtmosphereColor(risk), [risk])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Outer glow ring behind globe */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[min(60vw,60vh)] rounded-full bg-[--color-mission-glow]/5 blur-3xl" />
      </div>

      <Suspense fallback={<GlobeSpinner />}>
        {dims.width > 0 && (
          <Globe
            width={dims.width}
            height={dims.height}
            // -- Performance optimizations --
            rendererConfig={{ antialias: false, powerPreference: "high-performance" }}
            globeImageUrl="https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-night.jpg"
            bumpImageUrl="https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-topology.png"
            backgroundImageUrl={compact ? undefined : "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/night-sky.png"}
            // -- Dynamic atmosphere --
            atmosphereColor={atmosphereColor}
            atmosphereAltitude={compact ? 0.12 : 0.18}
            // -- Heatmap layer --
            heatmapsData={heatmapData}
            heatmapPointLat="lat"
            heatmapPointLng="lng"
            heatmapPointWeight="weight"
            heatmapBandwidth={0.8}
            heatmapColorSaturation={heatmapSaturation}
            heatmapsTransitionDuration={compact ? 800 : 1200}
            enablePointerInteraction={false}
            // -- Rings layer --
            ringsData={ringsData}
            ringLat="lat"
            ringLng="lng"
            ringColor="color"
            ringMaxRadius="maxRadius"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"
            ringAltitude={0.02} // Ensure rings are above the heatmap
            // -- Labels layer (HTML Elements without emojis) --
            htmlElementsData={htmlLabelsData}
            htmlElement={(d: object) => {
              const el = document.createElement("div")
              const datum = d as HTMLLabelDatum
              el.innerHTML = `
                <div class="flex flex-col items-center justify-center transition-all duration-300 ${datum.visibilityClass}" style="pointer-events: none; width: 120px; transform: translate(-50%, -50%);">
                  <span class="text-xs font-bold text-white uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10 shadow-lg">
                    ${datum.label}
                  </span>
                </div>
              `
              return el
            }}
          />
        )}
      </Suspense>
    </div>
  )
}
