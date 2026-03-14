import * as THREE from "three"

// ---------------------------------------------------------------------------
// Sea-level normalisation
// ---------------------------------------------------------------------------
export const SEA_LEVEL_MIN = 2.5 // meters — baseline
export const SEA_LEVEL_MAX = 8.5 // meters — practical ceiling

export function normaliseSeaLevel(meters: number): number {
  return Math.max(0, Math.min(1, (meters - SEA_LEVEL_MIN) / (SEA_LEVEL_MAX - SEA_LEVEL_MIN)))
}

// ---------------------------------------------------------------------------
// Coastal arc definitions
// ---------------------------------------------------------------------------
interface ArcDef {
  startLat: number; startLng: number
  endLat: number;   endLng: number
  count: number
}

const COASTAL_ARCS: ArcDef[] = [
  // Florida coast
  { startLat: 25.0, startLng: -80.2, endLat: 30.5, endLng: -81.6, count: 30 },
  // Bangladesh coast
  { startLat: 21.5, startLng: 89.0, endLat: 22.8, endLng: 91.5, count: 30 },
  // Netherlands coast
  { startLat: 51.5, startLng: 3.4, endLat: 53.4, endLng: 5.8, count: 20 },
  // Maldives
  { startLat: 1.8, startLng: 73.0, endLat: 4.2, endLng: 73.5, count: 16 },
  // Jakarta coast
  { startLat: -6.0, startLng: 106.7, endLat: -6.3, endLng: 107.0, count: 16 },
]

// Pacific Islands — scattered individual points
const PACIFIC_ISLANDS: { lat: number; lng: number }[] = [
  // Tuvalu
  { lat: -8.5, lng: 179.2 },
  { lat: -8.3, lng: 179.0 },
  { lat: -8.6, lng: 179.4 },
  // Marshall Islands
  { lat: 7.1, lng: 171.2 },
  { lat: 7.3, lng: 171.4 },
  { lat: 7.0, lng: 171.0 },
  // Fiji
  { lat: -17.8, lng: 178.0 },
  { lat: -17.6, lng: 177.8 },
  { lat: -18.0, lng: 178.2 },
  // Kiribati
  { lat: 1.5, lng: 173.0 },
  { lat: 1.3, lng: 172.8 },
  { lat: 1.7, lng: 173.2 },
]

function arcPoints(
  startLat: number, startLng: number,
  endLat: number, endLng: number,
  count: number
): { lat: number; lng: number }[] {
  const pts: { lat: number; lng: number }[] = []
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1)
    pts.push({
      lat: startLat + (endLat - startLat) * t,
      lng: startLng + (endLng - startLng) * t,
    })
  }
  return pts
}

// ---------------------------------------------------------------------------
// GLSL shaders
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  attribute vec3  aPos;
  attribute float aSeed;

  uniform float uTime;
  uniform float uIntensity;

  varying float vAlpha;

  void main() {
    vec4 mvPos = modelViewMatrix * vec4(aPos, 1.0);

    // Subtle breathing pulse
    float pulse = 0.85 + 0.15 * sin(uTime * 0.6 + aSeed * 6.28318);

    // Gentle boost so mid-range values are visible
    float boosted = smoothstep(0.0, 0.85, uIntensity);

    // Alpha — visible but not overwhelming
    vAlpha = boosted * pulse * (0.4 + aSeed * 0.25);

    // Moderate sprite size — enough to overlap into a band, not giant blobs
    float sizeFactor = 0.35 + 0.65 * boosted;
    gl_PointSize = (28.0 + aSeed * 14.0) * sizeFactor;
    gl_Position = projectionMatrix * mvPos;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;

  varying float vAlpha;

  void main() {
    vec2  uv   = gl_PointCoord * 2.0 - 1.0;
    float dist = length(uv);
    if (dist > 1.0) discard;

    // Soft gaussian — overlapping sprites merge into a continuous glow
    float glow  = exp(-dist * dist * 2.2);
    float alpha = vAlpha * glow;
    if (alpha < 0.005) discard;

    gl_FragColor = vec4(uColor, alpha);
  }
`

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SeaLevelGlowSystem {
  points: THREE.Points
  updateTime(t: number): void
  updateIntensity(normalized: number): void
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createSeaLevelGlow(
  _globeRadius: number,
  getCoords: (lat: number, lng: number, alt: number) => { x: number; y: number; z: number }
): SeaLevelGlowSystem {
  // Build all coastal points
  const allPoints: { lat: number; lng: number }[] = []

  for (const arc of COASTAL_ARCS) {
    allPoints.push(...arcPoints(arc.startLat, arc.startLng, arc.endLat, arc.endLng, arc.count))
  }
  allPoints.push(...PACIFIC_ISLANDS)

  const TOTAL = allPoints.length

  const aPosArr  = new Float32Array(TOTAL * 3)
  const aSeedArr = new Float32Array(TOTAL)

  for (let i = 0; i < TOTAL; i++) {
    const { lat, lng } = allPoints[i]
    const { x, y, z } = getCoords(lat, lng, 0.002)
    aPosArr[i * 3]     = x
    aPosArr[i * 3 + 1] = y
    aPosArr[i * 3 + 2] = z
    aSeedArr[i] = Math.random()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("aPos",  new THREE.BufferAttribute(aPosArr, 3))
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(aSeedArr, 1))
  // Dummy position attribute required by Three.js for bounding-sphere calc
  geometry.setAttribute("position", new THREE.BufferAttribute(aPosArr, 3))

  const uniforms = {
    uTime:      { value: 0 },
    uIntensity: { value: 0 },
    uColor:     { value: new THREE.Color(0.1, 0.5, 1.0) }, // ocean warning blue
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  points.name = "sea-level-glow"
  points.renderOrder = 3 // below CO₂ plumes (5), below atmosphere (10)
  points.frustumCulled = false // always render — sprites are large and may exceed bounding sphere

  return {
    points,
    updateTime(t: number) {
      uniforms.uTime.value = t
    },
    updateIntensity(normalized: number) {
      uniforms.uIntensity.value = normalized
    },
  }
}
