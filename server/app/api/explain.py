from fastapi import APIRouter

from app.models.simulation import ExplanationRequest, ExplanationResponse
from app.services.ai_explanation import generate_explanation

router = APIRouter()


@router.post("/explain", response_model=ExplanationResponse)
async def explain_simulation(request: ExplanationRequest) -> ExplanationResponse:
    explanation = await generate_explanation(request.policy, request.result)
    return ExplanationResponse(explanation=explanation)
