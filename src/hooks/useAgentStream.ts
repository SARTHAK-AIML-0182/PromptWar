import { useState, useEffect, useRef } from 'react';
import { AgentStatus, FullReport } from '../types';
import { fetchReport } from '../lib/api';

const DEFAULT_AGENTS: AgentStatus[] = [
  { agent_id: 'market_agent', name: 'Market Research Agent', state: 'waiting', message: 'Waiting to analyze market sizing & CAGR...' },
  { agent_id: 'competitor_agent', name: 'Competitor Analysis Agent', state: 'waiting', message: 'Waiting to benchmark direct & indirect rivals...' },
  { agent_id: 'customer_agent', name: 'Customer Profiling Agent', state: 'waiting', message: 'Waiting to profile user personas & demand...' },
  { agent_id: 'financial_agent', name: 'Financial Analyst Agent', state: 'waiting', message: 'Waiting to audit unit economics & runway...' },
  { agent_id: 'risk_agent', name: 'Risk & Compliance Agent', state: 'waiting', message: 'Waiting to review legal, DPDP & licensing risks...' },
  { agent_id: 'scorer_agent', name: 'Validator / Scorer Agent', state: 'waiting', message: 'Waiting to evaluate the 10 pillars against rubrics...' },
  { agent_id: 'planner_agent', name: 'Execution Planner Agent', state: 'waiting', message: 'Waiting to build 30-60-90 day roadmap...' }
];

export function useAgentStream(jobId: string | null, onCompleted: (report: FullReport) => void) {
  const [statuses, setStatuses] = useState<AgentStatus[]>(DEFAULT_AGENTS);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!jobId) {
      setStatuses(DEFAULT_AGENTS);
      setLogs([]);
      setIsDone(false);
      setError(null);
      return;
    }

    setStatuses(DEFAULT_AGENTS);
    setLogs(['Connecting to Multi-Agent Orchestrator...']);
    setIsDone(false);
    setError(null);

    const es = new EventSource(`/api/stream/${jobId}`);
    eventSourceRef.current = es;

    es.addEventListener('agent_status', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        const data = payload.data as AgentStatus;
        if (data && data.agent_id) {
          setStatuses(prev => prev.map(a => (a.agent_id === data.agent_id ? { ...a, ...data } : a)));
        }
      } catch (err) {
        console.error('Error parsing agent_status event:', err);
      }
    });

    es.addEventListener('log', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.message) {
          setLogs(prev => [payload.message, ...prev].slice(0, 8));
        }
      } catch (err) {
        console.error('Error parsing log event:', err);
      }
    });

    es.addEventListener('complete', async (e: MessageEvent) => {
      try {
        setIsDone(true);
        es.close();
        // Fetch full report from database to ensure complete hydration
        const full = await fetchReport(jobId);
        onCompleted(full);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve final report');
      }
    });

    es.addEventListener('error', async (e) => {
      // If error occurs, check if report already completed in background
      try {
        const full = await fetchReport(jobId);
        if (full) {
          setIsDone(true);
          es.close();
          onCompleted(full);
          return;
        }
      } catch (_) {
        // Report not ready yet
      }
    });

    return () => {
      if (es) es.close();
    };
  }, [jobId]);

  return { statuses, logs, isDone, error };
}
