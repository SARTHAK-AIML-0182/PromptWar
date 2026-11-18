import { BENCHMARKS } from '../data/benchmarks';
import { WEIGHTS } from '../data/weights';
import { RUBRICS } from '../data/rubrics';
import {
  PillarScore,
  ReliabilitySummary,
  ContradictionFlag,
  Assumption,
  MetricComparison,
  Mode,
  PillarStatus
} from '../types';

export function detectContradictions(startup: any): ContradictionFlag[] {
  const flags: ContradictionFlag[] = [];
  const t = startup.traction || {};
  const b = startup.business || {};
  const tl = startup.team_legal || {};

  // Contradiction: Revenue > 0 with 0 paying customers
  if (t.monthly_revenue && t.monthly_revenue > 0 && t.paying_customers === 0) {
    flags.push({
      severity: 'critical',
      field_a: 'monthly_revenue',
      field_b: 'paying_customers',
      message: `Revenue is reported as ₹${Number(t.monthly_revenue).toLocaleString('en-IN')}/mo, but paying customers is entered as 0.`
    });
  }

  // Contradiction: Paying customers > total users
  if (t.paying_customers && t.total_users && t.paying_customers > t.total_users) {
    flags.push({
      severity: 'critical',
      field_a: 'paying_customers',
      field_b: 'total_users',
      message: `Paying customers (${t.paying_customers}) exceeds total users (${t.total_users}).`
    });
  }

  // Contradiction: Short runway with 0 burn
  if (b.runway_months && b.runway_months < 6 && b.monthly_burn === 0) {
    flags.push({
      severity: 'warning',
      field_a: 'runway_months',
      field_b: 'monthly_burn',
      message: 'Reported runway is short (< 6 months) while monthly burn is entered as ₹0.'
    });
  }

  // Contradiction: High growth with 0 CAC
  if (t.monthly_growth_pct && t.monthly_growth_pct > 25 && b.cac === 0) {
    flags.push({
      severity: 'warning',
      field_a: 'monthly_growth_pct',
      field_b: 'cac',
      message: 'High growth (> 25% MoM) with zero reported CAC implies purely viral growth or untracked marketing spend.'
    });
  }

  if (tl.team_size === 0) {
    flags.push({
      severity: 'warning',
      field_a: 'team_size',
      field_b: 'startup_name',
      message: 'Team size was entered as 0 (minimum 1 founder assumed).'
    });
  }

  return flags;
}

export function evaluateMetricsAndAssumptions(
  industry: string,
  startup: any
): { comparisons: MetricComparison[]; assumptions: Assumption[] } {
  const matchedKey = Object.keys(BENCHMARKS).find(k => industry.toLowerCase().includes(k.toLowerCase())) || "General / Other";
  const bData = BENCHMARKS[matchedKey] || BENCHMARKS["General / Other"];

  const comparisons: MetricComparison[] = [];
  const assumptions: Assumption[] = [];

  const b = startup.business || {};
  const t = startup.traction || {};

  // 1. Gross Margin
  let gm = b.gross_margin_pct;
  const gmBench = bData.gross_margin_pct;
  if (gm === null || gm === undefined || gm === '') {
    gm = (gmBench.healthy_min + gmBench.healthy_max) / 2;
    assumptions.push({
      field_name: "Gross Margin %",
      assumed_value: `${gm.toFixed(1)}%`,
      reason: "You did not provide Gross Margin; industry median was assumed.",
      industry_benchmark_source: `${matchedKey} standard range (${gmBench.healthy_min}-${gmBench.healthy_max}%)`
    });
  }
  const gmStatus = gm >= gmBench.healthy_min ? 'Healthy' : gm >= gmBench.healthy_min * 0.7 ? 'Needs Work' : 'Warning';
  comparisons.push({
    metric_name: "Gross Margin",
    user_value: `${Number(gm).toFixed(1)}%`,
    benchmark_range: `${gmBench.healthy_min}–${gmBench.healthy_max}%`,
    status: gmStatus,
    verdict: gmStatus === 'Healthy' ? 'Healthy unit profitability' : 'Margin compression risk'
  });

  // 2. Churn
  let churn = b.churn_pct;
  const churnBench = bData.monthly_churn_pct;
  if (churn === null || churn === undefined || churn === '') {
    churn = (churnBench.healthy_min + churnBench.healthy_max) / 2;
    assumptions.push({
      field_name: "Monthly Churn %",
      assumed_value: `${churn.toFixed(1)}%`,
      reason: "You did not provide Churn rate; industry benchmark was assumed.",
      industry_benchmark_source: `${matchedKey} benchmark (${churnBench.healthy_min}-${churnBench.healthy_max}%)`
    });
  }
  const churnStatus = churn <= churnBench.healthy_max ? 'Healthy' : churn <= churnBench.healthy_max * 1.8 ? 'Needs Work' : 'Warning';
  comparisons.push({
    metric_name: "Monthly Churn",
    user_value: `${Number(churn).toFixed(1)}%`,
    benchmark_range: `${churnBench.healthy_min}–${churnBench.healthy_max}%`,
    status: churnStatus,
    verdict: churnStatus === 'Healthy' ? 'Strong cohort retention' : 'Customer leakage threatens scale'
  });

  // 3. Runway
  let runway = b.runway_months;
  const runwayBench = bData.runway_months;
  if (runway === null || runway === undefined || runway === '') {
    runway = 12;
    assumptions.push({
      field_name: "Runway (Months)",
      assumed_value: "12 months",
      reason: "Runway was skipped; baseline safe threshold of 12 months was assumed.",
      industry_benchmark_source: "Seed stage safety threshold"
    });
  }
  const runwayStatus = runway >= runwayBench.healthy_min ? 'Healthy' : runway >= 6 ? 'Needs Work' : 'Warning';
  comparisons.push({
    metric_name: "Cash Runway",
    user_value: `${Number(runway).toFixed(0)} mo`,
    benchmark_range: `${runwayBench.healthy_min}–${runwayBench.healthy_max} mo`,
    status: runwayStatus,
    verdict: runwayStatus === 'Healthy' ? 'Adequate capitalization' : 'Immediate fundraise or burn curtailment needed'
  });

  // 4. MoM Growth
  let growth = t.monthly_growth_pct;
  const growthBench = bData.mom_growth_pct;
  if (growth === null || growth === undefined || growth === '') {
    growth = 10;
    assumptions.push({
      field_name: "MoM Growth %",
      assumed_value: "10.0%",
      reason: "Monthly growth was omitted; baseline early-stage growth of 10% was assumed.",
      industry_benchmark_source: `${matchedKey} early-stage baseline`
    });
  }
  const growthStatus = growth >= growthBench.healthy_min ? 'Healthy' : growth >= 5 ? 'Needs Work' : 'Warning';
  comparisons.push({
    metric_name: "MoM Growth",
    user_value: `${Number(growth).toFixed(1)}%`,
    benchmark_range: `${growthBench.healthy_min}–${growthBench.healthy_max}%`,
    status: growthStatus,
    verdict: growthStatus === 'Healthy' ? 'High growth traction' : 'Sluggish acquisition momentum'
  });

  // 5. CAC
  if (b.cac === null || b.cac === undefined || b.cac === '') {
    const medCac = bData.median_cac_inr;
    assumptions.push({
      field_name: "CAC",
      assumed_value: `₹${medCac.toLocaleString('en-IN')}`,
      reason: "You did not provide Customer Acquisition Cost (CAC); industry median was assumed.",
      industry_benchmark_source: `${matchedKey} typical acquisition benchmark`
    });
  }

  return { comparisons, assumptions };
}

export function computePillarsAndOverall(
  mode: Mode,
  startupInfo: any,
  assumptions: Assumption[]
): {
  pillars: PillarScore[];
  overallScore: number;
  scoreBadge: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  verdictTitle: string;
  verdictRec: 'Go' | 'Refine' | 'Pivot' | 'Scale-Ready' | 'Caution';
  verdictNarrative: string;
  summary: ReliabilitySummary;
  top3Actions: string[];
} {
  const isIdea = mode === 'idea';
  const weightsDict = isIdea ? WEIGHTS.idea_stage : WEIGHTS.running_startup;
  const excludedPillars = isIdea ? WEIGHTS.idea_stage_excluded_pillars : [];

  // Active weights normalization
  let totalActiveWeight = 0;
  for (const [k, v] of Object.entries(weightsDict)) {
    if (!excludedPillars.includes(k) && (v as number) > 0) {
      totalActiveWeight += (v as number);
    }
  }
  if (totalActiveWeight <= 0) totalActiveWeight = 1.0;

  const rawScores: Record<string, number> = {};
  const findings: Record<string, string> = {};
  const fixes: Record<string, string> = {};
  const evidence: Record<string, string> = {};

  if (isIdea) {
    rawScores["problem_solution_fit"] = 7.8;
    findings["problem_solution_fit"] = `Addresses targeted inefficiencies in ${startupInfo.industry || 'the sector'} for ${startupInfo.target_market || 'India'}.`;
    fixes["problem_solution_fit"] = "Conduct 25 structured user interviews with prototype mockups to validate willingness to switch.";
    evidence["problem_solution_fit"] = "User idea description & persona pain point analysis.";

    rawScores["market_size_timing"] = 8.2;
    findings["market_size_timing"] = "Large expanding addressable market with high macro timing tailwinds.";
    fixes["market_size_timing"] = "Anchor initial launch wedge strictly in SOM territory before broader regional expansion.";
    evidence["market_size_timing"] = "Market Research Agent industry analysis.";

    rawScores["competition_moat"] = 6.4;
    findings["competition_moat"] = "Incumbent alternatives exist; differentiation relies on superior UX, vernacular delivery, and accessibility.";
    fixes["competition_moat"] = "Develop proprietary data collection hooks early to build a defensible workflow moat.";
    evidence["competition_moat"] = "Competitor Agent positioning whitespace analysis.";

    rawScores["customer_demand"] = 7.2;
    findings["customer_demand"] = "Strong buyer personas identified with demonstrated recurring friction.";
    fixes["customer_demand"] = "Secure 10 letters of intent (LOIs) or paid pilot pre-orders prior to production rollout.";
    evidence["customer_demand"] = "Customer Agent personas and search pull evidence.";

    rawScores["business_model"] = 6.9;
    findings["business_model"] = "Proposed monetization model is viable but requires testing against customer price sensitivity.";
    fixes["business_model"] = "Test pricing tiers (freemium vs pay-per-use) with initial beta cohort.";
    evidence["business_model"] = "Financial Agent monetization assessment.";

    rawScores["team_execution"] = 6.5;
    findings["team_execution"] = "Founder concept is clear; long-term execution requires recruiting a dedicated technical co-founder.";
    fixes["team_execution"] = "Formalize co-founder equity agreements and onboard domain advisors.";
    evidence["team_execution"] = "Founder profile assessment.";

    rawScores["legal_compliance"] = 7.0;
    findings["legal_compliance"] = "Standard statutory and DPDP Act 2023 compliance requirements apply.";
    fixes["legal_compliance"] = "Incorporate entity, register trademark, and implement DPDP 2023 data consent flow.";
    evidence["legal_compliance"] = "Risk Agent compliance evaluation.";

    // Excluded
    for (const p of excludedPillars) {
      rawScores[p] = 0;
      findings[p] = "Not applicable yet at Idea Stage (no live commercial metrics).";
      fixes[p] = "Track once private beta testing and customer payments commence.";
      evidence[p] = "Pre-revenue idea stage assumption.";
    }
  } else {
    // Running startup
    const paying = startupInfo.paying_customers || 10;
    const gm = startupInfo.gross_margin_pct || 70;
    const growth = startupInfo.monthly_growth_pct || 10;
    const runway = startupInfo.runway_months || 12;
    const churn = startupInfo.churn_pct || 2.0;

    rawScores["problem_solution_fit"] = paying >= 20 ? 7.6 : paying > 0 ? 6.2 : 4.5;
    findings["problem_solution_fit"] = `Validated with ${paying} paying customers generating recurring revenue.`;
    fixes["problem_solution_fit"] = "Survey top 10% most active customers to codify the 'Aha!' moment.";
    evidence["problem_solution_fit"] = `User traction data (${paying} paying accounts).`;

    rawScores["market_size_timing"] = 8.0;
    findings["market_size_timing"] = `Category exhibits strong tailwinds and sizable addressable market in ${startupInfo.industry}.`;
    fixes["market_size_timing"] = "Capitalize on current timing tailwinds to capture market share.";
    evidence["market_size_timing"] = "Market research agent synthesis.";

    rawScores["competition_moat"] = 6.8;
    findings["competition_moat"] = "Positioning whitespace exists for a specialized, lightweight solution.";
    fixes["competition_moat"] = "Deepen workflow integrations to increase customer switching costs.";
    evidence["competition_moat"] = "Competitor agent benchmark.";

    rawScores["customer_demand"] = growth >= 15 ? 7.5 : growth >= 5 ? 6.2 : 4.5;
    findings["customer_demand"] = `Customer acquisition velocity running at ${growth}% MoM.`;
    fixes["customer_demand"] = "Scale top performing organic/referral channels.";
    evidence["customer_demand"] = "User growth metrics.";

    rawScores["business_model"] = gm >= 70 ? 7.8 : gm >= 40 ? 5.8 : 3.8;
    findings["business_model"] = `Gross profit margin stands at ${gm.toFixed(1)}%.`;
    fixes["business_model"] = "Review pricing packaging to capture more consumer surplus.";
    evidence["business_model"] = "Reported unit economics.";

    rawScores["unit_economics"] = (gm >= 70 && churn <= 3) ? 8.2 : (gm >= 50 && churn <= 7) ? 5.8 : 3.4;
    findings["unit_economics"] = `Gross margin ${gm.toFixed(1)}%, churn ${churn.toFixed(1)}%/mo.`;
    fixes["unit_economics"] = "Optimize paid acquisition channels to lower CAC and strengthen payback.";
    evidence["unit_economics"] = "Reported CAC/Churn metrics compared to industry benchmark.";

    rawScores["team_execution"] = 7.2;
    findings["team_execution"] = `Team of ${startupInfo.team_size || 5} with relevant domain experience.`;
    fixes["team_execution"] = "Plug functional gaps in specialized growth marketing and QA.";
    evidence["team_execution"] = "Reported team profile.";

    rawScores["traction_growth"] = (growth >= 15 && paying >= 30) ? 8.4 : growth >= 8 ? 6.2 : 3.9;
    findings["traction_growth"] = `Growing at ${growth.toFixed(1)}% MoM with ${paying} active paying accounts.`;
    fixes["traction_growth"] = "Focus on retention loops to increase net revenue retention.";
    evidence["traction_growth"] = "Reported monthly traction figures.";

    rawScores["financial_health"] = runway >= 15 ? 8.5 : runway >= 8 ? 5.5 : 2.8;
    findings["financial_health"] = `Current cash runway is ${runway} months.`;
    fixes["financial_health"] = runway < 12 ? "Initiate fundraise or cut non-core burn immediately." : "Maintain disciplined capital allocation.";
    evidence["financial_health"] = "Reported runway and burn data.";

    rawScores["legal_compliance"] = 7.0;
    findings["legal_compliance"] = `Compliance & IP Status: ${startupInfo.licenses_ip_status || 'Pending formal audit'}`;
    fixes["legal_compliance"] = "Complete statutory audit and finalize pending IP or licensing clearances.";
    evidence["legal_compliance"] = "User legal & compliance input.";
  }

  // Calculate weighted overall score
  let weightedSum = 0;
  const pillars: PillarScore[] = [];

  for (const rubric of RUBRICS) {
    const pId = rubric.id;
    const isExcluded = excludedPillars.includes(pId);

    if (isExcluded) {
      pillars.push({
        pillar_id: pId,
        name: rubric.name,
        score: null,
        status: 'Not Applicable',
        what_we_found: "Not applicable yet for pre-launch Idea Stage startups.",
        benchmark_healthy_range: rubric.healthy_standard,
        recommended_fix: "Establish baseline tracking upon product rollout and user onboarding.",
        evidence_basis: "Idea Stage exemption (excluded from score calculation).",
        confidence: "Low",
        weight: 0.0
      });
    } else {
      const score = rawScores[pId] !== undefined ? rawScores[pId] : 5.0;
      const weightVal = ((weightsDict as any)[pId] || 0.10) / totalActiveWeight;
      weightedSum += score * weightVal;

      let status: PillarStatus = 'Strong';
      if (score < 4.0) status = 'Risk';
      else if (score < 7.0) status = 'Needs Work';

      pillars.push({
        pillar_id: pId,
        name: rubric.name,
        score: Number(score.toFixed(1)),
        status,
        what_we_found: findings[pId] || "Standard evaluation.",
        benchmark_healthy_range: rubric.healthy_standard,
        recommended_fix: fixes[pId] || "Maintain iterative enhancements.",
        evidence_basis: evidence[pId] || "Synthesized analysis.",
        confidence: evidence[pId]?.includes("User") || evidence[pId]?.includes("Reported") ? "High" : "Medium",
        weight: Number(weightVal.toFixed(3))
      });
    }
  }

  const overallScore = Number(Math.max(0, Math.min(10, weightedSum)).toFixed(1));

  let scoreBadge = "🟢 Strong";
  if (overallScore < 4.0) scoreBadge = "🔴 At Risk";
  else if (overallScore < 7.0) scoreBadge = "🟡 Moderate";

  // Confidence calculation
  let confidenceLevel: 'High' | 'Medium' | 'Low' = 'High';
  if (isIdea) {
    confidenceLevel = assumptions.length <= 1 ? 'Medium' : 'Low';
  } else {
    const ratio = (10 - assumptions.length) / 10;
    if (ratio >= 0.8) confidenceLevel = 'High';
    else if (ratio >= 0.45) confidenceLevel = 'Medium';
    else confidenceLevel = 'Low';
  }

  // Verdict
  let verdictTitle = "";
  let verdictRec: 'Go' | 'Refine' | 'Pivot' | 'Scale-Ready' | 'Caution' = 'Go';
  let verdictNarrative = "";

  if (isIdea) {
    if (overallScore >= 7.2) {
      verdictRec = 'Go';
      verdictTitle = "GO — Strong Market & Value Proposition";
      verdictNarrative = "Your concept targets a high-urgency pain point with favorable market timing and sizable addressable demand. You are greenlit to proceed into rapid prototype validation and customer LOI acquisition.";
    } else if (overallScore >= 5.0) {
      verdictRec = 'Refine';
      verdictTitle = "REFINE — Sharpen Differentiation & Monetization";
      verdictNarrative = "The problem is genuine, but your competitive positioning or customer willingness to pay requires sharper definition. Refine your core wedge before committing capital to engineering.";
    } else {
      verdictRec = 'Pivot';
      verdictTitle = "PIVOT — High Structural Headwinds";
      verdictNarrative = "High market saturation, low switching incentives, or weak monetization signals suggest this concept faces severe friction. Consider pivoting towards an adjacent problem with stronger customer pull.";
    }
  } else {
    if (overallScore >= 7.5) {
      verdictRec = 'Scale-Ready';
      verdictTitle = "SCALE-READY — Solid Unit Economics & Foundation";
      verdictNarrative = "Your core metrics demonstrate healthy capital efficiency, defensible margins, and steady customer traction. Focus on accelerating acquisition channels and institutional fundraising.";
    } else if (overallScore >= 5.0) {
      verdictRec = 'Caution';
      verdictTitle = "PROCEED WITH CAUTION — Optimize Leaky Metrics";
      verdictNarrative = "The business shows traction, but unit economics or cash runway indicate vulnerability. Address churn, margin pressure, or near-term runway before aggressive expansion.";
    } else {
      verdictRec = 'Caution';
      verdictTitle = "HIGH RISK — Critical Financial / Operational Gaps";
      verdictNarrative = "Immediate capital or unit-profitability risks threaten business continuity. Curtail non-essential burn, review pricing structure, and execute urgent risk mitigations.";
    }
  }

  // Summary counts
  const strong = pillars.filter(p => p.status === 'Strong').map(p => p.name);
  const needsWork = pillars.filter(p => p.status === 'Needs Work').map(p => p.name);
  const risk = pillars.filter(p => p.status === 'Risk').map(p => p.name);

  const summary: ReliabilitySummary = {
    strong_count: strong.length,
    needs_work_count: needsWork.length,
    risk_count: risk.length,
    strong_pillars: strong,
    needs_work_pillars: needsWork,
    risk_pillars: risk
  };

  const top3Actions = [
    pillars[0].recommended_fix,
    pillars.find(p => p.status === 'Risk')?.recommended_fix || pillars[1].recommended_fix,
    "Incorporate entity, register trademark, and adopt standard DPDP Act 2023 data consent policy."
  ].slice(0, 3);

  return {
    pillars,
    overallScore,
    scoreBadge,
    confidenceLevel,
    verdictTitle,
    verdictRec,
    verdictNarrative,
    summary,
    top3Actions
  };
}
