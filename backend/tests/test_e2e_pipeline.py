import asyncio
import pytest
import uuid
from app.schemas.input_schemas import (
    StartupInput,
    IdeaStageInput,
    RunningStartupInput,
    RunningStartupTraction,
    RunningStartupBusiness,
    RunningStartupTeamLegal
)
from app.orchestrator.engine import orchestrator
from app.storage.db import get_report

def test_e2e_idea_stage_pipeline():
    async def _test():
        job_id = f"test-idea-{uuid.uuid4()}"
        payload = StartupInput(
            mode="idea",
            currency="INR",
            idea_input=IdeaStageInput(
                idea_description="AI-driven pest and crop disease detection for Indian smallholder farmers via WhatsApp.",
                industry="AgriTech",
                target_market="India"
            )
        )

        report = await orchestrator.run_pipeline(job_id, payload)
        
        assert report.job_id == job_id
        assert report.mode == "idea"
        assert report.reliability.overall_score > 0
        assert report.reliability.verdict_recommendation in ["Go", "Refine", "Pivot"]
        assert len(report.reliability.pillars) == 10
        
        # Unit economics, traction, financial health must be "Not Applicable" for idea stage
        na_pillars = [p for p in report.reliability.pillars if p.status == "Not Applicable"]
        assert len(na_pillars) == 3
        na_ids = [p.pillar_id for p in na_pillars]
        assert "unit_economics" in na_ids
        assert "traction_growth" in na_ids
        assert "financial_health" in na_ids

        # Check that roadmap is generated
        assert len(report.execution_plan.phases) == 3
        assert len(report.market.key_trends) >= 3
        assert len(report.competitors.competitors) >= 3
        assert len(report.customers.personas) >= 2

        # Check SQLite persistence
        stored = get_report(job_id)
        assert stored is not None
        assert stored["job_id"] == job_id

    asyncio.run(_test())

def test_e2e_running_startup_pipeline():
    async def _test():
        job_id = f"test-startup-{uuid.uuid4()}"
        payload = StartupInput(
            mode="running",
            currency="INR",
            startup_input=RunningStartupInput(
                startup_name="KavachAI",
                description="Autonomous API security testing and runtime anomaly detection for FinTech and HealthTech.",
                stage="Seed",
                industry="SaaS",
                traction=RunningStartupTraction(
                    total_users=15000,
                    paying_customers=35,
                    monthly_revenue=1500000.0,
                    monthly_growth_pct=16.0
                ),
                business=RunningStartupBusiness(
                    pricing=40000.0,
                    cac=30000.0,
                    gross_margin_pct=80.0,
                    churn_pct=1.5,
                    runway_months=18.0,
                    monthly_burn=800000.0,
                    funding_raised=20000000.0
                ),
                team_legal=RunningStartupTeamLegal(
                    team_size=8,
                    founder_experience="Ex-Security lead at AWS",
                    licenses_ip_status="Provisional patent filed"
                )
            )
        )

        report = await orchestrator.run_pipeline(job_id, payload)
        
        assert report.job_id == job_id
        assert report.mode == "running"
        assert report.reliability.overall_score >= 7.0  # Healthy metrics should score high
        assert report.reliability.score_badge == "🟢 Strong"
        
        # In running mode, all 10 pillars must have numeric scores
        for p in report.reliability.pillars:
            assert p.score is not None
            assert p.status in ["Strong", "Needs Work", "Risk"]

        # Metric comparisons generated
        assert len(report.financial.metric_comparisons) > 0

    asyncio.run(_test())
