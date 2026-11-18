import pytest
from app.schemas.input_schemas import RunningStartupInput, RunningStartupTraction, RunningStartupBusiness, RunningStartupTeamLegal
from app.scoring.benchmark_matcher import evaluate_metrics, detect_contradictions

def test_detect_contradictions():
    startup = RunningStartupInput(
        startup_name="TestCo",
        description="A test startup for validation testing",
        stage="Seed",
        industry="SaaS",
        traction=RunningStartupTraction(
            monthly_revenue=100000.0,
            paying_customers=0,  # Contradiction: revenue > 0 with 0 paying customers
            total_users=100
        ),
        business=RunningStartupBusiness(
            runway_months=3.0,
            monthly_burn=0.0  # Contradiction: short runway with 0 burn
        ),
        team_legal=RunningStartupTeamLegal(
            team_size=0  # Contradiction: 0 team size
        )
    )
    
    flags = detect_contradictions(startup)
    assert len(flags) >= 2
    flag_fields = [f.field_a for f in flags]
    assert "monthly_revenue" in flag_fields
    assert "runway_months" in flag_fields

def test_evaluate_metrics_and_assumptions():
    # Test startup with missing CAC, Gross Margin and Churn
    startup = RunningStartupInput(
        startup_name="TestCo",
        description="A test SaaS startup missing key metrics",
        stage="Seed",
        industry="SaaS",
        traction=RunningStartupTraction(
            monthly_growth_pct=15.0
        ),
        business=RunningStartupBusiness(
            runway_months=18.0
        )
    )
    
    comparisons, assumptions = evaluate_metrics("SaaS", startup)
    
    assert len(comparisons) > 0
    # Should have assumptions for missing gross margin, churn, cac
    assumed_field_names = [a.field_name for a in assumptions]
    assert "Gross Margin %" in assumed_field_names
    assert "Monthly Churn %" in assumed_field_names
    assert "CAC" in assumed_field_names
