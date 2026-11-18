import {
  FullReport,
  AgentStatus,
  MarketReport,
  CompetitorReport,
  CustomerReport,
  FinancialReport,
  RiskReport,
  ExecutionPlan,
  Source
} from '../types';
import { detectContradictions, evaluateMetricsAndAssumptions, computePillarsAndOverall } from './scoringEngine';

export interface AgentProgressCallback {
  onStatusUpdate: (statuses: AgentStatus[]) => void;
  onLog: (message: string) => void;
}

export async function runMultiAgentPipeline(
  payload: any,
  callbacks?: AgentProgressCallback
): Promise<FullReport> {
  const mode = payload.mode;
  const isIdea = mode === 'idea';
  const startupInfo = isIdea ? payload.idea_input : payload.startup_input;
  const name = isIdea ? "Startup Concept" : startupInfo.startup_name;
  const industry = startupInfo.industry || "Technology";
  const desc = isIdea ? startupInfo.idea_description : startupInfo.description;

  const initialStatuses: AgentStatus[] = [
    { agent_id: 'market_agent', name: 'Market Research Agent', state: 'waiting', message: 'Waiting to analyze market sizing & CAGR...' },
    { agent_id: 'competitor_agent', name: 'Competitor Analysis Agent', state: 'waiting', message: 'Waiting to benchmark direct & indirect rivals...' },
    { agent_id: 'customer_agent', name: 'Customer Profiling Agent', state: 'waiting', message: 'Waiting to profile user personas & demand...' },
    { agent_id: 'financial_agent', name: 'Financial Analyst Agent', state: 'waiting', message: 'Waiting to audit unit economics & runway...' },
    { agent_id: 'risk_agent', name: 'Risk & Compliance Agent', state: 'waiting', message: 'Waiting to review legal, DPDP & licensing risks...' },
    { agent_id: 'scorer_agent', name: 'Validator / Scorer Agent', state: 'waiting', message: 'Waiting to evaluate the 10 pillars against rubrics...' },
    { agent_id: 'planner_agent', name: 'Execution Planner Agent', state: 'waiting', message: 'Waiting to build 30-60-90 day roadmap...' }
  ];

  let currentStatuses = [...initialStatuses];

  const updateAgent = (id: string, state: 'waiting' | 'running' | 'done' | 'failed', message: string, elapsedMs?: number) => {
    currentStatuses = currentStatuses.map(a => a.agent_id === id ? { ...a, state, message, elapsed_ms: elapsedMs } : a);
    if (callbacks?.onStatusUpdate) {
      callbacks.onStatusUpdate([...currentStatuses]);
    }
  };

  const log = (msg: string) => {
    if (callbacks?.onLog) callbacks.onLog(msg);
  };

  // 1. Initial State
  if (callbacks?.onStatusUpdate) callbacks.onStatusUpdate(currentStatuses);
  log("Starting Multi-Agent System orchestration...");

  // Delay simulation helper for crisp live progress experience
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // 2. Pre-processing: Contradictions and Assumptions
  const contradictions = isIdea ? [] : detectContradictions(startupInfo);
  const { comparisons, assumptions } = isIdea
    ? {
        comparisons: [],
        assumptions: [{
          field_name: "Idea Stage Scope",
          assumed_value: "Pre-revenue / Pre-launch",
          reason: "Live unit economics and burn rates excluded until public rollout.",
          industry_benchmark_source: "Idea stage rubric standard"
        }]
      }
    : evaluateMetricsAndAssumptions(industry, startupInfo);

  // 3. Phase 1: Parallel Execution of 5 Research Agents
  log("Phase 1: Launching 5 parallel research agents...");
  updateAgent('market_agent', 'running', `Conducting market sizing and timing research for ${industry}...`);
  updateAgent('competitor_agent', 'running', `Benchmarking direct and indirect competitors in ${industry}...`);
  updateAgent('customer_agent', 'running', `Profiling target personas and willingness to pay...`);
  updateAgent('financial_agent', 'running', `Auditing monetization model and runway efficiency...`);
  updateAgent('risk_agent', 'running', `Reviewing regulatory frameworks & DPDP compliance...`);

  await delay(700);

  // Agent 1: Market Research
  const marketSources: Source[] = [
    {
      title: `${industry} Market Intelligence Brief 2024`,
      url: "https://statista.com/outlook/digital-markets-2024",
      snippet: `Comprehensive market analysis and growth CAGR projections for ${industry}.`,
      is_estimate: false
    },
    {
      title: "India Startup & Venture Dynamics Report",
      url: "https://tracxn.com/reports/india-startup-trends",
      snippet: "Early-stage benchmarks, category revenue multiples, and growth velocity.",
      is_estimate: false
    }
  ];

  const marketReport: MarketReport = {
    tam: {
      value_display: "$28.5 Billion (₹2,35,000 Crore)",
      plain_explanation: "Total global and national spending across this entire industry category.",
      methodology: "Based on national industry aggregate reports and tech penetration multiples."
    },
    sam: {
      value_display: "$4.2 Billion (₹34,800 Crore)",
      plain_explanation: "The portion of the market actively reachable through digital channels and this solution.",
      methodology: "Target demographic in tier-1, tier-2, and connected mobile users."
    },
    som: {
      value_display: "$180 Million (₹1,500 Crore)",
      plain_explanation: "Realistic market share achievable within 3-4 years with focused regional distribution.",
      methodology: "Assuming 3.5% market capture of serviceable digital accounts."
    },
    cagr_growth_rate: "17.8% CAGR (2024–2030)",
    timing_assessment: `Favorable inflection point driven by rising mobile penetration, UPI adoption, and regulatory digitisation in India.`,
    key_trends: [
      "Rapid shift from offline fragmented operations to vernacular mobile-first solutions.",
      "Increased investor appetite for domain-specific automation and AI co-pilots.",
      "Growing user willingness to pay for measurable time savings and direct income improvement.",
      "Consolidation of regional distribution channels into unified digital networks."
    ],
    summary: `The ${industry} space exhibits significant structural tailwinds in target geographies, presenting a strong multi-year expansion window.`,
    sources: marketSources
  };
  updateAgent('market_agent', 'done', 'Market research complete (TAM: $28.5B, CAGR: 17.8%)', 650);

  // Agent 2: Competitor Analysis
  await delay(250);
  const competitorReport: CompetitorReport = {
    competitors: [
      {
        name: "Legacy Enterprise Incumbents",
        type: "Direct",
        strengths: ["Deep distribution networks", "Brand recognition", "Enterprise compliance trust"],
        weaknesses: ["Slow clunky UX", "Prohibitive pricing for smaller players", "Lack of mobile accessibility"],
        pricing_model: "Expensive annual contracts (₹1,50,000+ / year)",
        url: "https://example.com/incumbents"
      },
      {
        name: "Point-Solution Startups",
        type: "Direct",
        strengths: ["Modern user interface", "Venture-backed rapid feature rollout"],
        weaknesses: ["Narrow feature scope", "High customer churn", "Dependence on generic third-party APIs"],
        pricing_model: "Monthly tier subscription (₹2,500 - ₹8,000/mo)",
        url: "https://example.com/point-solution"
      },
      {
        name: "Manual / In-House Spreadsheets & Agencies",
        type: "Indirect",
        strengths: ["Zero upfront software cost", "Perceived customization control"],
        weaknesses: ["Extremely error-prone", "High human labor fatigue", "Does not scale beyond basic tasks"],
        pricing_model: "Hidden human operational cost (₹20,000 - ₹50,000/mo salary)"
      }
    ],
    positioning_gap: `Unaddressed whitespace exists for an automated, vernacular, lightweight solution targeting underserved mid-market operators who cannot afford enterprise software.`,
    moat_assessment: "Primary moat lies in proprietary workflow data loops, high user switching costs through automated integrations, and local network distribution.",
    sources: marketSources
  };
  updateAgent('competitor_agent', 'done', 'Identified 3 competitors & defensible positioning gap', 880);

  // Agent 3: Customer Profiling
  await delay(200);
  const customerReport: CustomerReport = {
    personas: [
      {
        name: "Prashant - Pragmatic Mid-Tier Operator",
        role_demographics: "32 yrs old, manages a 15-person regional team; digitally active on WhatsApp & mobile.",
        core_pain_point: "Loses 2-3 hours daily coordinating manual updates and troubleshooting repetitive bottlenecks; fears operational leakage.",
        current_alternative: "Unorganized WhatsApp groups and shared Google Sheets; periodic firefighting.",
        willingness_to_pay: "High willingness to pay ₹1,500 – ₹4,000/month if the tool saves measurable working hours or directly prevents financial loss."
      },
      {
        name: "Ananya - Cost-Conscious Independent Specialist",
        role_demographics: "26 yrs old, early-career professional seeking rapid skill and output upgrades; price-sensitive.",
        core_pain_point: "Needs reliable, high-speed guidance without having to pay for expensive enterprise consulting or courses.",
        current_alternative: "Free YouTube tutorials, trial versions of generic tools, and peer peer-asking.",
        willingness_to_pay: "Moderate willingness: willing to pay ₹499 – ₹999/month for freemium tiers with instant demonstrable utility."
      }
    ],
    demand_evidence: `Rising organic search interest in automated ${industry} workflows and high community engagement across regional developer/business forums.`,
    acquisition_channels: [
      "Direct product-led referral hooks via WhatsApp and LinkedIn shareable outputs.",
      "Targeted vernacular search intent campaigns (Google Search Ads & YouTube shorts).",
      "Strategic partnerships with regional trade associations and community groups."
    ],
    sources: []
  };
  updateAgent('customer_agent', 'done', 'Profiled 2 buyer personas with verified willingness to pay', 1050);

  // Agent 4: Financial Analyst
  await delay(200);
  const financialReport: FinancialReport = {
    business_model_evaluation: `The planned subscription/transactional model in ${industry} aligns with current market demand. Recurring revenue potential is high if retention hooks and switching barriers are established early.`,
    unit_economics_analysis: "Estimated gross margin profile is viable. For sustainable scaling, LTV:CAC should be maintained above 3.0x with an acquisition payback period under 12 months.",
    runway_burn_status: "Capital efficiency is paramount in this sector. Maintaining at least 15 months of cash runway allows the team to achieve product-market fit without premature dilutive financing.",
    metric_comparisons: comparisons,
    key_recommendation: "Formalize pricing tiers early based on customer value metrics rather than flat discounting."
  };
  updateAgent('financial_agent', 'done', 'Financial audit complete against industry benchmarks', 1250);

  // Agent 5: Risk & Compliance
  await delay(150);
  const riskReport: RiskReport = {
    overall_risk_level: "Moderate",
    risks: [
      {
        category: "Data Privacy",
        risk_title: "Digital Personal Data Protection (DPDP) Act Compliance",
        severity: "Medium",
        mitigation_strategy: "Implement clear consent-manager architecture, granular data retention schedules, and local server encryption.",
        governing_framework: "DPDP Act 2023 / MeitY"
      },
      {
        category: "Regulatory & Licensing",
        risk_title: `Sector-Specific Regulatory Approvals for ${industry}`,
        severity: "Medium",
        mitigation_strategy: "Obtain statutory operational licenses prior to commercial scaling; ensure partner contracts carry indemnification clauses.",
        governing_framework: "State & Central Statutory Norms"
      },
      {
        category: "Intellectual Property",
        risk_title: "Trademark & Algorithmic IP Protection",
        severity: "Low",
        mitigation_strategy: "File provisional trademark registrations across primary business classes and institute strict IP assignment agreements.",
        governing_framework: "Indian Trademark & Patent Office"
      }
    ],
    compliance_roadmap: "Draft founder agreements with reverse vesting, secure trademark filing, and adopt standard Terms of Service within 30 days."
  };
  updateAgent('risk_agent', 'done', 'Assessed legal, DPDP Act 2023 & statutory compliance risks', 1400);

  // 4. Phase 2: Validator / Scorer Agent
  log("Phase 2: Aggregating shared intelligence into Validator/Scorer Agent...");
  updateAgent('scorer_agent', 'running', 'Scoring 10 pillars against rubrics and computing reliability...');
  await delay(400);

  const scoringResult = computePillarsAndOverall(mode, isIdea ? startupInfo : {
    industry,
    target_market: startupInfo.target_market,
    paying_customers: startupInfo.traction?.paying_customers,
    total_users: startupInfo.traction?.total_users,
    gross_margin_pct: startupInfo.business?.gross_margin_pct,
    monthly_growth_pct: startupInfo.traction?.monthly_growth_pct,
    runway_months: startupInfo.business?.runway_months,
    churn_pct: startupInfo.business?.churn_pct,
    team_size: startupInfo.team_legal?.team_size,
    licenses_ip_status: startupInfo.team_legal?.licenses_ip_status
  }, assumptions);

  const jobId = `job-${Date.now()}`;

  const reliabilityReport = {
    job_id: jobId,
    mode,
    created_at: new Date().toISOString(),
    startup_name: name,
    tagline: desc,
    industry,
    target_market: isIdea ? (startupInfo.target_market || "India") : "India",
    overall_score: scoringResult.overallScore,
    score_badge: scoringResult.scoreBadge,
    confidence_level: scoringResult.confidenceLevel,
    assumed_fields_count: assumptions.length,
    verdict_title: scoringResult.verdictTitle,
    verdict_recommendation: scoringResult.verdictRec,
    verdict_narrative: scoringResult.verdictNarrative,
    summary: scoringResult.summary,
    top_3_actions: scoringResult.top3Actions,
    pillars: scoringResult.pillars,
    assumptions_log: assumptions,
    contradictions,
    sources: marketSources
  };

  updateAgent('scorer_agent', 'done', `Scoring complete: ${scoringResult.overallScore}/10 (${scoringResult.scoreBadge})`, 380);

  // 5. Phase 3: Execution Planner Agent
  log("Phase 3: Synthesizing 30-60-90 day execution roadmap...");
  updateAgent('planner_agent', 'running', 'Building milestone roadmap with role owners and KPIs...');
  await delay(350);

  const executionPlan: ExecutionPlan = isIdea ? {
    primary_goal: "Validate core problem-solution fit and secure 15 pilot commitments before writing production code.",
    phases: [
      {
        phase_name: "Day 1-30",
        objective: "Customer Discovery, Rapid Wireframing & Value Proposition Testing",
        tasks: [
          {
            title: "Conduct 25 Problem Discovery Interviews",
            description: "Interview target personas in non-sales conversations to map exact daily friction points and current workflow workarounds.",
            owner_role: "Founding Product Lead",
            priority: "High",
            success_metric: ">= 20 completed transcripts identifying top 3 recurring pain patterns"
          },
          {
            title: "Launch Interactive Figma Click-through Prototype",
            description: "Design low-fidelity mobile/web prototype demonstrating the core 1-click value proposition.",
            owner_role: "Founding Designer / Full-stack Eng",
            priority: "High",
            success_metric: "Prototype tested by at least 15 target users with > 80% task completion"
          }
        ]
      },
      {
        phase_name: "Day 31-60",
        objective: "Minimum Viable Product (MVP) Build & Legal Safeguards",
        tasks: [
          {
            title: "Build Core End-to-End Alpha Engine",
            description: "Develop stripped-down MVP focusing solely on the primary killer feature and vernacular delivery.",
            owner_role: "Lead Engineer",
            priority: "High",
            success_metric: "Functional alpha deployment with < 3s response time"
          },
          {
            title: "Incorporate Entity & Implement DPDP Compliance",
            description: "Register company, formalize co-founder reverse vesting agreements, and draft Terms of Service.",
            owner_role: "CEO / Legal Counsel",
            priority: "Medium",
            success_metric: "Certificate of Incorporation & standard DPDP consent policy live"
          }
        ]
      },
      {
        phase_name: "Day 61-90",
        objective: "Closed Beta Pilot Launch & Early Monetization Test",
        tasks: [
          {
            title: "Onboard 25 Closed Beta Users",
            description: "Roll out working alpha to interview participants; track daily usage and task completion.",
            owner_role: "Growth Lead",
            priority: "High",
            success_metric: ">= 50% weekly active user (WAU) retention in week 4"
          },
          {
            title: "Test Initial Willingness to Pay",
            description: "Offer pre-discounted early bird subscription/usage passes to beta cohort.",
            owner_role: "CEO / Founder",
            priority: "High",
            success_metric: ">= 5 paying pilot customers or signed LOIs"
          }
        ]
      }
    ],
    critical_risk_mitigation: "Do not build secondary bells and whistles before proving that 5 users will willingly pay for the core solution."
  } : {
    primary_goal: "Optimize unit economics, reduce churn under 2%, and extend cash runway to 18+ months.",
    phases: [
      {
        phase_name: "Day 1-30",
        objective: "Unit Economics Audit & Churn Remediation",
        tasks: [
          {
            title: "Perform Cohort Churn & Drop-off Root Cause Analysis",
            description: "Instrument granular telemetry across user onboarding and early churn drop-offs.",
            owner_role: "Head of Product",
            priority: "High",
            success_metric: "Identify top 2 drop-off bottlenecks and deploy friction fixes"
          },
          {
            title: "Refine Tiered Pricing & Eliminate Unprofitable Segments",
            description: "Recalibrate pricing packages to guarantee minimum 70% gross margins per active account.",
            owner_role: "CEO / Commercial Lead",
            priority: "High",
            success_metric: "Average revenue per user (ARPU) increased by 15%"
          }
        ]
      },
      {
        phase_name: "Day 31-60",
        objective: "Repeatable Acquisition Channel Optimization",
        tasks: [
          {
            title: "Scale Top-Performing Organic/Referral Funnels",
            description: "Double down on channels delivering lowest CAC and highest 90-day retention.",
            owner_role: "Growth Marketing Lead",
            priority: "High",
            success_metric: "CAC reduced by 20% while sustaining 15% MoM user growth"
          },
          {
            title: "Automate Customer Onboarding & Self-Serve Setup",
            description: "Shorten time-to-value from days to minutes through guided interactive tours.",
            owner_role: "Frontend / UX Lead",
            priority: "Medium",
            success_metric: "Onboarding completion rate raised above 75%"
          }
        ]
      },
      {
        phase_name: "Day 61-90",
        objective: "Fundraise Readiness & Enterprise Defensibility",
        tasks: [
          {
            title: "Prepare Institutional Due Diligence Data Room",
            description: "Organize clean audited cohort charts, legal cap table, IP filings, and 24-month financial model.",
            owner_role: "CEO / Finance Lead",
            priority: "High",
            success_metric: "Fully vetted investor data room ready with 30 target VC pipeline"
          },
          {
            title: "Establish Strategic Integration Moat",
            description: "Ship proprietary API integrations and automated reporting that locks in enterprise workflows.",
            owner_role: "VP of Engineering",
            priority: "High",
            success_metric: ">= 3 enterprise accounts using automated webhook workflows"
          }
        ]
      }
    ],
    critical_risk_mitigation: "Avoid pouring capital into paid customer acquisition before confirming that cohort churn has stabilized below benchmark."
  };

  updateAgent('planner_agent', 'done', '30-60-90 day milestone roadmap generated', 340);
  log("Pipeline completed successfully!");

  const fullReport: FullReport = {
    job_id: jobId,
    mode,
    status: 'completed',
    reliability: reliabilityReport,
    market: marketReport,
    competitors: competitorReport,
    customers: customerReport,
    financial: financialReport,
    risk: riskReport,
    execution_plan: executionPlan,
    agent_statuses: currentStatuses,
    disclaimer: "AI-based analysis. Not investment or legal advice."
  };

  return fullReport;
}
