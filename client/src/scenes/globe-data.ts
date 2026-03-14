/**
 * Static geographic data and scaling utilities for the 3D globe overlays.
 *
 * Three visual layers react to simulation results:
 *   1. Temperature heatmap        -- driven by `temperature_rise`, `emissions_breakdown`
 *   2. Emission hotspot rings     -- driven by `co2_emissions`
 *   3. Risk‑zone rings and labels -- driven by `temperature_rise`, `sea_level_rise`
 *   + atmosphere color shift      -- driven by `risk_score`
 */

import type { SimulationResult } from "@/services/api"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeatmapPoint {
  lat: number
  lng: number
  weight: number
}

export interface HeatmapBasePoint {
  lat: number
  lng: number
  baseWeight: number
  region: "industrial" | "deforestation" | "arctic"
}

export interface RingDatum {
  lat: number
  lng: number
  maxRadius: number
  propagationSpeed: number
  repeatPeriod: number
  color: (t: number) => string
}

export interface RiskZone {
  name: string
  lat: number
  lng: number
  type: "wildfire" | "flood" | "drought" | "heatwave"
}

export interface LabelDatum {
  lat: number
  lng: number
  text: string
  color: string
  size: number
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
// Disaster Risk Zones (scaled by temperature and sea level rise)
// ---------------------------------------------------------------------------

export const RISK_ZONES: RiskZone[] = [
  // Wildfires
  { name: "California", lat: 38.0, lng: -120.0, type: "wildfire" },
  { name: "Southern Europe", lat: 41.0, lng: 15.0, type: "wildfire" },
  { name: "Australia", lat: -33.0, lng: 147.0, type: "wildfire" },
  // Floods
  { name: "Bangladesh", lat: 23.7, lng: 90.4, type: "flood" },
  { name: "Florida", lat: 27.8, lng: -81.7, type: "flood" },
  { name: "Jakarta", lat: -6.2, lng: 106.8, type: "flood" },
  // Drought
  { name: "Horn of Africa", lat: 5.0, lng: 45.0, type: "drought" },
  { name: "Southwest US", lat: 34.0, lng: -110.0, type: "drought" },
  // Heat Waves
  { name: "India", lat: 21.0, lng: 79.0, type: "heatwave" },
  { name: "Middle East", lat: 23.0, lng: 45.0, type: "heatwave" }
]

// ---------------------------------------------------------------------------
// Heatmap base points -- spread across continents, weighted toward
// known high-temperature-anomaly / industrial regions.
// ---------------------------------------------------------------------------

export const HEATMAP_BASE_POINTS: HeatmapBasePoint[] = [
  // East Asia (heavy industrial) -- highest emitters
  { lat: 35, lng: 110, baseWeight: 1.0,  region: "industrial" },
  { lat: 30, lng: 120, baseWeight: 0.85, region: "industrial" },
  { lat: 40, lng: 116, baseWeight: 0.9,  region: "industrial" },
  { lat: 25, lng: 113, baseWeight: 0.5,  region: "industrial" },
  { lat: 38, lng: 125, baseWeight: 0.35, region: "industrial" },
  // South Asia
  { lat: 28, lng: 77,  baseWeight: 0.7,  region: "industrial" },
  { lat: 19, lng: 73,  baseWeight: 0.45, region: "industrial" },
  { lat: 23, lng: 88,  baseWeight: 0.35, region: "industrial" },
  { lat: 13, lng: 80,  baseWeight: 0.2,  region: "industrial" },
  // Middle East
  { lat: 25, lng: 55,  baseWeight: 0.5,  region: "industrial" },
  { lat: 24, lng: 47,  baseWeight: 0.4,  region: "industrial" },
  { lat: 33, lng: 44,  baseWeight: 0.2,  region: "industrial" },
  // Europe
  { lat: 51, lng: 7,   baseWeight: 0.3,  region: "industrial" },
  { lat: 52, lng: 13,  baseWeight: 0.25, region: "industrial" },
  { lat: 48, lng: 2,   baseWeight: 0.2,  region: "industrial" },
  { lat: 51, lng: 0,   baseWeight: 0.2,  region: "industrial" },
  { lat: 45, lng: 9,   baseWeight: 0.15, region: "industrial" },
  { lat: 40, lng: -4,  baseWeight: 0.1,  region: "industrial" },
  { lat: 60, lng: 30,  baseWeight: 0.1,  region: "industrial" },
  // North America
  { lat: 30, lng: -95, baseWeight: 0.65, region: "industrial" },
  { lat: 34, lng: -118,baseWeight: 0.4,  region: "industrial" },
  { lat: 42, lng: -83, baseWeight: 0.25, region: "industrial" },
  { lat: 40, lng: -74, baseWeight: 0.2,  region: "industrial" },
  { lat: 33, lng: -97, baseWeight: 0.2,  region: "industrial" },
  { lat: 51, lng: -114,baseWeight: 0.15, region: "industrial" },
  { lat: 45, lng: -93, baseWeight: 0.1,  region: "industrial" },
  // Russia / Central Asia
  { lat: 56, lng: 38,  baseWeight: 0.3,  region: "industrial" },
  { lat: 55, lng: 73,  baseWeight: 0.2,  region: "industrial" },
  { lat: 54, lng: 83,  baseWeight: 0.15, region: "industrial" },
  // Southeast Asia
  { lat: -6, lng: 107, baseWeight: 0.3,  region: "industrial" },
  { lat: 14, lng: 101, baseWeight: 0.15, region: "industrial" },
  { lat: 1,  lng: 104, baseWeight: 0.1,  region: "industrial" },
  // Africa
  { lat: 6,  lng: 3,   baseWeight: 0.2,  region: "industrial" },
  { lat: -26,lng: 28,  baseWeight: 0.15, region: "industrial" },
  { lat: 30, lng: 31,  baseWeight: 0.2,  region: "industrial" },
  { lat: -1, lng: 37,  baseWeight: 0.08, region: "industrial" },
  { lat: 34, lng: -7,  baseWeight: 0.06, region: "industrial" },
  // South America (urban/industrial)
  { lat: -23,lng: -47, baseWeight: 0.25, region: "industrial" },
  { lat: -34,lng: -58, baseWeight: 0.1,  region: "industrial" },
  { lat: 4,  lng: -74, baseWeight: 0.08, region: "industrial" },
  { lat: -12,lng: -77, baseWeight: 0.06, region: "industrial" },
  // Tropical / deforestation zones (Amazon, Congo, Indonesia)
  { lat: -3, lng: -60, baseWeight: 0.2,  region: "deforestation" },
  { lat: -5, lng: -50, baseWeight: 0.15, region: "deforestation" },
  { lat: 0,  lng: 22,  baseWeight: 0.1,  region: "deforestation" },
  { lat: -2, lng: 112, baseWeight: 0.2,  region: "deforestation" },
  // Australia
  { lat: -34,lng: 151, baseWeight: 0.08, region: "industrial" },
  { lat: -28,lng: 153, baseWeight: 0.06, region: "industrial" },
  // Arctic region (amplified warming)
  { lat: 70, lng: 25,  baseWeight: 0.15, region: "arctic" },
  { lat: 72, lng: 130, baseWeight: 0.1,  region: "arctic" },
  { lat: 68, lng: -50, baseWeight: 0.08, region: "arctic" },
  { lat: 65, lng: -18, baseWeight: 0.06, region: "arctic" },
]

// ---------------------------------------------------------------------------
// Constants -- baseline values from the climate engine
// ---------------------------------------------------------------------------

const BASELINE_CO2 = 36.8 // GtCO2/yr (2023 baseline)
const MIN_CO2 = 10.3 // approximate floor with max policies
const BASELINE_TEMP = 2.0 // shown before any simulation runs
const TEMP_MIN = 1.0 // actual backend minimum (full policies applied)
const TEMP_MAX = 2.5 // actual backend maximum (no policies applied)

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
 * Build the heatmap points array from a simulation result.
 * - Global scale spans 0.0 (best policy) → 1.0 (no policy) using the actual backend range.
 * - Industrial regions additionally dim with renewable adoption.
 * - Deforestation regions additionally dim with deforestation reduction.
 * - Arctic regions amplify at 1.4× the global temperature factor.
 */
export function buildHeatmapData(result: SimulationResult | undefined): HeatmapPoint[][] {
  const temperatureRise = result?.temperature_rise ?? BASELINE_TEMP
  const breakdown = result?.emissions_breakdown

  const t = normalize(temperatureRise, TEMP_MIN, TEMP_MAX)
  const globalScale = lerp(0.0, 1.0, t)

  // Per-policy reduction fractions in [0, 1]
  // renewable_adoption max sector weight = 0.25 (from engine.py)
  const renewableReduction = breakdown
    ? clamp(breakdown["renewable_adoption"] / 0.25, 0, 1)
    : 0
  // deforestation_reduction max sector weight = 0.10 (from engine.py)
  const deforestationReduction = breakdown
    ? clamp(breakdown["deforestation_reduction"] / 0.10, 0, 1)
    : 0

  const points: HeatmapPoint[] = HEATMAP_BASE_POINTS.map((p) => {
    let weight: number

    if (p.region === "industrial") {
      // Industrial hotspots dim with renewable adoption
      weight = p.baseWeight * globalScale * (1 - renewableReduction * 0.8)
    } else if (p.region === "deforestation") {
      // Tropical/deforestation hotspots dim with deforestation policy
      weight = p.baseWeight * globalScale * (1 - deforestationReduction * 0.9)
    } else {
      // Arctic: amplified warming (~1.4× faster than global average)
      const arcticT = clamp(t * 1.4, 0, 1)
      weight = p.baseWeight * lerp(0.0, 1.2, arcticT)
    }

    return { lat: p.lat, lng: p.lng, weight: clamp(weight, 0, 2.0) }
  })

  return [points]
}

/**
 * Get heatmap saturation. Higher temperature = more saturated colors.
 * Range expanded from 0.2 (near-greyscale) to 3.0 (hyper-vivid) for dramatic visual contrast.
 */
export function getHeatmapSaturation(temperatureRise: number): number {
  const t = normalize(temperatureRise, TEMP_MIN, TEMP_MAX)
  return lerp(0.2, 3.0, t)
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

/**
 * Build risk mapped rings scaled by severity of climate events.
 */
export function buildRiskRingsData(result: SimulationResult | undefined): RingDatum[] {
  const tempRise = result?.temperature_rise ?? BASELINE_TEMP
  // Sea level range is roughly 2.5–8.5 based on engine.py (1.5 + temp_rise * 2.0, temp_rise ∈ [0.5, 3.5])
  const seaLevelRise = result?.sea_level_rise ?? 2.5

  // tRisk is 0 (good) to 1 (bad) based on temp
  const tTemp = normalize(tempRise, TEMP_MIN, TEMP_MAX)
  const tSeaLevel = normalize(seaLevelRise, 2.5, 8.5)

  return RISK_ZONES.map((zone) => {
    let t = tTemp
    let baseColor = ""
    if (zone.type === "wildfire") {
      baseColor = "255, 60, 30" // Red-orange
      t = clamp(tTemp * 1.2, 0, 1) // Wildfire scales aggressively with temp
    } else if (zone.type === "flood") {
      baseColor = "30, 144, 255" // Dodger Blue
      t = clamp(tSeaLevel * 1.5, 0, 1) // Flood scales with sea level
    } else if (zone.type === "drought") {
      baseColor = "210, 180, 140" // Tan/Brown
      t = tTemp
    } else if (zone.type === "heatwave") {
      baseColor = "255, 140, 0" // Dark Orange
      t = clamp(tTemp * 1.1, 0, 1)
    }

    return {
      lat: zone.lat,
      lng: zone.lng,
      maxRadius: lerp(0.5, 6, t),
      propagationSpeed: lerp(0.2, 2, t),
      repeatPeriod: lerp(4000, 800, t),
      color: (ringT: number) => {
        const opacity = clamp((1 - ringT) * t, 0, 0.9)
        return `rgba(${baseColor}, ${opacity.toFixed(2)})`
      },
    }
  })
}

export interface HTMLLabelDatum {
  lat: number
  lng: number
  icon: string
  label: string
  visibilityClass: string
}

/**
 * Build HTML elements for the disaster zones showing the severity or icon.
 */
export function buildRiskHtmlElementsData(result: SimulationResult | undefined): HTMLLabelDatum[] {
  const tempRise = result?.temperature_rise ?? BASELINE_TEMP
  const seaLevelRise = result?.sea_level_rise ?? 1.5
  const tTemp = normalize(tempRise, TEMP_MIN, TEMP_MAX)
  const tSeaLevel = normalize(seaLevelRise, 1.5, 8.5)

  return RISK_ZONES.map((zone) => {
    let t = tTemp
    let icon = ""
    if (zone.type === "wildfire") { icon = "🔥"; t = clamp(tTemp * 1.2, 0, 1) }
    if (zone.type === "flood") { icon = "🌊"; t = clamp(tSeaLevel * 1.5, 0, 1) }
    if (zone.type === "drought") { icon = "🏜️"; t = tTemp }
    if (zone.type === "heatwave") { icon = "🌡️"; t = clamp(tTemp * 1.1, 0, 1) }

    return {
      lat: zone.lat,
      lng: zone.lng,
      icon,
      label: zone.type.toUpperCase(),
      visibilityClass: t > 0.4 ? "scale-100 opacity-100" : "scale-50 opacity-50 drop-shadow-lg",
    }
  })
}
