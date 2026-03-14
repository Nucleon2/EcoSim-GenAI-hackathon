from app.climate.engine import simulate
from app.models.simulation import PolicyInput, SimulationResult


GOALS = {
    "limit_warming_1_5": {
        "description": "Keep warming below 1.5°C",
        "metric": "temperature_rise",
        "threshold": 1.5,
        "compare": "le",
    },
    "limit_warming_2": {
        "description": "Keep warming below 2.0°C",
        "metric": "temperature_rise",
        "threshold": 2.0,
        "compare": "le",
    },
    "reduce_emissions_50": {
        "description": "Cut emissions by 50%",
        "metric": "co2_emissions",
        "threshold": 18.4,
        "compare": "le",
    },
    "minimize_risk": {
        "description": "Minimize climate risk",
        "metric": "risk_score",
        "threshold": 25.0,
        "compare": "le",
    },
}


def _policy_from_scale(s: float) -> PolicyInput:
    return PolicyInput(
        carbon_tax=round(s * 300, 1),
        renewable_adoption=round(s * 100, 1),
        deforestation_reduction=round(s * 100, 1),
        methane_reduction=round(s * 100, 1),
        ev_adoption=round(s * 100, 1),
    )


def _meets_target(result: SimulationResult, goal_config: dict) -> bool:
    value = getattr(result, goal_config["metric"])
    return value <= goal_config["threshold"]


def optimize(goal: str) -> tuple[PolicyInput, SimulationResult]:
    if goal not in GOALS:
        raise ValueError(f"Unknown goal: {goal}. Valid goals: {list(GOALS.keys())}")

    goal_config = GOALS[goal]

    # Check if the target is achievable at max policies
    max_policy = _policy_from_scale(1.0)
    max_result = simulate(max_policy)
    if not _meets_target(max_result, goal_config):
        return max_policy, max_result

    # Binary search for minimum s that meets the target
    lo, hi = 0.0, 1.0
    best_policy = max_policy
    best_result = max_result

    for _ in range(20):
        mid = (lo + hi) / 2
        policy = _policy_from_scale(mid)
        result = simulate(policy)

        if _meets_target(result, goal_config):
            best_policy = policy
            best_result = result
            hi = mid
        else:
            lo = mid

    return best_policy, best_result
