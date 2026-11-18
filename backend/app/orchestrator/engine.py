import asyncio
import uuid
import logging
from typing import Dict, Any, List
from app.schemas.input_schemas import StartupInput
from app.schemas.agent_schemas import MarketReport, CompetitorReport, CustomerReport, FinancialReport, RiskReport
from app.schemas.scoring_schemas import ReliabilityReport
from app.schemas.execution_schemas import ExecutionPlan
from app.schemas.common import AgentStatus, Assumption, Source
from app.schemas import FullReport
from app.scoring.benchmark_matcher import evaluate_metrics, detect_contradictions
from app.orchestrator.stream_manager import stream_manager
from app.storage.db import save_report

# Import Agents
from app.agents.market_agent import MarketAgent
from app.agents.competitor_agent import CompetitorAgent
from app.agents.customer_agent import CustomerAgent
from app.agents.financial_agent import FinancialAgent
from app.agents.risk_agent import RiskAgent
from app.agents.scorer_agent import ScorerAgent
from app.agents.planner_agent import PlannerAgent

logger = logging.getLogger(__name__)

class Orchestrator:
    def __init__(self):
        self.market_agent = MarketAgent()
        self.competitor_agent = CompetitorAgent()
        self.customer_agent = CustomerAgent()
        self.financial_agent = FinancialAgent()
        self.risk_agent = RiskAgent()
        self.scorer_agent = ScorerAgent()
        self.planner_agent = PlannerAgent()

    def get_initial_agent_statuses(self) -> List[AgentStatus]:
        agents = [
            self.market_agent,
            self.competitor_agent,
            self.customer_agent,
            self.financial_agent,
            self.risk_agent,
            self.scorer_agent,
            self.planner_agent
        ]
        return [
            AgentStatus(
                agent_id=a.agent_id,
                name=a.name,
                state="waiting",
                message="Waiting to execute..."
            )
            for a in agents
        ]

    async def run_pipeline(self, job_id: str, payload: StartupInput) -> FullReport:
        mode = payload.mode
        currency = payload.currency
        
        # 1. Parse Input
        startup_info: Dict[str, Any] = {"mode": mode, "currency": currency}
        metric_comparisons = []
        assumptions: List[Assumption] = []
        contradictions = []

        if mode == "idea":
            inp = payload.idea_input
            startup_info["name"] = "Startup Concept"
            startup_info["description"] = inp.idea_description
            startup_info["industry"] = inp.industry or "General / Other"
            startup_info["target_market"] = inp.target_market or "India"
            assumptions.append(Assumption(
                field_name="Idea Stage Scope",
                assumed_value="Pre-revenue / Pre-launch",
                reason="Idea stage analysis: live unit economics and burn rates are excluded until launch.",
                industry_benchmark_source="Idea stage rubric standard"
            ))
        else:
            inp = payload.startup_input
            startup_info["name"] = inp.startup_name
            startup_info["description"] = inp.description
            startup_info["industry"] = inp.industry
            startup_info["stage"] = inp.stage
            startup_info["target_market"] = "India"
            startup_info["website"] = inp.website or ""
            
            # Check contradictions
            contradictions = detect_contradictions(inp)
            
            # Compare benchmarks & identify assumed fields
            metric_comparisons, assumptions = evaluate_metrics(inp.industry, inp)
            
            # Flatten metrics into startup_info
            if inp.traction:
                startup_info["total_users"] = inp.traction.total_users or 0
                startup_info["paying_customers"] = inp.traction.paying_customers or 0
                startup_info["monthly_revenue"] = inp.traction.monthly_revenue or 0
                startup_info["monthly_growth_pct"] = inp.traction.monthly_growth_pct or 10.0
            if inp.business:
                startup_info["pricing"] = inp.business.pricing or 2000
                startup_info["cac"] = inp.business.cac or 3500
                startup_info["gross_margin_pct"] = inp.business.gross_margin_pct or 70.0
                startup_info["churn_pct"] = inp.business.churn_pct or 2.0
                startup_info["runway_months"] = inp.business.runway_months or 12.0
                startup_info["monthly_burn"] = inp.business.monthly_burn or 0
                startup_info["funding_raised"] = inp.business.funding_raised or 0
            if inp.team_legal:
                startup_info["team_size"] = inp.team_legal.team_size or 2
                startup_info["founder_experience"] = inp.team_legal.founder_experience or "Domain entrepreneur"
                startup_info["licenses_ip_status"] = inp.team_legal.licenses_ip_status or "Standard compliance"

        # Broadcast initial statuses
        for status in self.get_initial_agent_statuses():
            await stream_manager.broadcast_status(job_id, status)

        # Helper callback for agents to stream status
        async def agent_notify(status: AgentStatus):
            await stream_manager.broadcast_status(job_id, status)

        await stream_manager.broadcast_log(job_id, "Phase 1: Launching 5 parallel research agents...")

        # 2. Phase 1: Parallel Execution (Market, Competitor, Customer, Financial, Risk)
        async def safe_run(coro, fallback_report):
            try:
                return await coro
            except Exception as e:
                logger.error(f"Error in agent execution: {e}")
                return fallback_report

        market_task = safe_run(self.market_agent.run(startup_info, agent_notify), None)
        competitor_task = safe_run(self.competitor_agent.run(startup_info, agent_notify), None)
        customer_task = safe_run(self.customer_agent.run(startup_info, agent_notify), None)
        financial_task = safe_run(self.financial_agent.run(startup_info, metric_comparisons, agent_notify), None)
        risk_task = safe_run(self.risk_agent.run(startup_info, agent_notify), None)

        results = await asyncio.gather(
            market_task,
            competitor_task,
            customer_task,
            financial_task,
            risk_task
        )

        market_rep, competitor_rep, customer_rep, financial_rep, risk_rep = results

        # Fallback if any agent returned None
        if not market_rep:
            market_rep = await self.market_agent.run(startup_info)
        if not competitor_rep:
            competitor_rep = await self.competitor_agent.run(startup_info)
        if not customer_rep:
            customer_rep = await self.customer_agent.run(startup_info)
        if not financial_rep:
            financial_rep = await self.financial_agent.run(startup_info, metric_comparisons)
        if not risk_rep:
            risk_rep = await self.risk_agent.run(startup_info)

        # Aggregate sources
        all_sources: List[Source] = []
        all_sources.extend(market_rep.sources)
        all_sources.extend(competitor_rep.sources)

        await stream_manager.broadcast_log(job_id, "Phase 2: Aggregating shared intelligence into Validator/Scorer Agent...")

        # 3. Phase 2: Validator / Scorer Agent
        reliability_rep = await self.scorer_agent.run(
            job_id=job_id,
            startup_info=startup_info,
            market=market_rep,
            competitors=competitor_rep,
            customers=customer_rep,
            financial=financial_rep,
            risk=risk_rep,
            assumptions=assumptions,
            contradictions=contradictions,
            sources=all_sources,
            notify_cb=agent_notify
        )

        await stream_manager.broadcast_log(job_id, "Phase 3: Synthesizing 30-60-90 day execution roadmap...")

        # 4. Phase 3: Execution Planner Agent
        execution_plan = await self.planner_agent.run(
            startup_info=startup_info,
            reliability_report=reliability_rep,
            notify_cb=agent_notify
        )

        # 5. Assemble Full Report
        agent_statuses = [
            self.market_agent.status,
            self.competitor_agent.status,
            self.customer_agent.status,
            self.financial_agent.status,
            self.risk_agent.status,
            self.scorer_agent.status,
            self.planner_agent.status
        ]

        full_report = FullReport(
            job_id=job_id,
            mode=mode,
            status="completed",
            reliability=reliability_rep,
            market=market_rep,
            competitors=competitor_rep,
            customers=customer_rep,
            financial=financial_rep,
            risk=risk_rep,
            execution_plan=execution_plan,
            agent_statuses=agent_statuses
        )

        # Save to SQLite
        save_report(
            job_id=job_id,
            mode=mode,
            startup_name=reliability_rep.startup_name,
            overall_score=reliability_rep.overall_score,
            score_badge=reliability_rep.score_badge,
            verdict=reliability_rep.verdict_title,
            report_data=full_report.model_dump()
        )

        # Broadcast completion
        await stream_manager.broadcast_complete(job_id, full_report.model_dump())
        return full_report

orchestrator = Orchestrator()
