from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from app.schemas.common import Assumption, Source
from app.schemas.input_schemas import ContradictionFlag

PillarStatus = Literal["Strong", "Needs Work", "Risk", "Not Applicable"]

class PillarScore(BaseModel):
    pillar_id: str = Field(..., description="e.g. problem_solution_fit")
    name: str = Field(..., description="Human-readable pillar name")
    score: Optional[float] = Field(None, description="Score 0.0 to 10.0; None if Not Applicable")
    status: PillarStatus
    what_we_found: str = Field(..., description="Concise assessment findings")
    benchmark_healthy_range: str = Field(..., description="Expected benchmark standard")
    recommended_fix: str = Field(..., description="Actionable fix or next step")
    evidence_basis: str = Field(..., description="User data, web research citation, or assumed benchmark")
    confidence: Literal["High", "Medium", "Low"]
    weight: float = Field(..., description="Effective weight in overall reliability score")

class ReliabilitySummary(BaseModel):
    strong_count: int
    needs_work_count: int
    risk_count: int
    strong_pillars: List[str]
    needs_work_pillars: List[str]
    risk_pillars: List[str]

class ReliabilityReport(BaseModel):
    job_id: str
    mode: Literal["idea", "running"]
    created_at: str
    startup_name: str
    tagline: str
    industry: str
    target_market: str
    
    # Reliability Dashboard Metrics
    overall_score: float = Field(..., description="0.0 to 10.0 overall reliability or validation score")
    score_badge: Literal["🟢 Strong", "🟡 Moderate", "🔴 At Risk"]
    confidence_level: Literal["High", "Medium", "Low"]
    assumed_fields_count: int
    
    # Stage-aware Verdict
    verdict_title: str = Field(..., description="e.g. 'Go - Strong Foundation' / 'Refine - Address Unit Economics' / 'Pivot'")
    verdict_recommendation: Literal["Go", "Refine", "Pivot", "Scale-Ready", "Caution"]
    verdict_narrative: str
    
    summary: ReliabilitySummary
    top_3_actions: List[str] = Field(..., min_length=3, max_length=3)
    
    # 10 Pillars
    pillars: List[PillarScore]
    
    # Assumptions & Contradictions
    assumptions_log: List[Assumption] = Field(default_factory=list)
    contradictions: List[ContradictionFlag] = Field(default_factory=list)
    sources: List[Source] = Field(default_factory=list)
