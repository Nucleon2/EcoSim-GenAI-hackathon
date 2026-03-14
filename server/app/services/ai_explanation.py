import os

from openai import AsyncOpenAI

from app.models.simulation import PolicyInput, SimulationResult

client = AsyncOpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY", ""),
    base_url="https://api.deepseek.com",
)

SYSTEM_PROMPT = (
    "You are a climate policy analyst. Given policy inputs and simulation "
    "results, write exactly 2 short sentences. Sentence 1: which policies "
    "had the biggest effect and what changed. Sentence 2: what remains a "
    "concern. Be concise — under 40 words total. No bullet points or lists."
)


GOAL_SYSTEM_PROMPT = (
    "You are a climate policy analyst. A user selected a climate goal and "
    "the system found an optimal policy mix to achieve it. In exactly 2-3 "
    "short sentences, explain why this combination of policies meets the "
    "target. Mention the most impactful levers. Be concise — under 50 words "
    "total. No bullet points or lists."
)


async def generate_goal_explanation(
    goal_description: str, policy: PolicyInput, result: SimulationResult
) -> str:
    user_prompt = (
        f"Climate goal: {goal_description}\n\n"
        f"Recommended policy mix:\n"
        f"- Carbon tax: ${policy.carbon_tax}/tonne\n"
        f"- Renewable adoption: {policy.renewable_adoption}%\n"
        f"- Deforestation reduction: {policy.deforestation_reduction}%\n"
        f"- Methane reduction: {policy.methane_reduction}%\n"
        f"- EV adoption: {policy.ev_adoption}%\n\n"
        f"Projected results:\n"
        f"- CO2 emissions: {result.co2_emissions:.1f} GtCO2/year\n"
        f"- Temperature rise: {result.temperature_rise:.2f}°C\n"
        f"- Sea level rise: {result.sea_level_rise:.1f} mm/year\n"
        f"- Risk score: {result.risk_score:.0f}/100\n"
    )

    response = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": GOAL_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=200,
    )

    return response.choices[0].message.content or "Unable to generate explanation."


COMPARISON_SYSTEM_PROMPT = (
    "You are a climate policy analyst. Compare two climate policy scenarios "
    "and their outcomes. In 3-4 sentences: state which scenario achieves better "
    "outcomes and why, identify the key policy differences driving the results, "
    "and note any remaining concerns shared by both. "
    "Under 80 words total. No bullet points or lists."
)


async def generate_comparison_explanation(
    policy_a: PolicyInput,
    result_a: SimulationResult,
    policy_b: PolicyInput,
    result_b: SimulationResult,
) -> str:
    user_prompt = (
        f"Scenario A policies:\n"
        f"- Carbon tax: ${policy_a.carbon_tax}/tonne\n"
        f"- Renewable adoption: {policy_a.renewable_adoption}%\n"
        f"- Deforestation reduction: {policy_a.deforestation_reduction}%\n"
        f"- Methane reduction: {policy_a.methane_reduction}%\n"
        f"- EV adoption: {policy_a.ev_adoption}%\n\n"
        f"Scenario A results:\n"
        f"- CO2 emissions: {result_a.co2_emissions:.1f} GtCO2/year\n"
        f"- Temperature rise: {result_a.temperature_rise:.2f}°C\n"
        f"- Sea level rise: {result_a.sea_level_rise:.1f} mm/year\n"
        f"- Risk score: {result_a.risk_score:.0f}/100\n\n"
        f"Scenario B policies:\n"
        f"- Carbon tax: ${policy_b.carbon_tax}/tonne\n"
        f"- Renewable adoption: {policy_b.renewable_adoption}%\n"
        f"- Deforestation reduction: {policy_b.deforestation_reduction}%\n"
        f"- Methane reduction: {policy_b.methane_reduction}%\n"
        f"- EV adoption: {policy_b.ev_adoption}%\n\n"
        f"Scenario B results:\n"
        f"- CO2 emissions: {result_b.co2_emissions:.1f} GtCO2/year\n"
        f"- Temperature rise: {result_b.temperature_rise:.2f}°C\n"
        f"- Sea level rise: {result_b.sea_level_rise:.1f} mm/year\n"
        f"- Risk score: {result_b.risk_score:.0f}/100\n"
    )

    response = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": COMPARISON_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=200,
    )

    return response.choices[0].message.content or "Unable to generate comparison."


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
