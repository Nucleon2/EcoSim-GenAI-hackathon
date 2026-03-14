/**
 * Static geographic data and scaling utilities for the 3D globe overlays.
 *
 * Two visual layers react to simulation results:
 *   1. Temperature heatmap  -- driven by `temperature_rise`
 *   2. Emission hotspot rings -- driven by `co2_emissions`
 *   + atmosphere color shift  -- driven by `risk_score`
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeatmapPoint {
  lat: number
  lng: number
  weight: number
}

export interface RingDatum {
  lat: number
  lng: number
  maxRadius: number
  propagationSpeed: number
  repeatPeriod: number
  color: (t: number) => string
}

// ---------------------------------------------------------------------------
// Emission hotspot cities (rings layer)
// ---------------------------------------------------------------------------

export const HOTSPOT_CITIES: { name: string; lat: number; lng: number }[] = [
  { name: "Beijing", lat: 39.9, lng: 116.4 },
  { name: "Shanghai", lat: 31.2, lng: 121.5 },
  { name: "Delhi", lat: 28.6, lng: 77.2 },
  { name: "Houston", lat: 29.8, lng: -95.4 },
  { name: "Los Angeles", lat: 34.1, lng: -118.2 },
  { name: "Moscow", lat: 55.8, lng: 37.6 },
  { name: "Tokyo", lat: 35.7, lng: 139.7 },
  { name: "Sao Paulo", lat: -23.6, lng: -46.6 },
  { name: "Ruhr", lat: 51.5, lng: 7.2 },
  { name: "Jakarta", lat: -6.2, lng: 106.8 },
]

// ---------------------------------------------------------------------------
// Heatmap base points -- spread across continents, weighted toward
// known high-temperature-anomaly / industrial regions.
// ---------------------------------------------------------------------------

export const HEATMAP_BASE_POINTS: { lat: number; lng: number; baseWeight: number }[] = [
  // East Asia (heavy industrial) -- highest emitters
  { lat: 35, lng: 110, baseWeight: 1.0 },
  { lat: 30, lng: 120, baseWeight: 0.85 },
  { lat: 40, lng: 116, baseWeight: 0.9 },
  { lat: 25, lng: 113, baseWeight: 0.5 },
  { lat: 38, lng: 125, baseWeight: 0.35 },
  // South Asia
  { lat: 28, lng: 77, baseWeight: 0.7 },
  { lat: 19, lng: 73, baseWeight: 0.45 },
  { lat: 23, lng: 88, baseWeight: 0.35 },
  { lat: 13, lng: 80, baseWeight: 0.2 },
  // Middle East
  { lat: 25, lng: 55, baseWeight: 0.5 },
  { lat: 24, lng: 47, baseWeight: 0.4 },
  { lat: 33, lng: 44, baseWeight: 0.2 },
  // Europe
  { lat: 51, lng: 7, baseWeight: 0.3 },
  { lat: 52, lng: 13, baseWeight: 0.25 },
  { lat: 48, lng: 2, baseWeight: 0.2 },
  { lat: 51, lng: 0, baseWeight: 0.2 },
  { lat: 45, lng: 9, baseWeight: 0.15 },
  { lat: 40, lng: -4, baseWeight: 0.1 },
  { lat: 60, lng: 30, baseWeight: 0.1 },
  // North America
  { lat: 30, lng: -95, baseWeight: 0.65 },
  { lat: 34, lng: -118, baseWeight: 0.4 },
  { lat: 42, lng: -83, baseWeight: 0.25 },
  { lat: 40, lng: -74, baseWeight: 0.2 },
  { lat: 33, lng: -97, baseWeight: 0.2 },
  { lat: 51, lng: -114, baseWeight: 0.15 },
  { lat: 45, lng: -93, baseWeight: 0.1 },
  // Russia / Central Asia
  { lat: 56, lng: 38, baseWeight: 0.3 },
  { lat: 55, lng: 73, baseWeight: 0.2 },
  { lat: 54, lng: 83, baseWeight: 0.15 },
  // Southeast Asia
  { lat: -6, lng: 107, baseWeight: 0.3 },
  { lat: 14, lng: 101, baseWeight: 0.15 },
  { lat: 1, lng: 104, baseWeight: 0.1 },
  // Africa
  { lat: 6, lng: 3, baseWeight: 0.2 },
  { lat: -26, lng: 28, baseWeight: 0.15 },
  { lat: 30, lng: 31, baseWeight: 0.2 },
  { lat: -1, lng: 37, baseWeight: 0.08 },
  { lat: 34, lng: -7, baseWeight: 0.06 },
  // South America
  { lat: -23, lng: -47, baseWeight: 0.25 },
  { lat: -34, lng: -58, baseWeight: 0.1 },
  { lat: 4, lng: -74, baseWeight: 0.08 },
  { lat: -12, lng: -77, baseWeight: 0.06 },
  // Tropical / deforestation zones (Amazon, Congo, Indonesia)
  { lat: -3, lng: -60, baseWeight: 0.2 },
  { lat: -5, lng: -50, baseWeight: 0.15 },
  { lat: 0, lng: 22, baseWeight: 0.1 },
  { lat: -2, lng: 112, baseWeight: 0.2 },
  // Australia
  { lat: -34, lng: 151, baseWeight: 0.08 },
  { lat: -28, lng: 153, baseWeight: 0.06 },
  // Arctic region (amplified warming)
  { lat: 70, lng: 25, baseWeight: 0.15 },
  { lat: 72, lng: 130, baseWeight: 0.1 },
  { lat: 68, lng: -50, baseWeight: 0.08 },
  { lat: 65, lng: -18, baseWeight: 0.06 },
]

// ---------------------------------------------------------------------------
// Constants -- baseline values from the climate engine
// ---------------------------------------------------------------------------

const BASELINE_CO2 = 36.8 // GtCO2/yr (2023 baseline)
const MIN_CO2 = 10.3 // approximate floor with max policies
const TEMP_MIN = 0.5 // clamped floor from engine
const TEMP_MAX = 3.5 // clamped ceiling from engine

// ---------------------------------------------------------------------------
// Color interpolation helpers
// ---------------------------------------------------------------------------

/** Linearly interpolate between two values. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Clamp a value between min and max. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/** Normalize a value into [0,1] given its natural min/max range. */
function normalize(v: number, min: number, max: number): number {
  return clamp((v - min) / (max - min), 0, 1)
}

// ---------------------------------------------------------------------------
// Public scaling functions
// ---------------------------------------------------------------------------

/**
 * Build the heatmap points array, scaling each point's weight by temperature.
 * Returns a single-element array wrapping the points (heatmapsData expects
 * an array of heatmap datasets).
 */
export function buildHeatmapData(temperatureRise: number): HeatmapPoint[][] {
  const t = normalize(temperatureRise, TEMP_MIN, TEMP_MAX)
  // Scale factor: 0.15 at minimum temp, 1.0 at maximum
  const scale = lerp(0.15, 1.0, t)

  const points: HeatmapPoint[] = HEATMAP_BASE_POINTS.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    weight: p.baseWeight * scale,
  }))

  return [points]
}

/**
 * Get heatmap saturation. Higher temperature = more saturated colors.
 */
export function getHeatmapSaturation(temperatureRise: number): number {
  const t = normalize(temperatureRise, TEMP_MIN, TEMP_MAX)
  return lerp(0.6, 1.4, t)
}

/**
 * Build the rings data array from hotspot cities, scaled by CO2 emissions.
 */
export function buildRingsData(co2Emissions: number): RingDatum[] {
  const t = normalize(co2Emissions, MIN_CO2, BASELINE_CO2)
  // t=1 means baseline (bad), t=0 means best case (good)

  return HOTSPOT_CITIES.map((city) => ({
    lat: city.lat,
    lng: city.lng,
    maxRadius: lerp(1, 5, t),
    propagationSpeed: lerp(0.5, 3, t),
    repeatPeriod: lerp(3000, 700, t),
    color: (ringT: number) => {
      // ringT goes from 0 (center) to 1 (edge) as ring expands
      const opacity = clamp(1 - ringT, 0, 0.9)
      if (t > 0.6) {
        // bad -- red
        return `rgba(255, 60, 30, ${opacity.toFixed(2)})`
      }
      if (t > 0.3) {
        // moderate -- amber
        return `rgba(255, 180, 40, ${opacity.toFixed(2)})`
      }
      // good -- teal
      return `rgba(0, 210, 200, ${opacity.toFixed(2)})`
    },
  }))
}

/**
 * Get the dynamic atmosphere color based on risk score (0-100).
 * Low risk  -> teal   rgba(0, 210, 200, 0.15)
 * High risk -> red    rgba(255, 80, 30, 0.2)
 */
export function getAtmosphereColor(riskScore: number): string {
  const t = normalize(riskScore, 0, 100)
  const r = Math.round(lerp(0, 255, t))
  const g = Math.round(lerp(210, 80, t))
  const b = Math.round(lerp(200, 30, t))
  const a = lerp(0.15, 0.22, t)
  return `rgba(${r},${g},${b},${a.toFixed(2)})`
}
