import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface DeforestationOverlayProps {
  /** 0–100. Higher = more deforestation reduction → less visible overlay */
  deforestationReduction?: number
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uVisibility;  // 0=invisible (reduction=100), 1=fully visible (reduction=0)

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Check if UV point is in a deforestation zone
  // Returns weight 0–1
  float deforestationZone(vec2 uv) {
    float weight = 0.0;

    // Amazon Basin: lat ~ -15 to 5, lon ~ -75 to -45
    // UV mapping: u = (lon + 180) / 360, v = (90 - lat) / 180
    vec2 amazonCenter = vec2((-60.0 + 180.0) / 360.0, (90.0 - (-5.0)) / 180.0);
    float amazonDist = length((uv - amazonCenter) * vec2(1.4, 1.0));
    weight = max(weight, smoothstep(0.12, 0.03, amazonDist));

    // Congo Basin: lat ~ -5 to 5, lon ~ 15 to 30
    vec2 congoCenter = vec2((22.0 + 180.0) / 360.0, (90.0 - 0.0) / 180.0);
    float congoDist = length((uv - congoCenter) * vec2(1.6, 1.2));
    weight = max(weight, smoothstep(0.08, 0.02, congoDist));

    // Southeast Asia: lat ~ -5 to 10, lon ~ 100 to 120
    vec2 seaCenter = vec2((110.0 + 180.0) / 360.0, (90.0 - 2.0) / 180.0);
    float seaDist = length((uv - seaCenter) * vec2(1.4, 1.0));
    weight = max(weight, smoothstep(0.09, 0.02, seaDist));

    // Borneo: lat ~ 0, lon ~ 115
    vec2 borneoCenter = vec2((115.0 + 180.0) / 360.0, (90.0 - 0.0) / 180.0);
    float borneoDist = length((uv - borneoCenter) * vec2(1.5, 1.2));
    weight = max(weight, smoothstep(0.05, 0.01, borneoDist));

    return weight;
  }

  void main() {
    float zone = deforestationZone(vUv);

    // Animate edge flicker
    float n = noise(vUv * 20.0 + vec2(uTime * 0.3, uTime * 0.15));
    float flicker = 0.7 + 0.3 * n;

    // Orange-red warning tint
    vec3 color = mix(vec3(1.0, 0.4, 0.05), vec3(1.0, 0.15, 0.0), n);

    float alpha = zone * uVisibility * flicker * 0.5;

    // Fade edges
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - dot(viewDir, vNormal);
    alpha *= (1.0 - pow(fresnel, 3.0) * 0.5);

    alpha *= smoothstep(0.02, 0.15, uVisibility);

    gl_FragColor = vec4(color, alpha);
  }
`

export function DeforestationOverlay({
  deforestationReduction = 25,
}: DeforestationOverlayProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Visibility: lower reduction → more visible overlay
  const visibility = 1.0 - deforestationReduction / 100

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uVisibility: { value: visibility },
    }),
    []
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uVisibility.value = visibility
  })

  return (
    <mesh ref={meshRef} scale={1.008}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}
