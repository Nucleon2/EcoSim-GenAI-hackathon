import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface HeatLayerProps {
  /** 0–1 normalized intensity derived from temperature_rise */
  intensity?: number
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
  uniform float uIntensity;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Simplex-style noise for organic feel
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

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    // Optimized: reduced iterations from 4 to 2 for better UI performance
    for (int i = 0; i < 2; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  vec3 heatColor(float t) {
    // blue → cyan → yellow → orange → red
    vec3 c;
    if (t < 0.25) {
      c = mix(vec3(0.1, 0.2, 0.8), vec3(0.0, 0.7, 0.9), t / 0.25);
    } else if (t < 0.5) {
      c = mix(vec3(0.0, 0.7, 0.9), vec3(0.9, 0.85, 0.1), (t - 0.25) / 0.25);
    } else if (t < 0.75) {
      c = mix(vec3(0.9, 0.85, 0.1), vec3(1.0, 0.5, 0.0), (t - 0.5) / 0.25);
    } else {
      c = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.1, 0.05), (t - 0.75) / 0.25);
    }
    return c;
  }

  void main() {
    // Latitude-based heat — equator is hottest, poles coolest
    float latitude = abs(vUv.y - 0.5) * 2.0; // 0 at equator, 1 at poles
    float baseHeat = 1.0 - latitude;

    // Add noise for organic hotspots
    vec2 noiseCoord = vUv * 8.0 + vec2(uTime * 0.02, 0.0);
    float n = fbm(noiseCoord);
    float heat = baseHeat * 0.6 + n * 0.4;
    heat = clamp(heat * uIntensity * 1.4, 0.0, 1.0);

    // Fresnel edge boost
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - dot(viewDir, vNormal);
    fresnel = pow(fresnel, 2.0);

    vec3 color = heatColor(heat);

    // Pulsing glow
    float pulse = 0.8 + 0.2 * sin(uTime * 0.8);
    float alpha = heat * 0.45 * pulse * (1.0 - fresnel * 0.5);

    // Fade out when intensity is very low
    alpha *= smoothstep(0.05, 0.2, uIntensity);

    gl_FragColor = vec4(color, alpha);
  }
`

export function HeatLayer({ intensity = 0.5 }: HeatLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({
      uIntensity: { value: intensity },
      uTime: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uIntensity.value = intensity
  })

  return (
    <mesh ref={meshRef} scale={1.005}>
      <sphereGeometry args={[1, 32, 32]} />
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
