import json
from typing import Dict, Any, List, Tuple
from app.config import settings
from app.schemas.scoring_schemas import PillarScore, ReliabilitySummary, PillarStatus
from app.schemas.common import Assumption

def load_weights() -> Dict[str, Any]:
    p = settings.weights_path
    if p.exists():
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "running_startup": {
            "problem_solution_fit": 0.10, "market_size_timing": 0.10, "competition_moat": 0.10,
            "customer_demand": 0.10, "business_model": 0.10, "unit_economics": 0.125,
            "team_execution": 0.10, "traction_growth": 0.125, "financial_health": 0.10,
            "legal_compliance": 0.05
        },
        "idea_stage": {
            "problem_solution_fit": 0.25, "market_size_timing": 0.20, "competition_moat": 0.15,
            "customer_demand": 0.20, "business_model": 0.10, "unit_economics": 0.0,
            "team_execution": 0.10, "traction_growth": 0.0, "financial_health": 0.0,
            "legal_compliance": 0.0
        },
        "idea_stage_excluded_pillars": ["unit_economics", "traction_growth", "financial_health"]
    }

def calculate_overall_score(
    mode: str,
    raw_pillar_scores: Dict[str, float]
) -> Tuple[float, Dict[str, float]]:
    """Calculates normalized overall weighted score (0.0 - 10.0) based on mode."""
    config = load_weights()
    weights_dict = config.get("idea_stage" if mode == "idea" else "running_startup", {})
    excluded = config.get("idea_stage_excluded_pillars", []) if mode == "idea" else []
    
    # Filter active pillars
    active_weights = {k: v for k, v in weights_dict.items() if k not in excluded and v > 0}
    total_weight = sum(active_weights.values())
    if total_weight <= 0:
        total_weight = 1.0
        
    normalized_weights = {k: v / total_weight for k, v in active_weights.items()}
    
    overall = 0.0
    for pillar_id, weight in normalized_weights.items():
        score = raw_pillar_scores.get(pillar_id, 5.0)
        overall += score * weight
        
    overall = round(max(0.0, min(10.0, overall)), 1)
    return overall, normalized_weights

def determine_pillar_status(score: float) -> PillarStatus:
    if score >= 7.0:
        return "Strong"
    elif score >= 4.0:
        return "Needs Work"
    else:
        return "Risk"

def summarize_pillars(pillars: List[PillarScore]) -> ReliabilitySummary:
    strong = [p.name for p in pillars if p.status == "Strong"]
    needs_work = [p.name for p in pillars if p.status == "Needs Work"]
    risk = [p.name for p in pillars if p.status == "Risk"]
    
    return ReliabilitySummary(
        strong_count=len(strong),
        needs_work_count=len(needs_work),
        risk_count=len(risk),
        strong_pillars=strong,
        needs_work_pillars=needs_work,
        risk_pillars=risk
    )

def calculate_confidence(
    mode: str,
    assumed_count: int,
    total_relevant_fields: int = 10
) -> str:
    """Computes transparent confidence level: High, Medium, Low."""
    if mode == "idea":
        # Ideas have higher inherent uncertainty; max is Medium unless extensive detail
        return "Medium" if assumed_count <= 1 else "Low"
    else:
        ratio = (total_relevant_fields - assumed_count) / max(total_relevant_fields, 1)
        if ratio >= 0.8:
            return "High"
        elif ratio >= 0.45:
            return "Medium"
        else:
            return "Low"
