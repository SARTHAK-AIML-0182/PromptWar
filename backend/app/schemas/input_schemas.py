from typing import Literal, Optional, List
from pydantic import BaseModel, Field, model_validator

StageType = Literal["Idea", "Pre-seed", "Seed", "Series A", "Growth"]

class IdeaStageInput(BaseModel):
    idea_description: str = Field(..., min_length=5, description="Full description of the startup idea")
    industry: Optional[str] = Field("General / Other", description="Industry domain")
    target_market: Optional[str] = Field("India", description="Target geography or demographic")

class RunningStartupTraction(BaseModel):
    total_users: Optional[int] = Field(None, description="Total registered or active users")
    paying_customers: Optional[int] = Field(None, description="Number of paying customers")
    monthly_revenue: Optional[float] = Field(None, description="Monthly recurring/gross revenue in user currency")
    monthly_growth_pct: Optional[float] = Field(None, description="Month-over-month growth rate percentage")

class RunningStartupBusiness(BaseModel):
    pricing: Optional[float] = Field(None, description="Average price point / ARPU")
    cac: Optional[float] = Field(None, description="Customer Acquisition Cost")
    gross_margin_pct: Optional[float] = Field(None, description="Gross profit margin %")
    churn_pct: Optional[float] = Field(None, description="Monthly customer or revenue churn %")
    runway_months: Optional[float] = Field(None, description="Cash runway in months")
    monthly_burn: Optional[float] = Field(None, description="Net monthly burn rate")
    funding_raised: Optional[float] = Field(None, description="Total funding raised to date")

class RunningStartupTeamLegal(BaseModel):
    team_size: Optional[int] = Field(None, description="Total headcount")
    founder_experience: Optional[str] = Field(None, description="Founder background & domain track record")
    licenses_ip_status: Optional[str] = Field(None, description="Patents, regulatory licenses, or compliance status")

class RunningStartupInput(BaseModel):
    startup_name: str = Field(..., min_length=2, description="Name of startup")
    description: str = Field(..., min_length=10, description="One-line elevator pitch / description")
    stage: StageType = Field("Seed", description="Operating stage")
    industry: str = Field("SaaS", description="Core industry")
    website: Optional[str] = Field(None, description="Startup website or demo link")
    traction: Optional[RunningStartupTraction] = Field(default_factory=RunningStartupTraction)
    business: Optional[RunningStartupBusiness] = Field(default_factory=RunningStartupBusiness)
    team_legal: Optional[RunningStartupTeamLegal] = Field(default_factory=RunningStartupTeamLegal)

class StartupInput(BaseModel):
    mode: Literal["idea", "running"] = Field(..., description="Operating mode")
    currency: Literal["INR", "USD"] = Field("INR", description="Preferred display currency")
    idea_input: Optional[IdeaStageInput] = None
    startup_input: Optional[RunningStartupInput] = None

    @model_validator(mode="after")
    def validate_mode_payload(self):
        if self.mode == "idea" and not self.idea_input:
            raise ValueError("idea_input must be provided when mode is 'idea'")
        if self.mode == "running" and not self.startup_input:
            raise ValueError("startup_input must be provided when mode is 'running'")
        return self

class ContradictionFlag(BaseModel):
    severity: Literal["warning", "critical"]
    field_a: str
    field_b: str
    message: str
