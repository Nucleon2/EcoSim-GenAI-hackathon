import json
import os

from openai import AsyncOpenAI

from app.models.simulation import PolicyInput, PolicyLetterResponse, SimulationResult

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


LETTER_SYSTEM_PROMPT = (
    "You are a professional climate policy advocate. Draft a compelling formal letter to a "
    "government representative advocating for specific climate policy targets. Use the placeholder "
    "[Representative Name] for the recipient. Include the actual numerical targets from the "
    "simulation data. The letter should be persuasive, factual, and professionally toned. "
    "Around 300 words. Return a JSON object with keys 'subject' (email subject line, under 80 chars) "
    "and 'letter' (the full letter text including salutation and sign-off)."
)

MEMO_SYSTEM_PROMPT = (
    "You are a climate policy analyst. Draft a professional policy memorandum advocating for "
    "specific climate policy targets based on simulation data. Use standard memo format with "
    "header fields: TO: Policymakers and Decision Makers, FROM: the user's name, "
    "RE: Climate Action Policy Targets. Include the actual numerical targets from the simulation. "
    "Be analytical, evidence-based, and persuasive. Around 300 words. Return a JSON object with "
    "keys 'subject' (memo subject line, under 80 chars) and 'letter' (the full memo text)."
)


async def generate_policy_letter(
    policy: PolicyInput,
    result: SimulationResult,
    letter_type: str,
    user_name: str,
    user_location: str,
) -> PolicyLetterResponse:
    system_prompt = MEMO_SYSTEM_PROMPT if letter_type == "memo" else LETTER_SYSTEM_PROMPT
    from_line = f"From: {user_name}" if user_name else "From: A Concerned Citizen"
    location_line = f"Location: {user_location}" if user_location else ""

    user_prompt = (
        f"Writer information:\n"
        f"{from_line}\n"
        f"{location_line}\n\n"
        f"Simulation policy inputs:\n"
        f"- Carbon tax: ${policy.carbon_tax}/tonne\n"
        f"- Renewable adoption: {policy.renewable_adoption}%\n"
        f"- Deforestation reduction: {policy.deforestation_reduction}%\n"
        f"- Methane reduction: {policy.methane_reduction}%\n"
        f"- EV adoption: {policy.ev_adoption}%\n"
        f"- Target year: {policy.target_year}\n\n"
        f"Projected outcomes under these policies:\n"
        f"- CO2 emissions: {result.co2_emissions:.1f} GtCO2/year (down from 36.8 baseline)\n"
        f"- Temperature rise: {result.temperature_rise:.2f}°C above pre-industrial levels\n"
        f"- Sea level rise: {result.sea_level_rise:.1f} mm/year\n"
        f"- Climate risk score: {result.risk_score:.0f}/100\n\n"
        f"Draft the {'policy memo' if letter_type == 'memo' else 'representative letter'} now."
    )

    response = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=800,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content or "{}"
    parsed = json.loads(content)
    return PolicyLetterResponse(
        letter=parsed.get("letter", "Unable to generate letter."),
        subject=parsed.get("subject", "Climate Policy Action"),
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
