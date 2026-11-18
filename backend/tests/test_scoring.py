import pytest
from app.scoring.engine import (
    calculate_overall_score,
    determine_pillar_status,
    calculate_confidence,
    summarize_pillars
)
from app.schemas.scoring_schemas import PillarScore

def test_idea_stage_scoring_excludes_financial_pillars():
    # In Idea mode, unit economics, traction growth, and financial health are excluded
    raw_scores = {
        "problem_solution_fit": 8.0,
        "market_size_timing": 8.0,
        "competition_moat": 7.0,
        "customer_demand": 8.0,
        "business_model": 7.0,
        "unit_economics": 0.0,      # should be excluded
        "team_execution": 7.0,
        "traction_growth": 0.0,     # should be excluded
        "financial_health": 0.0,    # should be excluded
        "legal_compliance": 0.0
    }
    
    overall, weights = calculate_overall_score("idea", raw_scores)
    
    # Check that excluded pillars have 0 weight
    assert "unit_economics" not in weights or weights["unit_economics"] == 0.0
    assert "traction_growth" not in weights or weights["traction_growth"] == 0.0
    assert "financial_health" not in weights or weights["financial_health"] == 0.0
    
    # Active weights must sum to 1.0 (with slight float margin)
    assert abs(sum(weights.values()) - 1.0) < 0.001
    
    # Overall score should be high (~7.7), definitely not dragged down by 0.0 financial scores
    assert overall >= 7.0

def test_running_startup_scoring_includes_all_ten_pillars():
    raw_scores = {
        "problem_solution_fit": 7.5,
        "market_size_timing": 8.0,
        "competition_moat": 7.0,
        "customer_demand": 7.5,
        "business_model": 8.0,
        "unit_economics": 8.5,
        "team_execution": 7.0,
        "traction_growth": 8.0,
        "financial_health": 8.5,
        "legal_compliance": 7.0
    }
    
    overall, weights = calculate_overall_score("running", raw_scores)
    assert len(weights) == 10
    assert abs(sum(weights.values()) - 1.0) < 0.001
    assert overall >= 7.5

def test_determine_pillar_status():
    assert determine_pillar_status(8.5) == "Strong"
    assert determine_pillar_status(7.0) == "Strong"
    assert determine_pillar_status(6.9) == "Needs Work"
    assert determine_pillar_status(4.0) == "Needs Work"
    assert determine_pillar_status(3.9) == "Risk"
    assert determine_pillar_status(1.2) == "Risk"

def test_confidence_calculation():
    # If all fields assumed in running mode, confidence is Low
    assert calculate_confidence("running", assumed_count=9, total_relevant_fields=10) == "Low"
    # If 0 fields assumed in running mode, confidence is High
    assert calculate_confidence("running", assumed_count=0, total_relevant_fields=10) == "High"
    # Idea mode with 0 assumptions
    assert calculate_confidence("idea", assumed_count=0) == "Medium"
