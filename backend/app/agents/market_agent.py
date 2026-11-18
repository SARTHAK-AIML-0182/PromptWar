from typing import Dict, Any, Optional
from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import MarketReport, TamSamSomItem
from app.tools.search_tool import search
from app.schemas.common import Source

class MarketAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="market_agent",
            name="Market Research Agent",
            description="Analyzes TAM/SAM/SOM, market growth trajectory, timing tailwinds, and industry trends."
        )

    async def run(self, startup_info: Dict[str, Any], notify_cb=None) -> MarketReport:
        name = startup_info.get("name", "Startup")
        desc = startup_info.get("description", "")
        industry = startup_info.get("industry", "Technology")
        target_market = startup_info.get("target_market", "India")
        
        self.set_running(f"Conducting market sizing and timing research for {industry} in {target_market}...")
        if notify_cb:
            await notify_cb(self.status)

        # 1. Search tool query
        search_query = f"{industry} market size TAM growth rate India 2024 2030"
        sources = await search(search_query, industry_hint=industry)

        sources_context = "\n".join([f"- {s.title} ({s.url}): {s.snippet}" for s in sources])

        system_prompt = (
            "You are a premier Venture Capital Market Research Partner. "
            "Evaluate market size (TAM, SAM, SOM), growth CAGR, timing drivers ('Why Now?'), and 3-5 trends. "
            "For TAM/SAM/SOM, provide both formatted figures (e.g. '$18.4 Billion' or '₹1,50,000 Crore') "
            "and a ONE-LINE plain language explanation understandable to non-finance founders. "
            "Ensure figures are grounded in realistic industry estimates. Do not hallucinate exact decimal certainty; provide believable ranges."
        )

        user_prompt = (
            f"STARTUP PROFILE:\n"
            f"Name: {name}\n"
            f"Concept: {desc}\n"
            f"Industry: {industry}\n"
            f"Target Market / Geography: {target_market}\n\n"
            f"EXTERNAL RESEARCH SOURCES:\n{sources_context}\n"
        )

        # Mock fallback data in case of offline/no-key usage
        mock_data = {
            "tam": {
                "value_display": "$28.5 Billion (₹2,35,000 Crore)",
                "plain_explanation": "Total global and national spending across this entire industry category.",
                "methodology": "Based on national industry aggregate reports and tech penetration multiples."
            },
            "sam": {
                "value_display": "$4.2 Billion (₹34,800 Crore)",
                "plain_explanation": "The portion of the market actively reachable through digital channels and this specific solution.",
                "methodology": "Target demographic in tier-1, tier-2, and rural connected smartphone users."
            },
            "som": {
                "value_display": "$180 Million (₹1,500 Crore)",
                "plain_explanation": "Realistic market share achievable within 3-4 years with focused regional distribution.",
                "methodology": "Assuming 3.5% market capture of serviceable digital accounts."
            },
            "cagr_growth_rate": "17.8% CAGR (2024–2030)",
            "timing_assessment": f"Favorable inflection point driven by rising mobile penetration, UPI adoption, and regulatory digitisation in {target_market}.",
            "key_trends": [
                "Rapid shift from offline fragmented operations to vernacular mobile-first solutions.",
                "Increased investor appetite for domain-specific automation and AI co-pilots.",
                "Growing user willingness to pay for measurable time savings and direct income improvement.",
                "Consolidation of regional distribution channels into unified digital networks."
            ],
            "summary": f"The {industry} space exhibits significant structural tailwinds in {target_market}, presenting a strong multi-year expansion window.",
            "sources": [s.model_dump() for s in sources]
        }

        report = await self.execute_llm_task(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=MarketReport,
            temperature=0.2,
            mock_data=mock_data
        )
        if not report.sources:
            report.sources = sources
            
        if notify_cb:
            await notify_cb(self.status)
        return report
