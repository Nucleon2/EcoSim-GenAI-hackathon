from pydantic import BaseModel, Field


class PolicyInput(BaseModel):
    carbon_tax: float = Field(default=50, ge=0, le=300, description="Carbon tax rate in $/tonne")
    renewable_adoption: float = Field(default=30, ge=0, le=100, description="Renewable energy adoption %")
    deforestation_reduction: float = Field(default=25, ge=0, le=100, description="Deforestation reduction %")
    methane_reduction: float = Field(default=20, ge=0, le=100, description="Methane reduction %")
    ev_adoption: float = Field(default=15, ge=0, le=100, description="EV adoption %")
    target_year: int = Field(default=2050, ge=2030, le=2100, description="Projection target year")


class SimulationResult(BaseModel):
    co2_emissions: float = Field(description="Global CO2 emissions in GtCO2/year")
    temperature_rise: float = Field(description="Temperature rise in °C above pre-industrial")
    sea_level_rise: float = Field(description="Sea level rise in mm/year")
    risk_score: float = Field(description="Climate risk score 0-100")
    emissions_breakdown: dict[str, float] = Field(description="Per-lever emission reduction contributions")


class ExplanationRequest(BaseModel):
    policy: PolicyInput
    result: SimulationResult


class ExplanationResponse(BaseModel):
    explanation: str = Field(description="AI-generated explanation of the simulation results")


class ComparisonExplanationRequest(BaseModel):
    policy_a: PolicyInput
    result_a: SimulationResult
    policy_b: PolicyInput
    result_b: SimulationResult


class ComparisonExplanationResponse(BaseModel):
    explanation: str


class OptimizeRequest(BaseModel):
    temperature_rise: float | None = Field(default=None, description="Target max temperature rise in °C")
    co2_emissions: float | None = Field(default=None, description="Target max CO2 emissions in GtCO2/year")
    sea_level_rise: float | None = Field(default=None, description="Target max sea level rise in mm/year")
    risk_score: float | None = Field(default=None, description="Target max risk score 0-100")


class OptimizeResponse(BaseModel):
    recommended_policies: PolicyInput
    projected_results: SimulationResult
    explanation: str
