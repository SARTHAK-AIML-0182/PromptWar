import json
from pathlib import Path
from typing import Dict, Any, List, Tuple
from app.config import settings
from app.schemas.agent_schemas import MetricComparison
from app.schemas.common import Assumption
from app.schemas.input_schemas import ContradictionFlag, RunningStartupInput

def load_benchmarks() -> Dict[str, Any]:
    p = settings.benchmarks_path
    if p.exists():
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def detect_contradictions(input_data: RunningStartupInput) -> List[ContradictionFlag]:
    flags: List[ContradictionFlag] = []
    
    t = input_data.traction
    b = input_data.business
    tl = input_data.team_legal
    
    if t:
        # Contradiction: Revenue > 0 but paying customers == 0
        if t.monthly_revenue and t.monthly_revenue > 0 and (t.paying_customers is not None and t.paying_customers == 0):
            flags.append(ContradictionFlag(
                severity="critical",
                field_a="monthly_revenue",
                field_b="paying_customers",
                message=f"Revenue is reported as ₹{t.monthly_revenue:,.0f}/mo, but paying customers is marked as 0."
            ))
        
        # Contradiction: Paying customers > total users
        if t.paying_customers and t.total_users and t.paying_customers > t.total_users:
            flags.append(ContradictionFlag(
                severity="critical",
                field_a="paying_customers",
                field_b="total_users",
                message=f"Paying customers ({t.paying_customers}) exceeds reported total users ({t.total_users})."
            ))

    if b:
        # Contradiction: Runway < 6 months but monthly burn == 0
        if b.runway_months and b.runway_months < 6 and (b.monthly_burn is not None and b.monthly_burn == 0):
            flags.append(ContradictionFlag(
                severity="warning",
                field_a="runway_months",
                field_b="monthly_burn",
                message="Reported runway is short (< 6 months) while monthly burn is entered as ₹0."
            ))

        # Contradiction: High growth but CAC is 0
        if t and t.monthly_growth_pct and t.monthly_growth_pct > 25 and (b.cac is not None and b.cac == 0):
            flags.append(ContradictionFlag(
                severity="warning",
                field_a="monthly_growth_pct",
                field_b="cac",
                message="High growth (> 25% MoM) with zero reported CAC implies purely viral/organic acquisition or missing spend tracking."
            ))

    if tl:
        if tl.team_size is not None and tl.team_size == 0:
            flags.append(ContradictionFlag(
                severity="warning",
                field_a="team_size",
                field_b="startup_name",
                message="Team size was entered as 0 (minimum 1 founder assumed)."
            ))

    return flags

def evaluate_metrics(
    industry: str,
    startup: RunningStartupInput
) -> Tuple[List[MetricComparison], List[Assumption]]:
    benchmarks = load_benchmarks()
    # Normalize industry lookup
    matched_industry = "General / Other"
    for key in benchmarks.keys():
        if key.lower() in industry.lower():
            matched_industry = key
            break
            
    b_data = benchmarks.get(matched_industry, benchmarks.get("General / Other", {}))
    
    comparisons: List[MetricComparison] = []
    assumptions: List[Assumption] = []
    
    b = startup.business
    t = startup.traction
    
    # 1. Gross Margin
    gm = b.gross_margin_pct if b and b.gross_margin_pct is not None else None
    gm_bench = b_data.get("gross_margin_pct", {"healthy_min": 60, "healthy_max": 80, "unit": "%"})
    if gm is None:
        assumed_gm = (gm_bench["healthy_min"] + gm_bench["healthy_max"]) / 2
        assumptions.append(Assumption(
            field_name="Gross Margin %",
            assumed_value=f"{assumed_gm:.1f}%",
            reason="You did not provide Gross Margin; industry median was assumed.",
            industry_benchmark_source=f"{matched_industry} standard range ({gm_bench['healthy_min']}-{gm_bench['healthy_max']}%)"
        ))
        gm = assumed_gm
        
    gm_status = "Healthy" if gm >= gm_bench["healthy_min"] else ("Needs Work" if gm >= gm_bench["healthy_min"] * 0.7 else "Warning")
    comparisons.append(MetricComparison(
        metric_name="Gross Margin",
        user_value=f"{gm:.1f}%",
        benchmark_range=f"{gm_bench['healthy_min']}–{gm_bench['healthy_max']}%",
        status=gm_status,
        verdict="Healthy unit profitability" if gm_status == "Healthy" else "Margin compression risk"
    ))

    # 2. Churn
    churn = b.churn_pct if b and b.churn_pct is not None else None
    churn_bench = b_data.get("monthly_churn_pct", {"healthy_min": 1.0, "healthy_max": 4.0, "unit": "%"})
    if churn is None:
        assumed_churn = (churn_bench["healthy_min"] + churn_bench["healthy_max"]) / 2
        assumptions.append(Assumption(
            field_name="Monthly Churn %",
            assumed_value=f"{assumed_churn:.1f}%",
            reason="You did not provide Churn rate; industry benchmark was assumed.",
            industry_benchmark_source=f"{matched_industry} standard range ({churn_bench['healthy_min']}-{churn_bench['healthy_max']}%)"
        ))
        churn = assumed_churn
        
    churn_status = "Healthy" if churn <= churn_bench["healthy_max"] else ("Needs Work" if churn <= churn_bench["healthy_max"] * 1.8 else "Warning")
    comparisons.append(MetricComparison(
        metric_name="Monthly Churn",
        user_value=f"{churn:.1f}%",
        benchmark_range=f"{churn_bench['healthy_min']}–{churn_bench['healthy_max']}%",
        status=churn_status,
        verdict="Strong cohort retention" if churn_status == "Healthy" else "Customer leakage threatens scale"
    ))

    # 3. Runway
    runway = b.runway_months if b and b.runway_months is not None else None
    runway_bench = b_data.get("runway_months", {"healthy_min": 12, "healthy_max": 24, "unit": "months"})
    if runway is None:
        assumed_runway = 12.0
        assumptions.append(Assumption(
            field_name="Runway (Months)",
            assumed_value=f"{assumed_runway:.0f} months",
            reason="Runway was skipped; baseline safe threshold of 12 months was assumed.",
            industry_benchmark_source="Seed stage safety threshold"
        ))
        runway = assumed_runway
        
    runway_status = "Healthy" if runway >= runway_bench["healthy_min"] else ("Needs Work" if runway >= 6 else "Warning")
    comparisons.append(MetricComparison(
        metric_name="Cash Runway",
        user_value=f"{runway:.0f} mo",
        benchmark_range=f"{runway_bench['healthy_min']}–{runway_bench['healthy_max']} mo",
        status=runway_status,
        verdict="Adequate capitalization" if runway_status == "Healthy" else "Immediate capital preservation / fundraise needed"
    ))

    # 4. MoM Growth
    growth = t.monthly_growth_pct if t and t.monthly_growth_pct is not None else None
    growth_bench = b_data.get("mom_growth_pct", {"healthy_min": 10, "healthy_max": 25, "unit": "%"})
    if growth is None:
        assumed_growth = 10.0
        assumptions.append(Assumption(
            field_name="MoM Growth %",
            assumed_value=f"{assumed_growth:.1f}%",
            reason="Monthly growth was omitted; baseline early-stage growth of 10% was assumed.",
            industry_benchmark_source=f"{matched_industry} early-stage baseline"
        ))
        growth = assumed_growth
        
    growth_status = "Healthy" if growth >= growth_bench["healthy_min"] else ("Needs Work" if growth >= 5 else "Warning")
    comparisons.append(MetricComparison(
        metric_name="MoM Growth",
        user_value=f"{growth:.1f}%",
        benchmark_range=f"{growth_bench['healthy_min']}–{growth_bench['healthy_max']}%",
        status=growth_status,
        verdict="High growth traction" if growth_status == "Healthy" else "Sluggish acquisition momentum"
    ))

    # 5. CAC check if provided
    cac = b.cac if b and b.cac is not None else None
    if cac is None:
        median_cac = b_data.get("median_cac_inr", 3500)
        assumptions.append(Assumption(
            field_name="CAC",
            assumed_value=f"₹{median_cac:,.0f}",
            reason="You did not provide Customer Acquisition Cost (CAC); industry median was assumed.",
            industry_benchmark_source=f"{matched_industry} typical acquisition benchmark"
        ))

    return comparisons, assumptions
