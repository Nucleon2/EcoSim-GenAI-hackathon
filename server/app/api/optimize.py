from fastapi import APIRouter, HTTPException

from app.climate.optimizer import optimize, build_goal_description, TARGET_METRICS
from app.models.simulation import OptimizeRequest, OptimizeResponse
from app.services.ai_explanation import generate_goal_explanation

router = APIRouter()


@router.post("/optimize-policy", response_model=OptimizeResponse)
async def optimize_policy(request: OptimizeRequest) -> OptimizeResponse:
    targets: dict[str, float] = {}
    for metric in TARGET_METRICS:
        value = getattr(request, metric)
        if value is not None:
            targets[metric] = value

    if not targets:
        raise HTTPException(
            status_code=400,
            detail="At least one target must be specified (temperature_rise, co2_emissions, sea_level_rise, or risk_score).",
        )

    policy, result = optimize(targets)
    goal_description = build_goal_description(targets)
    explanation = await generate_goal_explanation(goal_description, policy, result)

    return OptimizeResponse(
        recommended_policies=policy,
        projected_results=result,
        explanation=explanation,
    )
