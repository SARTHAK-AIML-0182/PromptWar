import { IdeaDemo, StartupDemo } from '../types';

export const IDEA_DEMOS: IdeaDemo[] = [
  {
    id: "idea-crop-ai",
    chip_label: "🌾 AI Crop Disease Detection",
    title: "AI Crop-Disease Detection for Farmers",
    description: "A multilingual WhatsApp-based AI assistant for smallholder farmers in India. Farmers snap a photo of damaged crop leaves, and the AI diagnoses the disease in 5 seconds, recommends locally available organic or pesticide treatments in their native language (Hindi, Marathi, Telugu), and connects them to vetted local agri-retailers for delivery.",
    industry: "AgriTech",
    target_market: "India / Tier-3 & Rural"
  },
  {
    id: "idea-hyperlocal-pharma",
    chip_label: "💊 Hyperlocal Pharmacy Delivery",
    title: "Hyperlocal 15-Minute Prescription Delivery",
    description: "An ultra-fast prescription fulfillment network aggregating independent local mom-and-pop pharmacies (chemists) across tier-2 cities. Instead of massive dark stores, it connects nearby verified licensed chemists with gig delivery riders, guaranteeing 15-minute emergency medicine delivery with automated digital prescription verification.",
    industry: "HealthTech",
    target_market: "India / Tier-2 & Tier-3 Cities"
  },
  {
    id: "idea-interview-prep",
    chip_label: "🎯 AI Interview Prep for Tier-2 Colleges",
    title: "Vernacular AI Mock Interviews for Tier-2 College Students",
    description: "An AI-powered voice and video mock interview simulator specifically engineered for engineering and commerce students from non-metro colleges. It conducts realistic technical and HR interviews, offers bilingual Hinglish feedback on voice modulation, code explanations, and English fluency, and matches top performers with partner tech hiring managers.",
    industry: "EdTech",
    target_market: "India / College Graduates"
  }
];

export const STARTUP_DEMOS: StartupDemo[] = [
  {
    id: "startup-healthy-b2b",
    name: "KavachAI - API Security Guard",
    profile_label: "🟢 Healthy B2B SaaS (Strong Unit Economics & Runway)",
    description: "Autonomous API security testing and runtime anomaly detection for FinTech and HealthTech companies handling sensitive customer data.",
    stage: "Seed",
    industry: "SaaS",
    website: "https://kavach.ai",
    traction: {
      total_users: 18500,
      paying_customers: 42,
      monthly_revenue_inr: 1850000,
      monthly_growth_pct: 18.5
    },
    business: {
      pricing_inr: 45000,
      cac_inr: 38000,
      gross_margin_pct: 82.0,
      churn_pct: 1.2,
      runway_months: 20,
      monthly_burn_inr: 950000,
      funding_raised_inr: 25000000
    },
    team_legal: {
      team_size: 9,
      founder_experience: "Ex-Cybersecurity Architect at AWS & IIT Delhi Computer Science graduate with 8 years in threat intelligence.",
      licenses_ip_status: "Provisional patent filed for automated API vulnerability detection algorithm; SOC2 Type II compliant."
    }
  },
  {
    id: "startup-risky-d2c",
    name: "SnackZap - On-Demand Artisan Snacks",
    profile_label: "🔴 High-Risk D2C / Quick Commerce (Weak Unit Economics & Burn)",
    description: "Instant 10-minute delivery of artisanal fresh baked cookies and street treats via leased micro-kitchens in South Delhi.",
    stage: "Pre-seed",
    industry: "E-Commerce / D2C",
    website: "https://snackzap.in",
    traction: {
      total_users: 4200,
      paying_customers: 180,
      monthly_revenue_inr: 280000,
      monthly_growth_pct: 4.5
    },
    business: {
      pricing_inr: 350,
      cac_inr: 1800,
      gross_margin_pct: 28.0,
      churn_pct: 14.5,
      runway_months: 3,
      monthly_burn_inr: 1100000,
      funding_raised_inr: 4000000
    },
    team_legal: {
      team_size: 14,
      founder_experience: "First-time founders with marketing background; no previous food logistics or supply chain experience.",
      licenses_ip_status: "FSSAI central license pending; municipal kitchen health clearances in progress."
    }
  }
];
