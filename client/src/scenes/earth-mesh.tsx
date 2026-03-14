import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

const EARTH_DAY_URL =
  "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
const EARTH_NIGHT_URL =
  "//unpkg.com/three-globe/example/img/earth-night.jpg"
const EARTH_BUMP_URL =
  "//unpkg.com/three-globe/example/img/earth-topology.png"

export function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null)

  const [dayMap, nightMap, bumpMap] = useTexture([
    EARTH_DAY_URL,
    EARTH_NIGHT_URL,
    EARTH_BUMP_URL,
  ])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.04
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        map={nightMap}
        bumpMap={bumpMap}
        bumpScale={0.03}
        emissiveMap={dayMap}
        emissive={new THREE.Color(0.15, 0.12, 0.1)}
        emissiveIntensity={0.4}
        metalness={0.1}
        roughness={0.7}
      />
    </mesh>
  )
}
