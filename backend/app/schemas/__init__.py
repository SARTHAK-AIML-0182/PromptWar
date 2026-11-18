from pydantic import BaseModel
from typing import List, Optional

from app.schemas.common import Source, Assumption, AgentStatus, StreamEvent
from app.schemas.input_schemas import (
    StartupInput,
    IdeaStageInput,
    RunningStartupInput,
    ContradictionFlag
)
from app.schemas.agent_schemas import (
    MarketReport,
    CompetitorReport,
    CustomerReport,
    FinancialReport,
    RiskReport
)
from app.schemas.scoring_schemas import (
    PillarScore,
    ReliabilitySummary,
    ReliabilityReport
)
from app.schemas.execution_schemas import (
    ExecutionTask,
    RoadmapPhase,
    ExecutionPlan
)

class FullReport(BaseModel):
    job_id: str
    mode: str
    status: str
    reliability: ReliabilityReport
    market: MarketReport
    competitors: CompetitorReport
    customers: CustomerReport
    financial: FinancialReport
    risk: RiskReport
    execution_plan: ExecutionPlan
    agent_statuses: List[AgentStatus]
    disclaimer: str = "AI-based analysis. Not investment or legal advice."
