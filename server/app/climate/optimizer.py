from app.climate.engine import simulate
from app.models.simulation import PolicyInput, SimulationResult

TARGET_METRICS = {"temperature_rise", "co2_emissions", "sea_level_rise", "risk_score"}

METRIC_UNITS = {
    "temperature_rise": "°C",
    "co2_emissions": "GtCO2/year",
    "sea_level_rise": "mm/year",
    "risk_score": "/100",
}

METRIC_LABELS = {
    "temperature_rise": "temperature rise",
    "co2_emissions": "CO2 emissions",
    "sea_level_rise": "sea level rise",
    "risk_score": "risk score",
}


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


# Each lever has a different priority curve so the optimizer produces
# varied, realistic recommendations instead of uniform percentages.
# Higher-impact levers (renewables, carbon tax) ramp up faster.
def _policy_from_scale(s: float) -> PolicyInput:
    return PolicyInput(
        carbon_tax=round(_clamp(s * 1.3, 0, 1) * 300, 1),        # ramps fastest
        renewable_adoption=round(_clamp(s * 1.2, 0, 1) * 100, 1), # high priority
        deforestation_reduction=round(_clamp(s * 0.9, 0, 1) * 100, 1),
        methane_reduction=round(_clamp(s * 0.85, 0, 1) * 100, 1),
        ev_adoption=round(_clamp(s * 0.75, 0, 1) * 100, 1),      # ramps slowest
    )


def _meets_all_targets(result: SimulationResult, targets: dict[str, float]) -> bool:
    return all(
        getattr(result, metric) <= threshold
        for metric, threshold in targets.items()
    )


def build_goal_description(targets: dict[str, float]) -> str:
    parts = []
    for metric, threshold in targets.items():
        label = METRIC_LABELS[metric]
        unit = METRIC_UNITS[metric]
        parts.append(f"{label} below {threshold}{unit}")
    return "Keep " + " and ".join(parts)


def optimize(targets: dict[str, float]) -> tuple[PolicyInput, SimulationResult]:
    # Check if the target is achievable at max policies
    max_policy = _policy_from_scale(1.0)
    max_result = simulate(max_policy)
    if not _meets_all_targets(max_result, targets):
        return max_policy, max_result

    # Binary search for minimum s that meets all targets
    lo, hi = 0.0, 1.0
    best_policy = max_policy
    best_result = max_result

    for _ in range(20):
        mid = (lo + hi) / 2
        policy = _policy_from_scale(mid)
        result = simulate(policy)

        if _meets_all_targets(result, targets):
            best_policy = policy
            best_result = result
            hi = mid
        else:
            lo = mid

    return best_policy, best_result
