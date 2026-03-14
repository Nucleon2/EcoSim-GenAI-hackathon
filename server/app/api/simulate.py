from fastapi import APIRouter

from app.models.simulation import PolicyInput, SimulationResult
from app.climate.engine import simulate

router = APIRouter()


@router.post("/simulate", response_model=SimulationResult)
def run_simulation(policy: PolicyInput) -> SimulationResult:
    return simulate(policy)
