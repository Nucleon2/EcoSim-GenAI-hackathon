import os

from openai import AsyncOpenAI

from app.models.simulation import PolicyInput, SimulationResult

client = AsyncOpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY", ""),
    base_url="https://api.deepseek.com",
)

SYSTEM_PROMPT = (
    "You are a climate policy analyst. Given a set of policy inputs and their "
    "simulation results, explain the outcome in 2-3 clear, simple sentences. "
    "Focus on what changed, why it matters, and which policies had the biggest "
    "effect. Use plain language that a non-expert can understand. Do not use "
    "bullet points or lists — write in prose."
)


async def generate_explanation(
    policy: PolicyInput, result: SimulationResult
) -> str:
    user_prompt = (
        f"Policy inputs:\n"
        f"- Carbon tax: ${policy.carbon_tax}/tonne\n"
        f"- Renewable adoption: {policy.renewable_adoption}%\n"
        f"- Deforestation reduction: {policy.deforestation_reduction}%\n"
        f"- Methane reduction: {policy.methane_reduction}%\n"
        f"- EV adoption: {policy.ev_adoption}%\n\n"
        f"Simulation results:\n"
        f"- CO2 emissions: {result.co2_emissions:.1f} GtCO2/year\n"
        f"- Temperature rise: {result.temperature_rise:.2f}°C above pre-industrial\n"
        f"- Sea level rise: {result.sea_level_rise:.1f} mm/year\n"
        f"- Risk score: {result.risk_score:.0f}/100\n"
    )

    response = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=200,
    )

    return response.choices[0].message.content or "Unable to generate explanation."
