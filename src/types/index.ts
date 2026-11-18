export type Mode = 'idea' | 'running';
export type Currency = 'INR' | 'USD';

export interface Source {
  title: string;
  url?: string;
  snippet?: string;
  is_estimate: boolean;
}

export interface Assumption {
  field_name: string;
  assumed_value: string;
  reason: string;
  industry_benchmark_source?: string;
}

export type AgentStatusState = 'waiting' | 'running' | 'done' | 'failed';

export interface AgentStatus {
  agent_id: string;
  name: string;
  state: AgentStatusState;
  message: string;
  elapsed_ms?: number;
  error?: string;
}

export interface TamSamSomItem {
  value_display: string;
  plain_explanation: string;
  methodology: string;
}

export interface MarketReport {
  tam: TamSamSomItem;
  sam: TamSamSomItem;
  som: TamSamSomItem;
  cagr_growth_rate: string;
  timing_assessment: string;
  key_trends: string[];
  summary: string;
  sources: Source[];
}

export interface CompetitorItem {
  name: string;
  type: string;
  strengths: string[];
  weaknesses: string[];
  pricing_model: string;
  url?: string;
}

export interface CompetitorReport {
  competitors: CompetitorItem[];
  positioning_gap: string;
  moat_assessment: string;
  sources: Source[];
}

export interface PersonaItem {
  name: string;
  role_demographics: string;
  core_pain_point: string;
  current_alternative: string;
  willingness_to_pay: string;
}

export interface CustomerReport {
  personas: PersonaItem[];
  demand_evidence: string;
  acquisition_channels: string[];
  sources: Source[];
}

export interface MetricComparison {
  metric_name: string;
  user_value: string;
  benchmark_range: string;
  status: string;
  verdict: string;
}

export interface FinancialReport {
  business_model_evaluation: string;
  unit_economics_analysis: string;
  runway_burn_status: string;
  metric_comparisons: MetricComparison[];
  key_recommendation: string;
}

export interface RiskItem {
  category: string;
  risk_title: string;
  severity: string;
  mitigation_strategy: string;
  governing_framework?: string;
}

export interface RiskReport {
  overall_risk_level: string;
  risks: RiskItem[];
  compliance_roadmap: string;
}

export type PillarStatus = 'Strong' | 'Needs Work' | 'Risk' | 'Not Applicable';

export interface PillarScore {
  pillar_id: string;
  name: string;
  score: number | null;
  status: PillarStatus;
  what_we_found: string;
  benchmark_healthy_range: string;
  recommended_fix: string;
  evidence_basis: string;
  confidence: 'High' | 'Medium' | 'Low';
  weight: number;
}

export interface ReliabilitySummary {
  strong_count: number;
  needs_work_count: number;
  risk_count: number;
  strong_pillars: string[];
  needs_work_pillars: string[];
  risk_pillars: string[];
}

export interface ContradictionFlag {
  severity: 'warning' | 'critical';
  field_a: string;
  field_b: string;
  message: string;
}

export interface ReliabilityReport {
  job_id: string;
  mode: Mode;
  created_at: string;
  startup_name: string;
  tagline: string;
  industry: string;
  target_market: string;
  overall_score: number;
  score_badge: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  assumed_fields_count: number;
  verdict_title: string;
  verdict_recommendation: 'Go' | 'Refine' | 'Pivot' | 'Scale-Ready' | 'Caution';
  verdict_narrative: string;
  summary: ReliabilitySummary;
  top_3_actions: string[];
  pillars: PillarScore[];
  assumptions_log: Assumption[];
  contradictions: ContradictionFlag[];
  sources: Source[];
}

export interface ExecutionTask {
  title: string;
  description: string;
  owner_role: string;
  priority: 'High' | 'Medium' | 'Low';
  success_metric: string;
}

export interface RoadmapPhase {
  phase_name: 'Day 1-30' | 'Day 31-60' | 'Day 61-90';
  objective: string;
  tasks: ExecutionTask[];
}

export interface ExecutionPlan {
  primary_goal: string;
  phases: RoadmapPhase[];
  critical_risk_mitigation: string;
}

export interface FullReport {
  job_id: string;
  mode: Mode;
  status: string;
  reliability: ReliabilityReport;
  market: MarketReport;
  competitors: CompetitorReport;
  customers: CustomerReport;
  financial: FinancialReport;
  risk: RiskReport;
  execution_plan: ExecutionPlan;
  agent_statuses: AgentStatus[];
  disclaimer: string;
}

export interface PastReportItem {
  job_id: string;
  mode: Mode;
  startup_name: string;
  overall_score: number;
  score_badge: string;
  verdict: string;
  created_at: string;
}

export interface IdeaDemo {
  id: string;
  chip_label: string;
  title: string;
  description: string;
  industry: string;
  target_market: string;
}

export interface StartupDemo {
  id: string;
  name: string;
  profile_label: string;
  description: string;
  stage: string;
  industry: string;
  website: string;
  traction: {
    total_users: number;
    paying_customers: number;
    monthly_revenue_inr: number;
    monthly_growth_pct: number;
  };
  business: {
    pricing_inr: number;
    cac_inr: number;
    gross_margin_pct: number;
    churn_pct: number;
    runway_months: number;
    monthly_burn_inr: number;
    funding_raised_inr: number;
  };
  team_legal: {
    team_size: number;
    founder_experience: string;
    licenses_ip_status: string;
  };
}
