# Startup Co-Pilot: Hackathon Judge & Demo Script

Follow this script for an end-to-end evaluation of Startup Co-Pilot (Problem Statement PS08).

---

## 🚀 Quick Setup (Under 2 Minutes)

1. **Start the backend server:**
   ```bash
   python backend/run.py
   ```
   *(Server starts on `http://localhost:8000`. If `frontend/dist` is built, it serves the entire full-stack application directly!)*

2. **(Optional) Run Vite Dev Server:**
   ```bash
   cd frontend
   npm run dev
   ```
   *(Dev server opens on `http://localhost:5173` with proxy to `/api`)*

---

## 🧪 Demo Scenario 1: Idea Stage Founder (1-Click Demo)

1. Open `http://localhost:8000` (or `http://localhost:5173`).
2. Verify mode toggle is on **( ● ) Idea Stage**.
3. Click the chip: **"🌾 AI Crop Disease Detection"**.
   - Notice the pitch textarea automatically populates with a description for Indian smallholder farmers.
4. Click **"Analyze My Idea →"**.
5. **Observe Screen 2 (Agents Working):**
   - Watch the 7 autonomous agents execute live with status indicators (`⬜ waiting` → `⏳ running` → `✅ done`).
   - Notice live streaming telemetry in the black console.
6. **Observe Screen 3 (Results Dashboard):**
   - Note the **Validation Score** (e.g. `7.4/10`) and **GO** recommendation.
   - Look at the **10 Pillars tab**: notice that Unit Economics, Traction & Growth, and Financial Health are marked **"Not Applicable"** with 0 weight, proving we don't hallucinate traction for idea-stage founders!
   - Explore the **Market tab**: review TAM, SAM, SOM with plain-language definitions and CAGR.
   - Explore the **Roadmap tab**: see concrete 30-60-90 day tasks with role owners and metrics.
   - Click **"Download PDF Report"** to inspect the server-generated PDF.

---

## 🧪 Demo Scenario 2: Healthy Running Startup (KavachAI)

1. Click **"+ New Analysis"** in the top navigation bar.
2. Toggle to **( ○ ) Running Startup**.
3. In Demo Profiles, click: **"🟢 Healthy B2B SaaS"**.
   - Notice all 4 wizard steps are pre-populated (API Security Guard, 42 paying customers, ₹18.5L revenue, 82% margin, 20 months runway).
4. Click through steps or jump straight to Step 4 and click **"Run 10-Pillar Reliability Audit →"**.
5. **Observe Screen 3:**
   - Overall Reliability Score: `8.2/10` with **🟢 Strong** badge.
   - Stage-Aware Verdict: **"SCALE-READY — Solid Unit Economics & Foundation"**.
   - All 10 pillars scored with evidence and benchmark ranges.

---

## 🧪 Demo Scenario 3: Risky Running Startup (SnackZap)

1. Click **"+ New Analysis"**.
2. Under **Running Startup**, click: **"🔴 High-Risk D2C"**.
   - Notice high burn (₹11L/mo), low runway (3 months), weak margins (28%), high churn (14.5%).
3. Click **"Run 10-Pillar Reliability Audit →"**.
4. **Observe Screen 3:**
   - Overall Reliability Score drops into **🟡 Moderate / 🔴 At Risk** territory (`< 5.0/10`).
   - Verdict: **"HIGH RISK — Critical Financial / Operational Gaps"**.
   - Risk count highlights Unit Economics and Financial Health as acute vulnerabilities.

---

## 🧪 Demo Scenario 4: "Don't Know / Skip" & Assumption Log

1. In Running Startup mode, start a new company and click **"Don't know / Skip"** on CAC and Gross Margin.
2. Run analysis.
3. Observe the **Reliability Dashboard**:
   - Notice the label: *"2 fields were assumed"*.
   - Check the **Assumption Log** card at the bottom: clearly explains that industry medians were used and attributes them to the user.

---

## 🧪 Demo Scenario 5: Offline / No API Key Resilience

1. Even with no `.env` file or no API key, Startup Co-Pilot never crashes or times out.
2. The built-in high-fidelity mock engine generates complete, statistically grounded reports and benchmark comparisons offline.
