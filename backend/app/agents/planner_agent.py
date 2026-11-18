from typing import Dict, Any, Optional
from app.agents.base_agent import BaseAgent
from app.schemas.execution_schemas import ExecutionPlan, RoadmapPhase, ExecutionTask
from app.schemas.scoring_schemas import ReliabilityReport

class PlannerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="planner_agent",
            name="Execution Planner Agent",
            description="Generates concrete 30-60-90 day execution roadmaps with assigned roles, tasks, and success metrics."
        )

    async def run(
        self,
        startup_info: Dict[str, Any],
        reliability_report: ReliabilityReport,
        notify_cb=None
    ) -> ExecutionPlan:
        name = startup_info.get("name", "Startup")
        desc = startup_info.get("description", "")
        industry = startup_info.get("industry", "Technology")
        mode = startup_info.get("mode", "idea")
        
        self.set_running(f"Synthesizing 30-60-90 day execution roadmap for {name}...")
        if notify_cb:
            await notify_cb(self.status)

        system_prompt = (
            "You are a Startup COO and Execution Strategist. "
            "Synthesize a rigorous, highly-concrete 30-60-90 day execution plan. "
            "Organize into 3 distinct phases: Day 1-30, Day 31-60, Day 61-90. "
            "Each phase must have a crisp objective and at least 2 concrete tasks with an assigned role owner "
            "(e.g. 'Founding Engineer', 'Product Lead', 'Growth Marketer'), priority (High/Medium/Low), "
            "and a quantitative success metric."
        )

        user_prompt = (
            f"STARTUP CONTEXT:\n"
            f"Name: {name}\n"
            f"Description: {desc}\n"
            f"Industry: {industry}\n"
            f"Mode: {mode}\n"
            f"Overall Score: {reliability_report.overall_score}/10 ({reliability_report.score_badge})\n"
            f"Verdict: {reliability_report.verdict_title}\n"
            f"Top Actions Needed:\n" + "\n".join([f"- {a}" for a in reliability_report.top_3_actions]) + "\n"
        )

        # High-fidelity mock roadmap
        if mode == "idea":
            mock_data = {
                "primary_goal": "Validate core problem-solution fit and secure 15 pilot commitments before writing production code.",
                "phases": [
                    {
                        "phase_name": "Day 1-30",
                        "objective": "Customer Discovery, Rapid Wireframing & Value Proposition Testing",
                        "tasks": [
                            {
                                "title": "Conduct 25 Problem Discovery Interviews",
                                "description": "Interview target personas in non-sales conversations to map exact daily friction points and current workflow workarounds.",
                                "owner_role": "Founding Product Lead",
                                "priority": "High",
                                "success_metric": ">= 20 completed transcripts identifying top 3 recurring pain patterns"
                            },
                            {
                                "title": "Launch Interactive Figma Click-through Prototype",
                                "description": "Design low-fidelity mobile/web prototype demonstrating the core 1-click value proposition.",
                                "owner_role": "Founding Designer / Full-stack Eng",
                                "priority": "High",
                                "success_metric": "Prototype tested by at least 15 target users with > 80% task completion"
                            }
                        ]
                    },
                    {
                        "phase_name": "Day 31-60",
                        "objective": "Minimum Viable Product (MVP) Build & Legal Safeguards",
                        "tasks": [
                            {
                                "title": "Build Core End-to-End Alpha Engine",
                                "description": "Develop stripped-down MVP focusing solely on the primary killer feature and vernacular delivery.",
                                "owner_role": "Lead Engineer",
                                "priority": "High",
                                "success_metric": "Functional alpha deployment with < 3s response time"
                            },
                            {
                                "title": "Incorporate Entity & Implement DPDP Compliance",
                                "description": "Register company, formalize co-founder reverse vesting agreements, and draft Terms of Service.",
                                "owner_role": "CEO / Legal Counsel",
                                "priority": "Medium",
                                "success_metric": "Certificate of Incorporation & standard DPDP consent policy live"
                            }
                        ]
                    },
                    {
                        "phase_name": "Day 61-90",
                        "objective": "Closed Beta Pilot Launch & Early Monetization Test",
                        "tasks": [
                            {
                                "title": "Onboard 25 Closed Beta Users",
                                "description": "Roll out working alpha to interview participants; track daily usage and task completion.",
                                "owner_role": "Growth Lead",
                                "priority": "High",
                                "success_metric": ">= 50% weekly active user (WAU) retention in week 4"
                            },
                            {
                                "title": "Test Initial Willingness to Pay",
                                "description": "Offer pre-discounted early bird subscription/usage passes to beta cohort.",
                                "owner_role": "CEO / Founder",
                                "priority": "High",
                                "success_metric": ">= 5 paying pilot customers or signed LOIs"
                            }
                        ]
                    }
                ],
                "critical_risk_mitigation": "Do not build secondary bells and whistles before proving that 5 users will willingly pay for the core solution."
            }
        else:
            mock_data = {
                "primary_goal": "Optimize unit economics, reduce churn under 2%, and extend cash runway to 18+ months.",
                "phases": [
                    {
                        "phase_name": "Day 1-30",
                        "objective": "Unit Economics Audit & Churn Remediation",
                        "tasks": [
                            {
                                "title": "Perform Cohort Churn & Drop-off Root Cause Analysis",
                                "description": "Instrument granular telemetry across user onboarding and early churn drop-offs.",
                                "owner_role": "Head of Product",
                                "priority": "High",
                                "success_metric": "Identify top 2 drop-off bottlenecks and deploy friction fixes"
                            },
                            {
                                "title": "Refine Tiered Pricing & Eliminate Unprofitable Segments",
                                "description": "Recalibrate pricing packages to guarantee minimum 70% gross margins per active account.",
                                "owner_role": "CEO / Commercial Lead",
                                "priority": "High",
                                "success_metric": "Average revenue per user (ARPU) increased by 15%"
                            }
                        ]
                    },
                    {
                        "phase_name": "Day 31-60",
                        "objective": "Repeatable Acquisition Channel Optimization",
                        "tasks": [
                            {
                                "title": "Scale Top-Performing Organic/Referral Funnels",
                                "description": "Double down on channels delivering lowest CAC and highest 90-day retention.",
                                "owner_role": "Growth Marketing Lead",
                                "priority": "High",
                                "success_metric": "CAC reduced by 20% while sustaining 15% MoM user growth"
                            },
                            {
                                "title": "Automate Customer Onboarding & Self-Serve Setup",
                                "description": "Shorten time-to-value from days to minutes through guided interactive tours.",
                                "owner_role": "Frontend / UX Lead",
                                "priority": "Medium",
                                "success_metric": "Onboarding completion rate raised above 75%"
                            }
                        ]
                    },
                    {
                        "phase_name": "Day 61-90",
                        "objective": "Fundraise Readiness & Enterprise Defensibility",
                        "tasks": [
                            {
                                "title": "Prepare Institutional Due Diligence Data Room",
                                "description": "Organize clean audited cohort charts, legal cap table, IP filings, and 24-month financial model.",
                                "owner_role": "CEO / Finance Lead",
                                "priority": "High",
                                "success_metric": "Fully vetted investor data room ready with 30 target VC pipeline"
                            },
                            {
                                "title": "Establish Strategic Integration Moat",
                                "description": "Ship proprietary API integrations and automated reporting that locks in enterprise workflows.",
                                "owner_role": "VP of Engineering",
                                "priority": "High",
                                "success_metric": ">= 3 enterprise accounts using automated webhook workflows"
                            }
                        ]
                    }
                ],
                "critical_risk_mitigation": "Avoid pouring capital into paid customer acquisition before confirming that cohort churn has stabilized below benchmark."
            }

        plan = await self.execute_llm_task(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=ExecutionPlan,
            temperature=0.2,
            mock_data=mock_data
        )
        if notify_cb:
            await notify_cb(self.status)
        return plan
