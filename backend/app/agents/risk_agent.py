from typing import Dict, Any, Optional
from app.agents.base_agent import BaseAgent
from app.schemas.agent_schemas import RiskReport

class RiskAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="risk_agent",
            name="Risk & Compliance Agent",
            description="Evaluates regulatory exposure, licensing mandates, IP defenses, and data privacy requirements."
        )

    async def run(self, startup_info: Dict[str, Any], notify_cb=None) -> RiskReport:
        name = startup_info.get("name", "Startup")
        desc = startup_info.get("description", "")
        industry = startup_info.get("industry", "Technology")
        target_market = startup_info.get("target_market", "India")
        licenses_ip_status = startup_info.get("licenses_ip_status", "None specified")
        
        self.set_running(f"Reviewing regulatory frameworks, licensing, and compliance in {industry}...")
        if notify_cb:
            await notify_cb(self.status)

        system_prompt = (
            "You are a Startup General Counsel & Compliance Specialist specializing in early-stage legal and regulatory risk in India. "
            "Identify key legal, regulatory, licensing, IP, and data privacy (DPDP Act 2023) risks. "
            "Provide severity ratings and concrete mitigation strategies."
        )

        user_prompt = (
            f"STARTUP PROFILE:\n"
            f"Name: {name}\n"
            f"Concept: {desc}\n"
            f"Industry: {industry}\n"
            f"Geography: {target_market}\n"
            f"Existing IP / Licenses: {licenses_ip_status}\n"
        )

        mock_data = {
            "overall_risk_level": "Moderate",
            "risks": [
                {
                    "category": "Data Privacy",
                    "risk_title": "Digital Personal Data Protection (DPDP) Act Compliance",
                    "severity": "Medium",
                    "mitigation_strategy": "Implement clear consent-manager architecture, granular data retention schedules, and local server encryption.",
                    "governing_framework": "DPDP Act 2023 / MeitY"
                },
                {
                    "category": "Regulatory & Licensing",
                    "risk_title": f"Sector-Specific Regulatory Approvals for {industry}",
                    "severity": "Medium",
                    "mitigation_strategy": "Obtain statutory operational licenses prior to commercial scaling; ensure partner contracts carry indemnification clauses.",
                    "governing_framework": "State & Central Statutory Norms"
                },
                {
                    "category": "Intellectual Property",
                    "risk_title": "Trademark & Algorithmic IP Protection",
                    "severity": "Low",
                    "mitigation_strategy": "File provisional trademark registrations across primary business classes and institute strict IP assignment agreements for all founders and engineers.",
                    "governing_framework": "Indian Trademark & Patent Office"
                }
            ],
            "compliance_roadmap": "Draft founder agreements with reverse vesting, secure trademark filing, and adopt standard Terms of Service and Privacy Policy within 30 days."
        }

        report = await self.execute_llm_task(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=RiskReport,
            temperature=0.2,
            mock_data=mock_data
        )
        if notify_cb:
            await notify_cb(self.status)
        return report
