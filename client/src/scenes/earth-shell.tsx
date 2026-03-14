import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

const EARTH_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-night.jpg"
const BUMP_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-topology.png"

export function EarthShell() {
  const earthRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const [map, bumpMap] = useTexture([EARTH_TEXTURE, BUMP_TEXTURE])

  const material = useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace
    return {
      color: new THREE.Color("#8fd7ff"),
      emissive: new THREE.Color("#0c5d72"),
      emissiveIntensity: 0.75,
      roughness: 0.92,
      metalness: 0.08,
      bumpScale: 0.03,
    }
  }, [map])

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.08
      earthRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.03
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.03
    }
  })

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial map={map} bumpMap={bumpMap} {...material} />
      </mesh>

      <mesh ref={atmosphereRef} scale={1.07}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#6be8ff" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>

      <mesh scale={1.16}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#00d2c8" transparent opacity={0.035} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}
