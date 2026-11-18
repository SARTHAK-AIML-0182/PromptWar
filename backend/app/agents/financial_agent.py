from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import FinancialReport, MetricComparison
from app.scoring.benchmark_matcher import evaluate_metrics, load_benchmarks

class FinancialAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="financial_agent",
            name="Financial Analyst Agent",
            description="Audits business models, unit economics (LTV/CAC, margins), and cash runway against industry benchmarks."
        )

    async def run(
        self,
        startup_info: Dict[str, Any],
        metric_comparisons: List[MetricComparison],
        notify_cb=None
    ) -> FinancialReport:
        name = startup_info.get("name", "Startup")
        desc = startup_info.get("description", "")
        industry = startup_info.get("industry", "Technology")
        mode = startup_info.get("mode", "idea")
        
        self.set_running(f"Auditing financial viability, unit economics, and capital efficiency for {name}...")
        if notify_cb:
            await notify_cb(self.status)

        metrics_text = "\n".join([
            f"- {m.metric_name}: User value = {m.user_value} | Benchmark = {m.benchmark_range} | Status = {m.status} ({m.verdict})"
            for m in metric_comparisons
        ])

        system_prompt = (
            "You are a Venture Capital CFO and Unit Economics Auditor. "
            "Examine the startup's monetization model, gross margins, CAC payback, and capital runway. "
            "Highlight strengths and capital risks. If the startup is in Idea Stage, assess the viability of their proposed monetization."
        )

        user_prompt = (
            f"STARTUP FINANCIAL PROFILE:\n"
            f"Name: {name}\n"
            f"Concept: {desc}\n"
            f"Industry: {industry}\n"
            f"Stage Mode: {mode}\n\n"
            f"BENCHMARK COMPARISONS:\n{metrics_text}\n"
        )

        mock_data = {
            "business_model_evaluation": (
                f"The planned subscription/transactional model in {industry} aligns with current market demand. "
                "Recurring revenue potential is high if retention hooks and switching barriers are established early."
            ),
            "unit_economics_analysis": (
                "Estimated gross margin profile is viable. For sustainable scaling, LTV:CAC should be maintained above 3.0x "
                "with an acquisition payback period under 12 months."
            ),
            "runway_burn_status": (
                "Capital efficiency is paramount in this sector. Maintaining at least 15 months of cash runway allows the team "
                "to achieve product-market fit without premature dilutive financing."
            ),
            "metric_comparisons": [m.model_dump() for m in metric_comparisons],
            "key_recommendation": (
                "Formalize pricing tiers early based on customer value metrics (e.g. usage/volume) rather than flat discounting."
            )
        }

        report = await self.execute_llm_task(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=FinancialReport,
            temperature=0.2,
            mock_data=mock_data
        )
        report.metric_comparisons = metric_comparisons
        if notify_cb:
            await notify_cb(self.status)
        return report
