import { Sparkles, Line } from "@react-three/drei"
import { useMemo } from "react"
import type { SimulationResult } from "@/services/api"
import { clamp, latLngToVector3 } from "@/scenes/earth-utils"

const EMISSION_ROUTES = [
  { from: { lat: 31, lng: 121 }, to: { lat: 36, lng: -95 } },
  { from: { lat: 28, lng: 77 }, to: { lat: 50, lng: 8 } },
  { from: { lat: -23, lng: -46 }, to: { lat: 6, lng: 3 } },
  { from: { lat: 35, lng: 139 }, to: { lat: 1, lng: 104 } },
  { from: { lat: 51, lng: 0 }, to: { lat: 25, lng: 55 } },
]

interface EmissionLayerProps {
  result?: SimulationResult
}

export function EmissionLayer({ result }: EmissionLayerProps) {
  const intensity = clamp((result?.co2_emissions ?? 36.8) / 45, 0.3, 1)

  const routes = useMemo(
    () =>
      EMISSION_ROUTES.map((route) => {
        const start = latLngToVector3(route.from.lat, route.from.lng, 1.04)
        const end = latLngToVector3(route.to.lat, route.to.lng, 1.04)
        const mid = start
          .clone()
          .add(end)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(1.35 + intensity * 0.2)

        return {
          points: [start, mid, end],
          hubs: [start, end],
        }
      }),
    [intensity]
  )

  return (
    <group>
      {routes.map((route, index) => (
        <group key={`route-${index}`}>
          <Line
            points={route.points}
            color="#4cf3ff"
            transparent
            opacity={0.18 + intensity * 0.22}
            lineWidth={1.1 + intensity * 0.6}
          />
          {route.hubs.map((hub, hubIndex) => (
            <mesh key={`hub-${index}-${hubIndex}`} position={hub} scale={0.012 + intensity * 0.016}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshBasicMaterial color="#8fffff" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      <Sparkles
        count={Math.round(45 + intensity * 55)}
        scale={[2.7, 1.6, 2.7]}
        size={3 + intensity * 2}
        speed={0.18 + intensity * 0.25}
        opacity={0.28 + intensity * 0.15}
        color="#57efff"
        noise={[1.2, 0.35, 1.2]}
      />
    </group>
  )
}
