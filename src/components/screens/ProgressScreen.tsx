import React from 'react';
import { AgentStatus } from '../../types';
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw, Sparkles } from 'lucide-react';

interface ProgressScreenProps {
  statuses: AgentStatus[];
  logs: string[];
  error: string | null;
  onRetry: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ statuses, logs, error, onRetry }) => {
  const completedCount = statuses.filter(s => s.state === 'done').length;
  const progressPercent = Math.round((completedCount / statuses.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fadeIn">
      {/* Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-blue border border-blue-200 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          Multi-Agent System Orchestrating
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Evaluating Startup Reliability</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          7 specialized autonomous agents are performing real-time market sizing, rival benchmarking, unit economics auditing, and rubric scoring.
        </p>

        {/* Overall Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden border border-slate-200">
          <div
            className="bg-brand-blue h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mt-1.5 px-1">
          <span>{completedCount} of {statuses.length} Agents Completed</span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* Agents Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Agent Pipeline</span>
          <span className="text-xs text-slate-400">Live SSE Feed</span>
        </div>

        <div className="divide-y divide-slate-100">
          {statuses.map((agent) => {
            const isDone = agent.state === 'done';
            const isRunning = agent.state === 'running';
            const isFailed = agent.state === 'failed';
            const isWaiting = agent.state === 'waiting';

            return (
              <div
                key={agent.agent_id}
                className={`p-4 flex items-start gap-3.5 transition-colors ${
                  isRunning ? 'bg-blue-50/40' : isDone ? 'bg-white' : 'bg-slate-50/20'
                }`}
              >
                {/* State Icon */}
                <div className="mt-0.5 shrink-0">
                  {isDone && <CheckCircle2 className="w-5 h-5 text-brand-green" />}
                  {isRunning && <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />}
                  {isFailed && <XCircle className="w-5 h-5 text-rose-500" />}
                  {isWaiting && (
                    <div className="w-5 h-5 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center">
                      <Clock className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold ${isRunning ? 'text-brand-blue' : 'text-slate-900'}`}>
                      {agent.name}
                    </h4>
                    {isDone && agent.elapsed_ms && (
                      <span className="text-[10px] text-slate-400 font-mono">{agent.elapsed_ms}ms</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{agent.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Stream Narrative Log */}
      {logs.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-3.5 text-slate-300 font-mono text-[11px] shadow-inner mb-4">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-sans font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Orchestrator Telemetry
          </div>
          <div className="space-y-1">
            {logs.slice(0, 4).map((log, i) => (
              <div key={i} className="truncate text-slate-300">
                <span className="text-blue-400">&gt;</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error / Retry Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}
    </div>
  );
};
