from typing import List, Literal
from pydantic import BaseModel, Field

TaskPriority = Literal["High", "Medium", "Low"]

class ExecutionTask(BaseModel):
    title: str = Field(..., description="Actionable task name")
    description: str = Field(..., description="Concrete steps to execute")
    owner_role: str = Field(..., description="Responsible role, e.g. 'Founding Engineer', 'Product Lead', 'Growth Marketer'")
    priority: TaskPriority = "High"
    success_metric: str = Field(..., description="Measurable KPI, e.g. '20 beta interviews completed' or 'CAC reduced < ₹2500'")

class RoadmapPhase(BaseModel):
    phase_name: Literal["Day 1-30", "Day 31-60", "Day 61-90"]
    objective: str = Field(..., description="High-level milestone goal for this 30-day block")
    tasks: List[ExecutionTask] = Field(..., min_length=2)

class ExecutionPlan(BaseModel):
    primary_goal: str = Field(..., description="Overarching 90-day North Star metric")
    phases: List[RoadmapPhase] = Field(..., min_length=3, max_length=3)
    critical_risk_mitigation: str = Field(..., description="Key failure trap to avoid during execution")
