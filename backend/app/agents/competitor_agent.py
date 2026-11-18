from typing import Dict, Any, Optional
from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import CompetitorReport
from app.tools.search_tool import search

class CompetitorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="competitor_agent",
            name="Competitor Analysis Agent",
            description="Identifies direct & indirect rivals, maps positioning whitespace, and assesses competitive moats."
        )

    async def run(self, startup_info: Dict[str, Any], notify_cb=None) -> CompetitorReport:
        name = startup_info.get("name", "Startup")
        desc = startup_info.get("description", "")
        industry = startup_info.get("industry", "Technology")
        
        self.set_running(f"Benchmarking competitors and positioning gaps in {industry}...")
        if notify_cb:
            await notify_cb(self.status)

        sources = await search(f"{industry} top startups competitors alternatives India global", industry_hint=industry)
        sources_context = "\n".join([f"- {s.title} ({s.url}): {s.snippet}" for s in sources])

        system_prompt = (
            "You are a Senior Competitive Intelligence Analyst at a leading startup accelerator. "
            "Identify 3 to 5 key competitors (direct incumbents and indirect alternatives). "
            "For each competitor, provide specific strengths, exploitable weaknesses, and their known or estimated pricing model. "
            "Identify the clear positioning whitespace and evaluate the defensible moat required to win."
        )

        user_prompt = (
            f"TARGET STARTUP:\n"
            f"Name: {name}\n"
            f"Description: {desc}\n"
            f"Industry: {industry}\n\n"
            f"INDUSTRY CONTEXT & SOURCES:\n{sources_context}\n"
        )

        mock_data = {
            "competitors": [
                {
                    "name": "Legacy Enterprise Incumbents",
                    "type": "Direct",
                    "strengths": ["Deep distribution networks", "Brand recognition", "Enterprise compliance trust"],
                    "weaknesses": ["Slow clunky UX", "Prohibitive pricing for smaller players", "Lack of mobile/vernacular accessibility"],
                    "pricing_model": "Expensive annual contracts (₹1,50,000+ / year)",
                    "url": "https://example.com/incumbents"
                },
                {
                    "name": "Point-Solution Startups",
                    "type": "Direct",
                    "strengths": ["Modern user interface", "Venture-backed rapid feature rollout"],
                    "weaknesses": ["Narrow feature scope", "High customer churn", "Dependence on generic third-party APIs"],
                    "pricing_model": "Monthly tier subscription (₹2,500 - ₹8,000/mo)",
                    "url": "https://example.com/point-solution"
                },
                {
                    "name": "Manual / In-House Spreadsheets & Agencies",
                    "type": "Indirect",
                    "strengths": ["Zero upfront software cost", "Perceived customization control"],
                    "weaknesses": ["Extremely error-prone", "High human labor fatigue", "Does not scale beyond basic tasks"],
                    "pricing_model": "Hidden human operational cost (₹20,000 - ₹50,000/mo salary)",
                    "url": None
                }
            ],
            "positioning_gap": f"Unaddressed whitespace exists for an automated, vernacular, lightweight solution targeting underserved mid-market and SMB operators who cannot afford expensive enterprise software.",
            "moat_assessment": "Primary moat lies in proprietary workflow data loops, high user switching costs through automated integrations, and local network distribution.",
            "sources": [s.model_dump() for s in sources]
        }

        report = await self.execute_llm_task(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=CompetitorReport,
            temperature=0.2,
            mock_data=mock_data
        )
        if not report.sources:
            report.sources = sources
            
        if notify_cb:
            await notify_cb(self.status)
        return report
