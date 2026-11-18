export interface MetricBenchmark {
  healthy_min: number;
  healthy_max: number;
  unit: string;
}

export interface IndustryBenchmark {
  gross_margin_pct: MetricBenchmark;
  cac_ltv_ratio: MetricBenchmark;
  monthly_churn_pct: MetricBenchmark;
  cac_payback_months: MetricBenchmark;
  mom_growth_pct: MetricBenchmark;
  runway_months: MetricBenchmark;
  typical_tam_b: number;
  typical_sam_b: number;
  typical_som_m: number;
  median_cac_inr: number;
  median_arpu_monthly_inr: number;
}

export const BENCHMARKS: Record<string, IndustryBenchmark> = {
  "SaaS": {
    gross_margin_pct: { healthy_min: 70, healthy_max: 85, unit: "%" },
    cac_ltv_ratio: { healthy_min: 3.0, healthy_max: 5.0, unit: "x" },
    monthly_churn_pct: { healthy_min: 0.5, healthy_max: 3.0, unit: "%" },
    cac_payback_months: { healthy_min: 6, healthy_max: 14, unit: "months" },
    mom_growth_pct: { healthy_min: 10, healthy_max: 25, unit: "%" },
    runway_months: { healthy_min: 12, healthy_max: 24, unit: "months" },
    typical_tam_b: 50,
    typical_sam_b: 8,
    typical_som_m: 120,
    median_cac_inr: 4500,
    median_arpu_monthly_inr: 2500
  },
  "FinTech": {
    gross_margin_pct: { healthy_min: 50, healthy_max: 75, unit: "%" },
    cac_ltv_ratio: { healthy_min: 3.5, healthy_max: 6.0, unit: "x" },
    monthly_churn_pct: { healthy_min: 1.0, healthy_max: 4.0, unit: "%" },
    cac_payback_months: { healthy_min: 8, healthy_max: 18, unit: "months" },
    mom_growth_pct: { healthy_min: 15, healthy_max: 30, unit: "%" },
    runway_months: { healthy_min: 15, healthy_max: 24, unit: "months" },
    typical_tam_b: 120,
    typical_sam_b: 25,
    typical_som_m: 400,
    median_cac_inr: 3500,
    median_arpu_monthly_inr: 1800
  },
  "E-Commerce / D2C": {
    gross_margin_pct: { healthy_min: 45, healthy_max: 65, unit: "%" },
    cac_ltv_ratio: { healthy_min: 2.5, healthy_max: 4.0, unit: "x" },
    monthly_churn_pct: { healthy_min: 3.0, healthy_max: 8.0, unit: "%" },
    cac_payback_months: { healthy_min: 3, healthy_max: 9, unit: "months" },
    mom_growth_pct: { healthy_min: 12, healthy_max: 25, unit: "%" },
    runway_months: { healthy_min: 10, healthy_max: 18, unit: "months" },
    typical_tam_b: 80,
    typical_sam_b: 15,
    typical_som_m: 250,
    median_cac_inr: 1200,
    median_arpu_monthly_inr: 1500
  },
  "EdTech": {
    gross_margin_pct: { healthy_min: 60, healthy_max: 80, unit: "%" },
    cac_ltv_ratio: { healthy_min: 2.8, healthy_max: 4.5, unit: "x" },
    monthly_churn_pct: { healthy_min: 2.0, healthy_max: 6.0, unit: "%" },
    cac_payback_months: { healthy_min: 6, healthy_max: 12, unit: "months" },
    mom_growth_pct: { healthy_min: 10, healthy_max: 20, unit: "%" },
    runway_months: { healthy_min: 12, healthy_max: 20, unit: "months" },
    typical_tam_b: 40,
    typical_sam_b: 7,
    typical_som_m: 90,
    median_cac_inr: 2800,
    median_arpu_monthly_inr: 1200
  },
  "AgriTech": {
    gross_margin_pct: { healthy_min: 30, healthy_max: 55, unit: "%" },
    cac_ltv_ratio: { healthy_min: 3.0, healthy_max: 5.0, unit: "x" },
    monthly_churn_pct: { healthy_min: 1.5, healthy_max: 5.0, unit: "%" },
    cac_payback_months: { healthy_min: 6, healthy_max: 15, unit: "months" },
    mom_growth_pct: { healthy_min: 8, healthy_max: 20, unit: "%" },
    runway_months: { healthy_min: 14, healthy_max: 24, unit: "months" },
    typical_tam_b: 35,
    typical_sam_b: 6,
    typical_som_m: 70,
    median_cac_inr: 1500,
    median_arpu_monthly_inr: 900
  },
  "HealthTech": {
    gross_margin_pct: { healthy_min: 55, healthy_max: 75, unit: "%" },
    cac_ltv_ratio: { healthy_min: 3.0, healthy_max: 5.5, unit: "x" },
    monthly_churn_pct: { healthy_min: 1.0, healthy_max: 3.5, unit: "%" },
    cac_payback_months: { healthy_min: 9, healthy_max: 18, unit: "months" },
    mom_growth_pct: { healthy_min: 10, healthy_max: 22, unit: "%" },
    runway_months: { healthy_min: 18, healthy_max: 30, unit: "months" },
    typical_tam_b: 60,
    typical_sam_b: 12,
    typical_som_m: 150,
    median_cac_inr: 4000,
    median_arpu_monthly_inr: 2200
  },
  "General / Other": {
    gross_margin_pct: { healthy_min: 50, healthy_max: 75, unit: "%" },
    cac_ltv_ratio: { healthy_min: 3.0, healthy_max: 5.0, unit: "x" },
    monthly_churn_pct: { healthy_min: 1.5, healthy_max: 5.0, unit: "%" },
    cac_payback_months: { healthy_min: 6, healthy_max: 14, unit: "months" },
    mom_growth_pct: { healthy_min: 10, healthy_max: 25, unit: "%" },
    runway_months: { healthy_min: 12, healthy_max: 24, unit: "months" },
    typical_tam_b: 50,
    typical_sam_b: 10,
    typical_som_m: 100,
    median_cac_inr: 3000,
    median_arpu_monthly_inr: 2000
  }
};
