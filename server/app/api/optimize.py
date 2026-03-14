from fastapi import APIRouter, HTTPException

from app.climate.optimizer import optimize, GOALS
from app.models.simulation import OptimizeRequest, OptimizeResponse
from app.services.ai_explanation import generate_goal_explanation

router = APIRouter()


@router.post("/optimize-policy", response_model=OptimizeResponse)
async def optimize_policy(request: OptimizeRequest) -> OptimizeResponse:
    if request.goal not in GOALS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown goal: {request.goal}. Valid: {list(GOALS.keys())}",
        )

    policy, result = optimize(request.goal)
    goal_description = GOALS[request.goal]["description"]
    explanation = await generate_goal_explanation(goal_description, policy, result)

    return OptimizeResponse(
        recommended_policies=policy,
        projected_results=result,
        explanation=explanation,
    )
