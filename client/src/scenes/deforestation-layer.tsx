import { useMemo } from "react"
import * as THREE from "three"
import type { PolicyInput } from "@/services/api"
import { clamp, latLngToVector3, outwardQuaternion } from "@/scenes/earth-utils"

const FOREST_PATCHES = [
  { lat: -5, lng: -62, size: 0.3 },
  { lat: -9, lng: -54, size: 0.24 },
  { lat: 0, lng: 22, size: 0.22 },
  { lat: 2, lng: 27, size: 0.18 },
  { lat: -2, lng: 116, size: 0.19 },
  { lat: 8, lng: 102, size: 0.14 },
]

interface DeforestationLayerProps {
  policy: PolicyInput
}

export function DeforestationLayer({ policy }: DeforestationLayerProps) {
  const pressure = clamp(1 - policy.deforestation_reduction / 100, 0.1, 1)
  const healthyRecovery = clamp(policy.deforestation_reduction / 100, 0, 1)

  const overlays = useMemo(
    () =>
      FOREST_PATCHES.map((patch) => {
        const position = latLngToVector3(patch.lat, patch.lng, 1.02)
        return {
          ...patch,
          position,
          quaternion: outwardQuaternion(position),
        }
      }),
    []
  )

  const patchColor = new THREE.Color().lerpColors(
    new THREE.Color("#ffd166"),
    new THREE.Color("#59d98e"),
    healthyRecovery
  )

  return (
    <group>
      {overlays.map((overlay, index) => (
        <group
          key={`${overlay.lat}-${overlay.lng}`}
          position={overlay.position}
          quaternion={overlay.quaternion}
          renderOrder={index + 40}
        >
          <mesh scale={overlay.size * (0.9 + pressure * 0.45)}>
            <circleGeometry args={[1, 40]} />
            <meshBasicMaterial
              color={patchColor}
              transparent
              opacity={0.08 + pressure * 0.16}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh scale={overlay.size * 0.42}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial
              color={healthyRecovery > 0.5 ? "#91ffb0" : "#ffb347"}
              transparent
              opacity={0.1 + pressure * 0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
