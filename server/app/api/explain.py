from fastapi import APIRouter

from app.models.simulation import (
    ComparisonExplanationRequest,
    ComparisonExplanationResponse,
    ExplanationRequest,
    ExplanationResponse,
)
from app.services.ai_explanation import generate_comparison_explanation, generate_explanation

router = APIRouter()


@router.post("/explain", response_model=ExplanationResponse)
async def explain_simulation(request: ExplanationRequest) -> ExplanationResponse:
    explanation = await generate_explanation(request.policy, request.result)
    return ExplanationResponse(explanation=explanation)


@router.post("/explain-comparison", response_model=ComparisonExplanationResponse)
async def explain_comparison(request: ComparisonExplanationRequest) -> ComparisonExplanationResponse:
    explanation = await generate_comparison_explanation(
        request.policy_a, request.result_a, request.policy_b, request.result_b
    )
    return ComparisonExplanationResponse(explanation=explanation)
