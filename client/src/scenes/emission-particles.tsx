import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface EmissionParticlesProps {
  /** CO₂ emissions in Gt — scales particle visibility (0–50 range) */
  co2Emissions?: number
}

// Major industrial emission hotspots: [lat, lon]
const HOTSPOTS: [number, number][] = [
  [35, 115],   // Eastern China
  [31, 121],   // Shanghai
  [39, 116],   // Beijing
  [28, 77],    // Northern India
  [19, 72],    // Mumbai
  [51, 10],    // Central Europe / Germany
  [52, 0],     // UK
  [48, 2],     // France
  [40, -74],   // Eastern US / NYC
  [34, -118],  // Western US / LA
  [41, -87],   // Chicago
  [29, 48],    // Middle East / Kuwait
  [25, 55],    // UAE
  [35, 51],    // Iran
  [55, 37],    // Moscow
  [-23, -46],  // São Paulo
  [37, 127],   // South Korea
  [35, 137],   // Japan
]

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

const PARTICLE_COUNT = 350

export function EmissionParticles({ co2Emissions = 36.8 }: EmissionParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, velocities, lifetimes, basePositions } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const lifetimes = new Float32Array(PARTICLE_COUNT)
    const basePositions = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const hotspot = HOTSPOTS[i % HOTSPOTS.length]
      // Scatter particles around the hotspot with some randomness
      const lat = hotspot[0] + (Math.random() - 0.5) * 12
      const lon = hotspot[1] + (Math.random() - 0.5) * 12
      const radius = 1.01 + Math.random() * 0.02

      const pos = latLonToVec3(lat, lon, radius)
      positions[i * 3] = pos.x
      positions[i * 3 + 1] = pos.y
      positions[i * 3 + 2] = pos.z

      basePositions[i * 3] = pos.x
      basePositions[i * 3 + 1] = pos.y
      basePositions[i * 3 + 2] = pos.z

      // Outward velocity (away from center)
      const dir = pos.clone().normalize()
      const speed = 0.003 + Math.random() * 0.005
      velocities[i * 3] = dir.x * speed
      velocities[i * 3 + 1] = dir.y * speed
      velocities[i * 3 + 2] = dir.z * speed

      lifetimes[i] = Math.random() // stagger start
    }

    return { positions, velocities, lifetimes, basePositions }
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const posArr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      lifetimes[i] += delta * 0.3

      if (lifetimes[i] > 1.0) {
        // Reset particle to base
        lifetimes[i] = 0
        posArr.array[i * 3] = basePositions[i * 3]
        posArr.array[i * 3 + 1] = basePositions[i * 3 + 1]
        posArr.array[i * 3 + 2] = basePositions[i * 3 + 2]
      } else {
        posArr.array[i * 3] += velocities[i * 3]
        posArr.array[i * 3 + 1] += velocities[i * 3 + 1]
        posArr.array[i * 3 + 2] += velocities[i * 3 + 2]
      }
    }

    posArr.needsUpdate = true
  })

  // Scale opacity and size with emissions
  const emissionFactor = Math.min(co2Emissions / 50, 1)

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015 + emissionFactor * 0.01}
        color={new THREE.Color(0.0, 0.85, 0.8)}
        transparent
        opacity={0.35 + emissionFactor * 0.45}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
