from typing import Literal, Optional, List
from pydantic import BaseModel, Field

class Source(BaseModel):
    title: str = Field(..., description="Title of the source or publication")
    url: Optional[str] = Field(None, description="URL or reference link; empty if AI estimate")
    snippet: Optional[str] = Field(None, description="Brief snippet or context from source")
    is_estimate: bool = Field(False, description="True if based on AI synthetic estimation rather than direct external URL")

class Assumption(BaseModel):
    field_name: str = Field(..., description="The parameter or metric assumed")
    assumed_value: str = Field(..., description="The specific value used in analysis")
    reason: str = Field(..., description="Why this assumption was applied, e.g. user skipped or industry median")
    industry_benchmark_source: Optional[str] = Field(None, description="Reference benchmark standard")

AgentStatusState = Literal["waiting", "running", "done", "failed"]

class AgentStatus(BaseModel):
    agent_id: str
    name: str
    state: AgentStatusState = "waiting"
    message: str = "Waiting to execute..."
    elapsed_ms: Optional[int] = None
    error: Optional[str] = None

class StreamEvent(BaseModel):
    event_type: Literal["agent_status", "log", "complete", "error"]
    job_id: str
    agent_id: Optional[str] = None
    state: Optional[AgentStatusState] = None
    message: str
    data: Optional[dict] = None
