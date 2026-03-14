import * as THREE from "three"
import { HOTSPOT_CITIES, RISK_ZONES } from "./globe-data"

// ---------------------------------------------------------------------------
// Pulsing ring locations — particles cluster here (same points as the rings)
// ---------------------------------------------------------------------------
const HOTSPOTS: { lat: number; lng: number }[] = [
  ...HOTSPOT_CITIES,
  ...RISK_ZONES,
]

// Tight scatter so particles visually sit on the pulsing ring
const SCATTER_DEG = 2

const PARTICLES_PER_HOTSPOT = 70
const TOTAL_PARTICLES = HOTSPOTS.length * PARTICLES_PER_HOTSPOT

// ---------------------------------------------------------------------------
// Emissions normalisation
// ---------------------------------------------------------------------------
export const CO2_MIN = 10.3  // Gt/yr — minimum achievable (mirrors globe-data.ts MIN_CO2)
export const CO2_MAX = 50.0  // Gt/yr — practical ceiling

export function normaliseCo2(co2Gt: number): number {
  return Math.max(0, Math.min(1, (co2Gt - CO2_MIN) / (CO2_MAX - CO2_MIN)))
}

// ---------------------------------------------------------------------------
// GLSL shaders
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  attribute vec3  aBase;    // surface position in globe world space
  attribute float aSeed;    // random [0,1] — varies speed, size, drift per particle
  attribute float aOffset;  // lifetime stagger offset [0,1]

  uniform float uTime;
  uniform float uEmissions;    // 0.0 (clean air) → 1.0 (max pollution)
  uniform float uGlobeRadius;

  varying float vAlpha;
  varying float vT;

  void main() {
    vec3  outward = normalize(aBase);

    // Vary speed per particle so they don't all cycle together
    float speed = 0.12 + aSeed * 0.12;

    // Looping lifetime [0, 1]
    float t = fract(uTime * speed + aOffset);
    vT = t;

    // Maximum rise height: 8–20% of globe radius above surface
    float maxRise = uGlobeRadius * (0.08 + aSeed * 0.12);

    // Tangent vectors for lateral smoke drift
    vec3 up    = abs(outward.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 tang1 = normalize(cross(outward, up));
    vec3 tang2 = normalize(cross(outward, tang1));

    float drift1 = sin(uTime * 0.7 + aSeed * 6.28318) * 1.8 * t;
    float drift2 = cos(uTime * 0.5 + aSeed * 3.14159) * 1.2 * t;

    vec3 pos = aBase
             + outward * (t * maxRise)
             + tang1   * drift1
             + tang2   * drift2;

    // Bell-curve alpha: invisible at birth/death, bright at mid-life
    float lifeFade = sin(t * 3.14159);
    vAlpha = lifeFade * uEmissions * (0.45 + aSeed * 0.55);

    // Larger at source, shrinks as it rises and disperses
    float size   = (1.0 - t * 0.65) * (2.5 + aSeed * 4.0) * uEmissions;
    gl_PointSize = max(size, 0.5);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorBase;  // orange-amber at source
  uniform vec3 uColorTop;   // pale yellow as particle disperses

  varying float vAlpha;
  varying float vT;

  void main() {
    vec2  uv   = gl_PointCoord * 2.0 - 1.0;
    float dist = length(uv);
    if (dist > 1.0) discard;

    // Gaussian glow: bright core, soft halo — classic light-bloom look
    float glow  = exp(-dist * dist * 2.2);
    vec3  color = mix(uColorBase, uColorTop, vT * 0.75);
    float alpha = vAlpha * glow;
    if (alpha < 0.005) discard;

    gl_FragColor = vec4(color, alpha);
  }
`

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Co2PlumesSystem {
  points: THREE.Points
  updateTime(t: number): void
  updateEmissions(normalizedEmissions: number): void
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a GPU-animated CO₂ plume particle system.
 *
 * @param globeRadius  - Globe radius in world units (from `globe.getGlobeRadius()`).
 * @param getCoords    - Coordinate converter from react-globe.gl (`globe.getCoords`).
 *
 * Inject into scene via `globe.scene().add(system.points)`.
 * Call `updateTime` and `updateEmissions` every frame from a RAF loop.
 */
export function createCo2Plumes(
  globeRadius: number,
  getCoords: (lat: number, lng: number, alt: number) => { x: number; y: number; z: number }
): Co2PlumesSystem {
  const TOTAL = TOTAL_PARTICLES

  const aBaseArr   = new Float32Array(TOTAL * 3)
  const aSeedArr   = new Float32Array(TOTAL)
  const aOffsetArr = new Float32Array(TOTAL)

  let idx = 0
  for (const { lat: baseLat, lng: baseLng } of HOTSPOTS) {
    for (let p = 0; p < PARTICLES_PER_HOTSPOT; p++) {
      // Tight scatter — particles cluster visually on the pulsing ring point
      const lat = baseLat + (Math.random() - 0.5) * SCATTER_DEG * 2
      const lng = baseLng + (Math.random() - 0.5) * SCATTER_DEG * 2

      const { x, y, z } = getCoords(lat, lng, 0)
      aBaseArr[idx * 3]     = x
      aBaseArr[idx * 3 + 1] = y
      aBaseArr[idx * 3 + 2] = z

      aSeedArr[idx]   = Math.random()
      aOffsetArr[idx] = Math.random()

      idx++
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("aBase",   new THREE.BufferAttribute(aBaseArr,   3))
  geometry.setAttribute("aSeed",   new THREE.BufferAttribute(aSeedArr,   1))
  geometry.setAttribute("aOffset", new THREE.BufferAttribute(aOffsetArr, 1))
  // Dummy position attribute required by Three.js for Points bounding-sphere calc
  geometry.setAttribute("position", new THREE.BufferAttribute(aBaseArr, 3))

  const uniforms = {
    uTime:        { value: 0 },
    uEmissions:   { value: 0.7 },  // start at baseline visibility
    uGlobeRadius: { value: globeRadius },
    uColorBase:   { value: new THREE.Color(1.0, 0.45, 0.1) },   // orange-amber
    uColorTop:    { value: new THREE.Color(1.0, 0.82, 0.45) },  // pale yellow
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent:  true,
    depthWrite:   false,
    blending:     THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  points.name = "co2-plumes"
  points.renderOrder = 5  // render after heatmap layers, before atmosphere

  return {
    points,
    updateTime(t: number) {
      uniforms.uTime.value = t
    },
    updateEmissions(normalizedEmissions: number) {
      uniforms.uEmissions.value = normalizedEmissions
    },
  }
}
