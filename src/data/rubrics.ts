export interface PillarRubric {
  id: string;
  name: string;
  description: string;
  healthy_standard: string;
}

export const RUBRICS: PillarRubric[] = [
  {
    id: "problem_solution_fit",
    name: "Problem–Solution Fit",
    description: "Clarity and severity of customer pain point, validated need, and directness of the proposed solution.",
    healthy_standard: "Clear, high-urgency pain point with high switching motivation and 10x value proposition."
  },
  {
    id: "market_size_timing",
    name: "Market Size & Timing",
    description: "Total Addressable Market (TAM), serviceable market (SAM), obtainable market (SOM), market growth CAGR, and timing tailwinds.",
    healthy_standard: "TAM > $5B or CAGR > 15% with favorable regulatory/technology inflection tailwinds."
  },
  {
    id: "competition_moat",
    name: "Competition & Moat",
    description: "Competitive landscape density, incumbent positioning, and presence of defensible moats (network effects, switching costs, tech IP).",
    healthy_standard: "Identifiable positioning whitespace and network/data switching moat."
  },
  {
    id: "customer_demand",
    name: "Customer Demand",
    description: "Target persona clarity, evidence of urgency, validated willingness to pay, and customer acquisition pull.",
    healthy_standard: "Concrete personas with verified urgency and willingness to pay."
  },
  {
    id: "business_model",
    name: "Business Model",
    description: "Monetization strategy clarity, pricing alignment with customer value, recurring revenue potential, and scalability.",
    healthy_standard: "High-margin recurring or transactional model with high pricing power and clear unit revenue expansion."
  },
  {
    id: "unit_economics",
    name: "Unit Economics",
    description: "LTV:CAC ratio (healthy >= 3x), gross margin % (SaaS >= 70%), payback period (< 12 months), and churn stability.",
    healthy_standard: "LTV:CAC >= 3.0x, Gross Margin >= 65%, Payback < 12 months."
  },
  {
    id: "team_execution",
    name: "Team & Execution",
    description: "Founder-market fit, technical competence, relevant domain experience, completeness of early core team.",
    healthy_standard: "Complementary technical + domain founder skills with execution velocity."
  },
  {
    id: "traction_growth",
    name: "Traction & Growth",
    description: "User growth velocity, paying customer velocity, monthly growth rate (MoM), and cohort retention.",
    healthy_standard: "MoM user/revenue growth >= 12% with controlled churn."
  },
  {
    id: "financial_health",
    name: "Financial Health",
    description: "Runway length (> 12-18 months healthy), monthly burn rate vs revenue, and capital efficiency.",
    healthy_standard: "Cash runway >= 14 months with disciplined burn multiple."
  },
  {
    id: "legal_compliance",
    name: "Legal & Compliance Risk",
    description: "Regulatory exposure, IP protection, licensing mandates, data privacy (DPDP/GDPR), and regulatory compliance posture.",
    healthy_standard: "Statutory registrations, DPDP 2023 compliance, and IP assignment in place."
  }
];
