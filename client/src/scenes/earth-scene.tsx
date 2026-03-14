import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { AdaptiveDpr, Float, OrbitControls, Preload, Sparkles, Stars } from "@react-three/drei"
import { DeforestationLayer } from "@/scenes/deforestation-layer"
import { EarthShell } from "@/scenes/earth-shell"
import { EmissionLayer } from "@/scenes/emission-layer"
import { HeatLayer } from "@/scenes/heat-layer"
import type { PolicyInput, SimulationResult } from "@/services/api"

function GlobeSpinner() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="size-16 rounded-full border-2 border-[--color-mission-glow]/30 border-t-[--color-mission-glow] animate-spin" />
    </div>
  )
}

interface EarthSceneProps {
  policy: PolicyInput
  result?: SimulationResult
}

export function EarthScene({ policy, result }: EarthSceneProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(0,210,200,0.12),transparent_32%),radial-gradient(circle_at_50%_50%,rgba(8,20,37,0.85),rgba(2,6,16,0.98))]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[min(60vw,60vh)] rounded-full bg-[--color-mission-glow]/5 blur-3xl" />
      </div>

      <div className="absolute inset-0">
        <Suspense fallback={<GlobeSpinner />}>
          <Canvas camera={{ position: [0, 0.18, 3.1], fov: 34 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
            <color attach="background" args={["#020611"]} />
            <fog attach="fog" args={["#020611", 3.5, 8]} />
            <AdaptiveDpr pixelated />
            <ambientLight intensity={0.55} color="#8ddcff" />
            <directionalLight position={[4, 2, 3]} intensity={2.4} color="#bff6ff" />
            <pointLight position={[-3, -2, -2]} intensity={18} distance={9} color="#00d2c8" />
            <Stars radius={12} depth={28} count={2200} factor={2.6} saturation={0} fade speed={0.45} />
            <Sparkles count={70} scale={[5, 5, 5]} size={2.2} speed={0.18} color="#65f5ff" opacity={0.3} />

            <Float speed={1.3} rotationIntensity={0.15} floatIntensity={0.35}>
              <EarthShell />
              <HeatLayer result={result} />
              <EmissionLayer result={result} />
              <DeforestationLayer policy={policy} />
            </Float>

            <OrbitControls
              enablePan={false}
              enableZoom={false}
              autoRotate
              autoRotateSpeed={0.35}
              minPolarAngle={Math.PI / 2.2}
              maxPolarAngle={Math.PI / 1.8}
            />
            <Preload all />
          </Canvas>
        </Suspense>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3">
        <div className="border border-[--color-mission-border] bg-[--color-mission-surface]/60 px-3 py-2 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[--color-mission-muted]">Orbital View</p>
          <p className="mt-1 text-xs text-[--color-mission-stat]">Heat, emissions, and forest pressure</p>
        </div>
        <div className="hidden border border-[--color-mission-border] bg-[--color-mission-surface]/45 px-3 py-2 text-right backdrop-blur-sm md:block">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[--color-mission-muted]">Telemetry</p>
          <p className="mt-1 text-xs text-[--color-mission-glow]">Drag to inspect active climate layers</p>
        </div>
      </div>
    </div>
  )
}
