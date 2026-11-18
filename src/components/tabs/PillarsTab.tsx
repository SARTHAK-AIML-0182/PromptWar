import React from 'react';
import { PillarScore } from '../../types';
import { StatusBadge } from '../Badge';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface PillarsTabProps {
  pillars: PillarScore[];
  mode: string;
}

export const PillarsTab: React.FC<PillarsTabProps> = ({ pillars, mode }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">The 10-Pillar Reliability Standard: </span>
          Each pillar is scored out of 10 based on evidence, benchmarks, or explicit assumptions.
          {mode === 'idea' && (
            <span className="ml-1 text-blue-700">
              For Idea Stage, traction and financial pillars (Unit Economics, Traction, Financial Health) are excluded from the score to prevent manufactured certainty.
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((p, idx) => {
          const isNA = p.status === 'Not Applicable';
          return (
            <div
              key={p.pillar_id || idx}
              className={`rounded-xl border p-4 bg-white transition hover:shadow-md flex flex-col justify-between ${
                p.status === 'Risk'
                  ? 'border-rose-300 bg-rose-50/20'
                  : p.status === 'Needs Work'
                  ? 'border-amber-300'
                  : isNA
                  ? 'border-slate-200 bg-slate-50/50'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isNA && (
                      <span className="font-bold text-base text-slate-900">
                        {p.score !== null ? `${p.score}/10` : '—'}
                      </span>
                    )}
                    <StatusBadge status={p.status} />
                  </div>
                </div>

                {/* What We Found */}
                <div className="mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    What We Found
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">{p.what_we_found}</p>
                </div>

                {/* Benchmark Comparison */}
                <div className="mb-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Healthy Benchmark / Target
                  </span>
                  <span className="text-slate-700">{p.benchmark_healthy_range}</span>
                </div>

                {/* Recommended Fix */}
                {!isNA && (
                  <div className="mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue block mb-0.5">
                      Recommended Fix
                    </span>
                    <p className="text-xs text-slate-700 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      {p.recommended_fix}
                    </p>
                  </div>
                )}
              </div>

              {/* Basis / Evidence Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[240px]">
                  <b>Basis:</b> {p.evidence_basis}
                </span>
                <span className="shrink-0 font-medium text-slate-500">Confidence: {p.confidence}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
