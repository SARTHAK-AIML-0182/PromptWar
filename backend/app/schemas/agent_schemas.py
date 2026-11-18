from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.common import Source

class TamSamSomItem(BaseModel):
    value_display: str = Field(..., description="e.g. $45 Billion or ₹3,50,000 Crore")
    plain_explanation: str = Field(..., description="One-line simple explanation for non-technical founders")
    methodology: str = Field(..., description="Brief basis or estimation approach")

class MarketReport(BaseModel):
    tam: TamSamSomItem
    sam: TamSamSomItem
    som: TamSamSomItem
    cagr_growth_rate: str = Field(..., description="e.g. 18.5% YoY (2024-2030)")
    timing_assessment: str = Field(..., description="Why now? Tailwinds, market catalysts or shifts")
    key_trends: List[str] = Field(..., min_length=3, max_length=5, description="3 to 5 industry trends")
    summary: str = Field(..., description="Executive summary of market attractiveness")
    sources: List[Source] = Field(default_factory=list)

class CompetitorItem(BaseModel):
    name: str = Field(..., description="Competitor company or platform name")
    type: str = Field("Direct", description="Direct, Indirect, or Incumbent")
    strengths: List[str] = Field(..., description="Key competitive strengths")
    weaknesses: List[str] = Field(..., description="Key vulnerabilities or gaps")
    pricing_model: str = Field(..., description="Known pricing structure or estimate")
    url: Optional[str] = Field(None, description="Website if available")

class CompetitorReport(BaseModel):
    competitors: List[CompetitorItem] = Field(..., min_length=3, max_length=5)
    positioning_gap: str = Field(..., description="Identified whitespace or underserved niche")
    moat_assessment: str = Field(..., description="Defensibility evaluation: tech, data, network effect, or switching costs")
    sources: List[Source] = Field(default_factory=list)

class PersonaItem(BaseModel):
    name: str = Field(..., description="Persona title, e.g. 'Ramesh - Progressive Paddy Farmer'")
    role_demographics: str = Field(..., description="Role, geography, scale, or income bracket")
    core_pain_point: str = Field(..., description="The acute daily pain or inefficiency")
    current_alternative: str = Field(..., description="What they use today (manual, legacy software, agency)")
    willingness_to_pay: str = Field(..., description="Price sensitivity and estimated budget willingness")

class CustomerReport(BaseModel):
    personas: List[PersonaItem] = Field(..., min_length=2, max_length=3)
    demand_evidence: str = Field(..., description="Signals of active customer demand or search volume")
    acquisition_channels: List[str] = Field(..., description="Top 2-3 realistic channels to reach these buyers")
    sources: List[Source] = Field(default_factory=list)

class MetricComparison(BaseModel):
    metric_name: str
    user_value: str
    benchmark_range: str
    status: str = Field(..., description="'Healthy', 'Needs Work', or 'Warning'")
    verdict: str

class FinancialReport(BaseModel):
    business_model_evaluation: str = Field(..., description="Analysis of pricing logic and recurring scalability")
    unit_economics_analysis: str = Field(..., description="CAC, LTV, LTV:CAC, gross margin, and payback commentary")
    runway_burn_status: str = Field(..., description="Runway health and capital efficiency")
    metric_comparisons: List[MetricComparison] = Field(default_factory=list)
    key_recommendation: str = Field(..., description="High-impact financial or pricing intervention")

class RiskItem(BaseModel):
    category: str = Field(..., description="Legal, Regulatory, Licensing, IP, or Data Privacy")
    risk_title: str
    severity: str = Field(..., description="'High', 'Medium', or 'Low'")
    mitigation_strategy: str
    governing_framework: Optional[str] = Field(None, description="e.g. DPDP Act 2023, RBI Guidelines, CDSCO, GDPR")

class RiskReport(BaseModel):
    overall_risk_level: str = Field(..., description="'Low', 'Moderate', or 'Elevated'")
    risks: List[RiskItem] = Field(..., min_length=2)
    compliance_roadmap: str = Field(..., description="Immediate compliance steps needed")
