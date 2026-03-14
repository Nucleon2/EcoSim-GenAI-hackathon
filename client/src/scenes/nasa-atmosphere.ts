import * as THREE from "three"

// ---------------------------------------------------------------------------
// GLSL Shaders
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewPos;

  void main() {
    // Negate normal to compensate for BackSide flip — makes vNormal point outward
    vNormal      = normalize(normalMatrix * -normal);
    vWorldNormal = normalize(mat3(modelMatrix) * -normal);
    vViewPos     = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3  uSunDir;
  uniform vec3  uColor;

  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewPos;

  void main() {
    vec3 viewDir = normalize(-vViewPos);

    // Fresnel rim — outward normal means dot = 1 at disk center, 0 at rim
    float rim     = 1.0 - max(0.0, dot(viewDir, vNormal));
    float fresnel = pow(rim, 2.5);

    // Sun factor: day side → 1.0, night side → 0.0
    float sunDot    = dot(normalize(vWorldNormal), normalize(uSunDir));
    float sunFactor = pow(clamp(sunDot * 0.5 + 0.5, 0.0, 1.0), 1.5);

    // Subtle breathing pulse
    float pulse = 0.9 + 0.1 * sin(uTime * 0.4);

    // Bright rim on day side; near-invisible on night side with faint floor
    float alpha = fresnel * (0.7 * sunFactor + 0.05) * pulse;
    alpha = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(uColor, alpha);
  }
`

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Fixed world-space sun direction (right-and-slightly-up) — gives classic NASA look
const SUN_DIR = new THREE.Vector3(1.0, 0.15, 0.0).normalize()

// NASA photo blue — distinct from the teal risk-indicator built into react-globe.gl
const ATMO_COLOR = new THREE.Color(0.15, 0.45, 1.0)

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a Three.js Mesh representing a NASA-style atmospheric glow shell.
 * Inject into the react-globe.gl scene via `globe.scene().add(mesh)`.
 *
 * @param radius - The atmosphere sphere radius. Use `globe.getGlobeRadius() * 1.06`.
 */
export function createAtmosphereMesh(radius: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radius, 48, 48)

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime:   { value: 0 },
      uSunDir: { value: SUN_DIR },
      uColor:  { value: ATMO_COLOR },
    },
    transparent:  true,
    side:         THREE.BackSide,
    depthWrite:   false,
    blending:     THREE.AdditiveBlending,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = "nasa-atmosphere"
  // Render after globe layers to avoid z-fighting
  mesh.renderOrder = 10

  return mesh
}

/**
 * Updates the uTime uniform for animation.
 * Call every frame from a requestAnimationFrame loop.
 */
export function updateAtmosphereTime(mesh: THREE.Mesh, timeSeconds: number): void {
  ;(mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = timeSeconds
}
