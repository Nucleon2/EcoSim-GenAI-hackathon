import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { EarthMesh } from "./earth-mesh"
import { Atmosphere } from "./atmosphere"
import { HeatLayer } from "./heat-layer"
import { EmissionParticles } from "./emission-particles"
import { DeforestationOverlay } from "./deforestation-overlay"
import type { SimulationResult } from "@/services/api"

function GlobeSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="size-16 rounded-full border-2 border-[--color-mission-glow]/30 border-t-[--color-mission-glow] animate-spin" />
    </div>
  )
}

interface EarthSceneProps {
  simulationResult?: SimulationResult
}

/** Normalize temperature_rise (0–5°C) → 0–1 */
function tempToIntensity(temp: number): number {
  return Math.min(Math.max(temp / 5, 0), 1)
}

export function EarthScene({ simulationResult }: EarthSceneProps) {
  const heatIntensity = tempToIntensity(simulationResult?.temperature_rise ?? 1.2)
  const co2 = simulationResult?.co2_emissions ?? 36.8
  const deforestReduction = 25 // default shown — driven by policy input not result

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Outer glow ring behind globe */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[min(60vw,60vh)] rounded-full bg-[--color-mission-glow]/5 blur-3xl" />
      </div>

      <Suspense fallback={<GlobeSpinner />}>
        <Canvas
          camera={{ position: [0, 0, 2.8], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.15} />
          <directionalLight position={[5, 3, 5]} intensity={1.2} color="#fff5e6" />
          <directionalLight position={[-3, -2, -4]} intensity={0.2} color="#4de8e0" />

          {/* Starfield backdrop */}
          <Stars
            radius={80}
            depth={60}
            count={2500}
            factor={3}
            saturation={0.1}
            fade
            speed={0.5}
          />

          {/* Interactive orbit controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={1.8}
            maxDistance={5}
            autoRotate
            autoRotateSpeed={0.3}
            enableDamping
            dampingFactor={0.08}
          />

          {/* Earth and visualization layers */}
          <group>
            <EarthMesh />
            <HeatLayer intensity={heatIntensity} />
            <EmissionParticles co2Emissions={co2} />
            <DeforestationOverlay deforestationReduction={deforestReduction} />
            <Atmosphere />
          </group>
        </Canvas>
      </Suspense>
    </div>
  )
}
