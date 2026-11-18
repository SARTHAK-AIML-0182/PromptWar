# Assumptions Log (Startup Co-Pilot)

This document tracks all design and operational assumptions made during the design and execution of Startup Co-Pilot.

## 1. Domain & Scoring Assumptions
- **Idea Stage Evaluation**: When a user is in "Idea Stage", unit economics (CAC/LTV), historical traction, and actual runway/burn cannot be measured without manufacturing false confidence. Therefore, Pillars 6 (Unit Economics), 8 (Traction & Growth), and 9 (Financial Health) are marked "Not applicable yet", excluded from the weighted score calculation, and the remaining 7 pillars are normalized to 100%. Pillar 10 (Legal & Compliance) acts as an advisory check.
- **Running Startup Skipped Fields**: Whenever a founder selects "Don't know / Skip" or leaves a metric blank in the 4-step wizard, the system pulls default median estimates from `benchmarks.json` corresponding to that specific industry and stage. Every inferred metric is logged in the `assumptions` collection and visibly attributed to the founder (e.g., *"CAC was not specified; industry benchmark of ₹3,500 was assumed"*).
- **Confidence Scoring**: Confidence is mathematically computed based on user data completeness, validation evidence, and the ratio of assumed fields to provided fields.
  - ≥ 85% data provided with source corroboration = **High**
  - 50%–84% data provided = **Medium**
  - < 50% data provided (or all fields skipped) = **Low**

## 2. Currency & Geographic Assumptions
- Primary focus is India and global startup hubs. Default currency representation is Indian Rupee (INR - ₹, Lakhs, Crores) with a toggle for USD ($).
- Regulatory analysis focuses on key Indian regulatory frameworks by default (e.g., DPDP Act 2023, RBI FinTech regulations, CDSCO for HealthTech, FSSAI for food/agritech) while adapting to any target market indicated.

## 3. Resilience & Offline Mode
- If no external API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`, etc.) are provided in `.env`, or if external network rate-limits occur, the application defaults to an offline high-fidelity **Mock Mode**.
- Search queries fall back to structured, curated industry intelligence so demonstrations, hackathon evaluations, and automated tests run seamlessly with zero broken states.
