import { FullReport, PastReportItem } from '../types';

const STORAGE_KEY = 'startup_copilot_past_reports';

export function saveReportLocally(report: FullReport) {
  try {
    const existing = getStoredReports();
    const item: PastReportItem = {
      job_id: report.job_id,
      mode: report.mode,
      startup_name: report.reliability.startup_name,
      overall_score: report.reliability.overall_score,
      score_badge: report.reliability.score_badge,
      verdict: report.reliability.verdict_title,
      created_at: report.reliability.created_at
    };
    
    // Save summary item and full report
    const updated = [item, ...existing.filter(r => r.job_id !== report.job_id)].slice(0, 25);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(`report_${report.job_id}`, JSON.stringify(report));
  } catch (err) {
    console.error("Error saving report to localStorage:", err);
  }
}

export function getStoredReports(): PastReportItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}

export function getStoredReportById(jobId: string): FullReport | null {
  try {
    const data = localStorage.getItem(`report_${jobId}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}
