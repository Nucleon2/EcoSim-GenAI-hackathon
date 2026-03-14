import math

from app.models.simulation import PolicyInput, SimulationResult

# Baseline values (approx. 2023 real-world)
BASELINE_EMISSIONS = 36.8  # GtCO2/year

# Sector weights: max fraction of global emissions each lever can reduce
W_RENEWABLE = 0.25
W_CARBON_TAX = 0.15
W_EV = 0.12
W_DEFORESTATION = 0.10
W_METHANE = 0.10

# Temperature mapping
TEMP_MIN = 1.0   # °C at max policy (emissions_factor = 0.28)
TEMP_MAX = 2.5   # °C at no policy (emissions_factor = 1.0)
MAX_REDUCTION = W_RENEWABLE + W_CARBON_TAX + W_EV + W_DEFORESTATION + W_METHANE  # 0.72
TEMP_SENSITIVITY = (TEMP_MAX - TEMP_MIN) / MAX_REDUCTION  # ≈ 2.083

# Methane direct cooling bonus (short-lived pollutant effect)
METHANE_TEMP_BONUS = 0.15  # max °C reduction at 100% methane reduction


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def simulate(policy: PolicyInput) -> SimulationResult:
    # Stage 1: compute per-lever emission reduction impacts
    renewable_impact = (policy.renewable_adoption / 100) * W_RENEWABLE
    carbon_tax_impact = min(1.0, math.sqrt(policy.carbon_tax / 300)) * W_CARBON_TAX
    deforestation_impact = (policy.deforestation_reduction / 100) * W_DEFORESTATION
    methane_impact = (policy.methane_reduction / 100) * W_METHANE
    ev_impact = (policy.ev_adoption / 100) * W_EV

    total_reduction = (
        renewable_impact
        + carbon_tax_impact
        + deforestation_impact
        + methane_impact
        + ev_impact
    )
    emissions_factor = 1.0 - total_reduction

    # Stage 2: map to outputs
    co2_emissions = round(BASELINE_EMISSIONS * emissions_factor, 2)

    temp_rise = (
        TEMP_MIN
        + (emissions_factor - (1.0 - MAX_REDUCTION)) * TEMP_SENSITIVITY
        - (policy.methane_reduction / 100) * METHANE_TEMP_BONUS
    )
    temp_rise = round(_clamp(temp_rise, 0.5, 3.5), 2)

    sea_level_rise = round(1.5 + temp_rise * 2.0, 2)

    # Risk score (composite, 0-100)
    norm_temp = _clamp((temp_rise - 1.0) / 2.0, 0, 1)
    norm_emissions = _clamp((co2_emissions - 10) / 30, 0, 1)
    norm_sea = _clamp((sea_level_rise - 2) / 6, 0, 1)
    risk_score = round((norm_temp * 0.4 + norm_emissions * 0.3 + norm_sea * 0.3) * 100, 1)

    return SimulationResult(
        co2_emissions=co2_emissions,
        temperature_rise=temp_rise,
        sea_level_rise=sea_level_rise,
        risk_score=risk_score,
        emissions_breakdown={
            "renewable_adoption": round(renewable_impact, 4),
            "carbon_tax": round(carbon_tax_impact, 4),
            "deforestation_reduction": round(deforestation_impact, 4),
            "methane_reduction": round(methane_impact, 4),
            "ev_adoption": round(ev_impact, 4),
        },
    )
