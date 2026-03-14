import { useMemo } from "react"
import * as THREE from "three"
import type { SimulationResult } from "@/services/api"
import { clamp, latLngToVector3, outwardQuaternion } from "@/scenes/earth-utils"

const HEAT_ZONES = [
  { lat: 23, lng: 12, weight: 1, size: 0.34 },
  { lat: 28, lng: 78, weight: 0.95, size: 0.32 },
  { lat: -6, lng: -58, weight: 0.82, size: 0.42 },
  { lat: 35, lng: -115, weight: 0.7, size: 0.27 },
  { lat: -24, lng: 133, weight: 0.68, size: 0.28 },
  { lat: 42, lng: 45, weight: 0.75, size: 0.24 },
]

interface HeatLayerProps {
  result?: SimulationResult
}

export function HeatLayer({ result }: HeatLayerProps) {
  const intensity = clamp(
    (((result?.temperature_rise ?? 1.2) - 0.8) / 2.2 + (result?.risk_score ?? 68) / 100) / 1.8,
    0.22,
    1
  )

  const overlays = useMemo(
    () =>
      HEAT_ZONES.map((zone) => {
        const position = latLngToVector3(zone.lat, zone.lng, 1.025)
        const quaternion = outwardQuaternion(position)
        const scale = zone.size * (0.75 + intensity * zone.weight)
        return { ...zone, position, quaternion, scale }
      }),
    [intensity]
  )

  return (
    <group>
      <mesh scale={1.035}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color="#ff6a3d"
          transparent
          opacity={0.05 + intensity * 0.08}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {overlays.map((overlay, index) => (
        <group key={`${overlay.lat}-${overlay.lng}`} position={overlay.position} quaternion={overlay.quaternion}>
          <mesh scale={overlay.scale} renderOrder={index + 1}>
            <circleGeometry args={[1, 40]} />
            <meshBasicMaterial
              color="#ff7033"
              transparent
              opacity={0.07 + overlay.weight * intensity * 0.15}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh scale={overlay.scale * 0.54} renderOrder={index + 20}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial
              color="#ffd36b"
              transparent
              opacity={0.14 + overlay.weight * intensity * 0.2}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
