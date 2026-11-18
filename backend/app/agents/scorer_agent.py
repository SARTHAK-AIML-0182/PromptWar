from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.schemas.scoring_schemas import ReliabilityReport, PillarScore, PillarStatus
from app.schemas.common import Assumption, Source
from app.schemas.input_schemas import ContradictionFlag
from app.schemas.agent_schemas import MarketReport, CompetitorReport, CustomerReport, FinancialReport, RiskReport
from app.scoring.engine import (
    calculate_overall_score,
    determine_pillar_status,
    summarize_pillars,
    calculate_confidence,
    load_weights
)

PILLAR_METADATA = [
    ("problem_solution_fit", "Problem–Solution Fit", "Clear, high-urgency pain point with high switching motivation"),
    ("market_size_timing", "Market Size & Timing", "TAM > $5B or CAGR > 15% with favorable regulatory/tech tailwinds"),
    ("competition_moat", "Competition & Moat", "Identifiable positioning whitespace and network/data switching moat"),
    ("customer_demand", "Customer Demand", "Concrete personas with verified urgency and willingness to pay"),
    ("business_model", "Business Model", "Clear recurring/transactional pricing aligned to value delivered"),
    ("unit_economics", "Unit Economics", "LTV:CAC >= 3.0x, Gross Margin >= 65%, Payback < 12 months"),
    ("team_execution", "Team & Execution", "Complementary technical + domain founder skills with execution velocity"),
    ("traction_growth", "Traction & Growth", "MoM user/revenue growth >= 12% with controlled churn"),
    ("financial_health", "Financial Health", "Cash runway >= 14 months with disciplined burn multiple"),
    ("legal_compliance", "Legal & Compliance Risk", "Statutory registrations, DPDP 2023 compliance, and IP assignment in place")
]

class ScorerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="scorer_agent",
            name="Validator / Scorer Agent",
            description="Consolidates multi-agent findings, scores the 10 pillars against rubrics, and computes overall reliability."
        )

    async def run(
        self,
        job_id: str,
        startup_info: Dict[str, Any],
        market: MarketReport,
        competitors: CompetitorReport,
        customers: CustomerReport,
        financial: FinancialReport,
        risk: RiskReport,
        assumptions: List[Assumption],
        contradictions: List[ContradictionFlag],
        sources: List[Source],
        notify_cb=None
    ) -> ReliabilityReport:
        mode = startup_info.get("mode", "idea")
        name = startup_info.get("name", "Startup")
        tagline = startup_info.get("description", "")
        industry = startup_info.get("industry", "Technology")
        target_market = startup_info.get("target_market", "India")

        self.set_running(f"Evaluating 10 success pillars and calculating reliability score for {name}...")
        if notify_cb:
            await notify_cb(self.status)

        # Baseline heuristic scores based on inputs and agent analysis
        raw_scores: Dict[str, float] = {}
        findings: Dict[str, str] = {}
        fixes: Dict[str, str] = {}
        evidence: Dict[str, str] = {}

        if mode == "idea":
            # Idea mode baseline scores
            raw_scores["problem_solution_fit"] = 7.8
            findings["problem_solution_fit"] = f"Addresses targeted inefficiencies in {industry} for {target_market}."
            fixes["problem_solution_fit"] = "Conduct 25 structured user interviews with prototype mockups to validate willingness to switch."
            evidence["problem_solution_fit"] = "User idea description & customer profiling agent persona pain analysis."

            raw_scores["market_size_timing"] = 8.2
            findings["market_size_timing"] = f"Large addressable market ({market.tam.value_display}) expanding at {market.cagr_growth_rate}."
            fixes["market_size_timing"] = "Anchor launch wedge specifically in the initial SOM geography before expanding nationally."
            evidence["market_size_timing"] = f"Market Research Agent ({len(sources)} sources cited)."

            raw_scores["competition_moat"] = 6.4
            findings["competition_moat"] = f"Incumbents exist ({competitors.competitors[0].name}); differentiation relies on UX and accessibility."
            fixes["competition_moat"] = "Develop proprietary data collection hooks early to construct a defensible workflow moat."
            evidence["competition_moat"] = "Competitor Agent gap analysis."

            raw_scores["customer_demand"] = 7.2
            findings["customer_demand"] = f"Identified {len(customers.personas)} strong buyer profiles with demonstrated daily friction."
            fixes["customer_demand"] = "Secure 10 letters of intent (LOIs) or paid pilot pre-orders before full build."
            evidence["customer_demand"] = "Customer Agent personas and demand signals."

            raw_scores["business_model"] = 6.9
            findings["business_model"] = "Proposed monetization strategy is sound but requires testing against price sensitivity."
            fixes["business_model"] = "Test pricing tiers (freemium vs pay-per-use) with initial cohort."
            evidence["business_model"] = "Financial Agent monetization assessment."

            raw_scores["team_execution"] = 6.5
            findings["team_execution"] = "Early vision is clear; execution depends on recruiting a dedicated technical/product co-founder."
            fixes["team_execution"] = "Formalize co-founder equity agreements and onboard domain advisors."
            evidence["team_execution"] = "Founder profile input."

            raw_scores["legal_compliance"] = 7.0
            findings["legal_compliance"] = f"Standard regulatory requirements apply under {risk.risks[0].governing_framework}."
            fixes["legal_compliance"] = "Incorporate entity, file trademark, and implement DPDP 2023 compliant data handling."
            evidence["legal_compliance"] = "Risk Agent statutory review."

            # Excluded for idea
            for p in ["unit_economics", "traction_growth", "financial_health"]:
                raw_scores[p] = 0.0
                findings[p] = "Not applicable yet at Idea Stage (no live commercial data)."
                fixes[p] = "Track once private beta testing and initial payments commence."
                evidence[p] = "Pre-revenue idea stage assumption."

        else:
            # Running Startup mode - ground strictly in user data & benchmark comparisons
            # Check unit economics
            gm = startup_info.get("gross_margin_pct", 70)
            cac = startup_info.get("cac", 3500)
            pricing = startup_info.get("pricing", 2000)
            churn = startup_info.get("churn_pct", 2.0)
            runway = startup_info.get("runway_months", 12)
            growth = startup_info.get("monthly_growth_pct", 10)
            paying = startup_info.get("paying_customers", 10)

            # 1. Problem-solution fit
            raw_scores["problem_solution_fit"] = 7.5 if paying >= 20 else (6.0 if paying > 0 else 4.5)
            findings["problem_solution_fit"] = f"Validated with {paying} paying customers generating regular revenue."
            fixes["problem_solution_fit"] = "Survey top 10% happiest customers to codify the 'Aha!' moment."
            evidence["problem_solution_fit"] = f"User traction data ({paying} paying accounts)."

            # 2. Market size & timing
            raw_scores["market_size_timing"] = 8.0
            findings["market_size_timing"] = f"Sector growing at {market.cagr_growth_rate} with total SAM of {market.sam.value_display}."
            fixes["market_size_timing"] = "Capitalize on current timing tailwinds to capture market share."
            evidence["market_size_timing"] = "Market research agent synthesis."

            # 3. Competition & moat
            raw_scores["competition_moat"] = 6.8
            findings["competition_moat"] = f"Identified positioning whitespace: {competitors.positioning_gap[:120]}..."
            fixes["competition_moat"] = "Accelerate workflow integration depth to prevent competitor duplication."
            evidence["competition_moat"] = "Competitor agent benchmark."

            # 4. Customer demand
            raw_scores["customer_demand"] = 7.4 if growth >= 15 else (6.2 if growth >= 5 else 4.5)
            findings["customer_demand"] = f"Customer acquisition velocity running at {growth}% MoM."
            fixes["customer_demand"] = "Scale top performing organic/referral channels."
            evidence["customer_demand"] = "User growth metrics."

            # 5. Business model
            raw_scores["business_model"] = 7.6 if gm >= 70 else (5.8 if gm >= 40 else 3.8)
            findings["business_model"] = f"Gross margin stands at {gm:.1f}% with active commercial monetization."
            fixes["business_model"] = "Review pricing packaging to capture more consumer surplus."
            evidence["business_model"] = "Reported unit economics."

            # 6. Unit economics
            if gm >= 70 and churn <= 3:
                raw_scores["unit_economics"] = 8.2
            elif gm >= 50 and churn <= 7:
                raw_scores["unit_economics"] = 5.8
            else:
                raw_scores["unit_economics"] = 3.4
            findings["unit_economics"] = f"Gross margin {gm:.1f}%, churn {churn:.1f}%/mo, CAC ₹{cac:,.0f}."
            fixes["unit_economics"] = "Optimize paid acquisition channels to lower CAC and strengthen payback."
            evidence["unit_economics"] = "Reported CAC/Churn metrics compared to industry benchmark."

            # 7. Team & execution
            raw_scores["team_execution"] = 7.2
            findings["team_execution"] = f"Team of {startup_info.get('team_size', 5)} with relevant founder background."
            fixes["team_execution"] = "Plug functional gaps in specialized growth marketing and QA."
            evidence["team_execution"] = "Reported team profile & experience."

            # 8. Traction & growth
            if growth >= 15 and paying >= 30:
                raw_scores["traction_growth"] = 8.4
            elif growth >= 8:
                raw_scores["traction_growth"] = 6.2
            else:
                raw_scores["traction_growth"] = 3.9
            findings["traction_growth"] = f"Growing at {growth:.1f}% MoM with {paying} active paying accounts."
            fixes["traction_growth"] = "Focus on retention loops to increase net revenue retention."
            evidence["traction_growth"] = "Reported monthly traction figures."

            # 9. Financial health
            if runway >= 15:
                raw_scores["financial_health"] = 8.5
            elif runway >= 8:
                raw_scores["financial_health"] = 5.5
            else:
                raw_scores["financial_health"] = 2.8
            findings["financial_health"] = f"Current cash runway is {runway:.0f} months."
            fixes["financial_health"] = "Initiate fundraise or extend runway by cutting non-core operational expenses." if runway < 12 else "Maintain disciplined burn cadence."
            evidence["financial_health"] = "Reported runway and burn data."

            # 10. Legal & compliance
            raw_scores["legal_compliance"] = 7.0 if "patent" in startup_info.get("licenses_ip_status", "").lower() or "soc2" in startup_info.get("licenses_ip_status", "").lower() else 5.2
            findings["legal_compliance"] = f"IP & License Status: {startup_info.get('licenses_ip_status', 'Pending clearances')}"
            fixes["legal_compliance"] = "Complete statutory audit and finalize pending IP or licensing clearances."
            evidence["legal_compliance"] = "User legal & compliance input."

        # Compute overall score & normalized weights
        overall_score, normalized_weights = calculate_overall_score(mode, raw_scores)

        # Assemble PillarScore objects
        pillar_objects: List[PillarScore] = []
        excluded_pillars = ["unit_economics", "traction_growth", "financial_health"] if mode == "idea" else []

        for p_id, p_name, p_bench in PILLAR_METADATA:
            if p_id in excluded_pillars:
                pillar_objects.append(PillarScore(
                    pillar_id=p_id,
                    name=p_name,
                    score=None,
                    status="Not Applicable",
                    what_we_found="Not applicable yet for pre-launch Idea Stage startups.",
                    benchmark_healthy_range=p_bench,
                    recommended_fix="Establish baseline tracking upon product rollout and user onboarding.",
                    evidence_basis="Idea Stage exemption (excluded from score calculation).",
                    confidence="Low",
                    weight=0.0
                ))
            else:
                score_val = raw_scores.get(p_id, 5.0)
                status_val = determine_pillar_status(score_val)
                p_conf = "High" if "Reported" in evidence.get(p_id, "") or "User" in evidence.get(p_id, "") else "Medium"
                pillar_objects.append(PillarScore(
                    pillar_id=p_id,
                    name=p_name,
                    score=score_val,
                    status=status_val,
                    what_we_found=findings.get(p_id, "Standard assessment."),
                    benchmark_healthy_range=p_bench,
                    recommended_fix=fixes.get(p_id, "Continue iterative improvements."),
                    evidence_basis=evidence.get(p_id, "Analysis synthesis."),
                    confidence=p_conf,
                    weight=round(normalized_weights.get(p_id, 0.10), 3)
                ))

        summary = summarize_pillars(pillar_objects)
        confidence_level = calculate_confidence(mode, len(assumptions))

        # Overall badge
        if overall_score >= 7.0:
            score_badge = "🟢 Strong"
        elif overall_score >= 4.0:
            score_badge = "🟡 Moderate"
        else:
            score_badge = "🔴 At Risk"

        # Stage-aware verdict
        if mode == "idea":
            if overall_score >= 7.2:
                v_rec = "Go"
                v_title = "GO — Strong Market & Value Proposition"
                v_narrative = (
                    "Your concept targets a high-urgency pain point with favorable market timing and sizable addressable demand. "
                    "You are greenlit to proceed into rapid prototype validation and customer LOI acquisition."
                )
            elif overall_score >= 5.0:
                v_rec = "Refine"
                v_title = "REFINE — Sharpen Differentiation & Monetization"
                v_narrative = (
                    "The problem is genuine, but your competitive positioning or customer willingness to pay requires sharper definition. "
                    "Refine your core wedge before committing capital to engineering."
                )
            else:
                v_rec = "Pivot"
                v_title = "PIVOT — High Structural Headwinds"
                v_narrative = (
                    "High market saturation, low switching incentives, or weak monetization signals suggest this concept faces severe friction. "
                    "Consider pivoting towards an adjacent problem with stronger customer pull."
                )
        else:
            if overall_score >= 7.5:
                v_rec = "Scale-Ready"
                v_title = "SCALE-READY — Solid Unit Economics & Foundation"
                v_narrative = (
                    "Your core metrics demonstrate healthy capital efficiency, defensible margins, and steady customer traction. "
                    "Focus on accelerating acquisition channels and institutional fundraising."
                )
            elif overall_score >= 5.0:
                v_rec = "Caution"
                v_title = "PROCEED WITH CAUTION — Optimize Leaky Metrics"
                v_narrative = (
                    "The business shows traction, but unit economics or cash runway indicate vulnerability. "
                    "Address churn, margin pressure, or near-term runway before aggressive expansion."
                )
            else:
                v_rec = "Caution"
                v_title = "HIGH RISK — Critical Financial / Operational Gaps"
                v_narrative = (
                    "Immediate capital or unit-profitability risks threaten business continuity. "
                    "Curtail non-essential burn, review pricing structure, and execute urgent risk mitigations."
                )

        # Top 3 immediate actions
        top_actions = [
            pillar_objects[0].recommended_fix,
            (
                [p.recommended_fix for p in pillar_objects if p.status == "Risk"][0]
                if any(p.status == "Risk" for p in pillar_objects)
                else pillar_objects[1].recommended_fix
            ),
            risk.compliance_roadmap
        ][:3]

        report = ReliabilityReport(
            job_id=job_id,
            mode=mode,
            created_at=datetime.now(timezone.utc).isoformat(),
            startup_name=name,
            tagline=tagline,
            industry=industry,
            target_market=target_market,
            overall_score=overall_score,
            score_badge=score_badge,
            confidence_level=confidence_level,
            assumed_fields_count=len(assumptions),
            verdict_title=v_title,
            verdict_recommendation=v_rec,
            verdict_narrative=v_narrative,
            summary=summary,
            top_3_actions=top_actions,
            pillars=pillar_objects,
            assumptions_log=assumptions,
            contradictions=contradictions,
            sources=sources
        )

        elapsed = 150
        self.set_done(f"Scoring complete. Overall score: {overall_score}/10 ({score_badge})", elapsed)
        if notify_cb:
            await notify_cb(self.status)

        return report
