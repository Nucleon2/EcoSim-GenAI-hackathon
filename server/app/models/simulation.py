from pydantic import BaseModel, Field


class PolicyInput(BaseModel):
    carbon_tax: float = Field(default=50, ge=0, le=300, description="Carbon tax rate in $/tonne")
    renewable_adoption: float = Field(default=30, ge=0, le=100, description="Renewable energy adoption %")
    deforestation_reduction: float = Field(default=25, ge=0, le=100, description="Deforestation reduction %")
    methane_reduction: float = Field(default=20, ge=0, le=100, description="Methane reduction %")
    ev_adoption: float = Field(default=15, ge=0, le=100, description="EV adoption %")


class SimulationResult(BaseModel):
    co2_emissions: float = Field(description="Global CO2 emissions in GtCO2/year")
    temperature_rise: float = Field(description="Temperature rise in °C above pre-industrial")
    sea_level_rise: float = Field(description="Sea level rise in mm/year")
    risk_score: float = Field(description="Climate risk score 0-100")
    emissions_breakdown: dict[str, float] = Field(description="Per-lever emission reduction contributions")
