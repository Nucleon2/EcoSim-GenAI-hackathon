from fastapi import APIRouter

from app.models.simulation import PolicyLetterRequest, PolicyLetterResponse
from app.services.ai_explanation import generate_policy_letter

router = APIRouter()


@router.post("/draft-letter", response_model=PolicyLetterResponse)
async def draft_letter(request: PolicyLetterRequest) -> PolicyLetterResponse:
    return await generate_policy_letter(
        request.policy,
        request.result,
        request.letter_type,
        request.user_name,
        request.user_location,
    )
