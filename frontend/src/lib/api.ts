import { FullReport, IdeaDemo, StartupDemo, PastReportItem } from '../types';

const API_BASE = '/api';

export async function fetchDemos(): Promise<{ idea_demos: IdeaDemo[]; startup_demos: StartupDemo[] }> {
  const res = await fetch(`${API_BASE}/demos`);
  if (!res.ok) throw new Error('Failed to load demo presets');
  return res.json();
}

export async function fetchPastReports(): Promise<PastReportItem[]> {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to load past reports');
  return res.json();
}

export async function startAnalysis(payload: any): Promise<{ job_id: string; mode: string; status: string }> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to start analysis');
  }
  return res.json();
}

export async function fetchReport(jobId: string): Promise<FullReport> {
  const res = await fetch(`${API_BASE}/report/${jobId}`);
  if (!res.ok) throw new Error('Analysis report not ready or not found');
  return res.json();
}

export async function uploadPitchDeck(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload-deck`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to parse pitch deck');
  }
  return res.json();
}

export function getPdfDownloadUrl(jobId: string): string {
  return `${API_BASE}/report/${jobId}/pdf`;
}
