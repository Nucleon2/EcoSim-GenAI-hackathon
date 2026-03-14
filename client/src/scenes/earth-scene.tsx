import { Suspense, lazy, useEffect, useRef, useState } from "react"

const Globe = lazy(() => import("react-globe.gl"))

function GlobeSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="size-16 rounded-full border-2 border-[--color-mission-glow]/30 border-t-[--color-mission-glow] animate-spin" />
    </div>
  )
}

export function EarthScene() {
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
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            atmosphereColor="rgba(0, 210, 200, 0.15)"
            atmosphereAltitude={0.18}
            backgroundColor="rgba(0,0,0,0)"
          />
        )}
      </Suspense>
    </div>
  )
}
