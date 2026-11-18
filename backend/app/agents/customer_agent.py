from typing import Dict, Any, Optional
from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import CustomerReport

class CustomerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="customer_agent",
            name="Customer Profiling Agent",
            description="Builds detailed target buyer personas, validates willingness to pay, and maps acquisition channels."
        )

    async def run(self, startup_info: Dict[str, Any], notify_cb=None) -> CustomerReport:
        name = startup_info.get("name", "Startup")
        desc = startup_info.get("description", "")
        industry = startup_info.get("industry", "Technology")
        target_market = startup_info.get("target_market", "India")
        
        self.set_running(f"Profiling target customer personas and demand urgency for {name}...")
        if notify_cb:
            await notify_cb(self.status)

        system_prompt = (
            "You are a Customer Development & Growth Strategist. "
            "Profile 2 to 3 distinct customer personas for this startup. "
            "For each persona, give them a realistic name and title, outline their daily burning pain point, "
            "their current makeshift alternative, and their realistic willingness to pay (price sensitivity). "
            "Detail concrete demand evidence and top acquisition channels."
        )

        user_prompt = (
            f"STARTUP PROFILE:\n"
            f"Name: {name}\n"
            f"Concept: {desc}\n"
            f"Industry: {industry}\n"
            f"Target Geography: {target_market}\n"
        )

        mock_data = {
            "personas": [
                {
                    "name": "Prashant - Pragmatic Mid-Tier Operator",
                    "role_demographics": f"32 yrs old, manages a 15-person regional team in {target_market}; digitally active on WhatsApp & mobile.",
                    "core_pain_point": "Loses 2-3 hours daily coordinating manual updates and troubleshooting repetitive bottlenecks; fears operational leakage.",
                    "current_alternative": "Unorganized WhatsApp groups and shared Google Sheets; periodic firefighting.",
                    "willingness_to_pay": "High willingness to pay ₹1,500 – ₹4,000/month if the tool saves measurable working hours or directly prevents financial loss."
                },
                {
                    "name": "Ananya - Cost-Conscious Independent Specialist",
                    "role_demographics": "26 yrs old, early-career professional seeking rapid skill and output upgrades; price-sensitive.",
                    "core_pain_point": "Needs reliable, high-speed guidance without having to pay for expensive enterprise consulting or courses.",
                    "current_alternative": "Free YouTube tutorials, trial versions of generic tools, and peer peer-asking.",
                    "willingness_to_pay": "Moderate willingness: willing to pay ₹499 – ₹999/month for freemium tiers with instant demonstrable utility."
                }
            ],
            "demand_evidence": f"Rising organic search interest in automated {industry} workflows and high community engagement across regional developer/business forums.",
            "acquisition_channels": [
                "Direct product-led referral hooks via WhatsApp and LinkedIn shareable outputs.",
                "Targeted vernacular search intent campaigns (Google Search Ads & YouTube shorts).",
                "Strategic partnerships with regional trade associations and community groups."
            ],
            "sources": []
        }

        report = await self.execute_llm_task(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=CustomerReport,
            temperature=0.2,
            mock_data=mock_data
        )
        if notify_cb:
            await notify_cb(self.status)
        return report
