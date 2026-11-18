import React, { useState } from 'react';
import { FullReport, Currency } from '../../types';
import { getPdfDownloadUrl } from '../../lib/api';
import { StatusBadge } from '../Badge';
import { PillarsTab } from '../tabs/PillarsTab';
import { MarketTab } from '../tabs/MarketTab';
import { CompetitorsTab } from '../tabs/CompetitorsTab';
import { CustomersTab } from '../tabs/CustomersTab';
import { RoadmapTab } from '../tabs/RoadmapTab';
import {
  Download,
  Copy,
  Check,
  ArrowLeft,
  AlertTriangle,
  Layers,
  TrendingUp,
  Users,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ResultScreenProps {
  report: FullReport;
  currency: Currency;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ report, currency, onReset }) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'market' | 'competitors' | 'customers' | 'roadmap'>('pillars');
  const [copied, setCopied] = useState(false);

  const rel = report.reliability;
  const isIdea = rel.mode === 'idea';

  const handleCopySummary = () => {
    const summaryText = `Startup Co-Pilot Analysis: ${rel.startup_name}
Stage: ${rel.mode.toUpperCase()} STAGE
Overall Score: ${rel.overall_score}/10 (${rel.score_badge})
Verdict: ${rel.verdict_title}
Confidence: ${rel.confidence_level} (${rel.assumed_fields_count} fields assumed)

Top 3 Actions:
1. ${rel.top_3_actions[0] || 'N/A'}
2. ${rel.top_3_actions[1] || 'N/A'}
3. ${rel.top_3_actions[2] || 'N/A'}

Disclaimer: AI-based analysis. Not investment or legal advice.`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = () => {
    const url = getPdfDownloadUrl(report.job_id);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fadeIn space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Input
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-brand-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-brand-blue hover:bg-blue-700 text-white shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* TOP: RELIABILITY DASHBOARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        {/* Contradiction Warning Banner if any */}
        {rel.contradictions && rel.contradictions.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Contradiction Detected: </span>
              {rel.contradictions.map((c, i) => (
                <span key={i}>{c.message} </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Overall Reliability Score & Verdict */}
          <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isIdea ? 'Idea Validation Score' : 'Overall Reliability Score'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {rel.mode.toUpperCase()} STAGE
                </span>
              </div>

              {/* Score Display */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {rel.overall_score}
                </span>
                <span className="text-xl font-bold text-slate-400">/ 10</span>
                <StatusBadge status={rel.score_badge} className="text-sm px-3 py-1 ml-auto" />
              </div>

              {/* Confidence & Assumed Fields */}
              <div className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                <span className="font-semibold text-slate-700">Confidence: {rel.confidence_level}</span>
                <span>•</span>
                <span className={rel.assumed_fields_count > 0 ? 'text-amber-700 font-medium' : 'text-slate-500'}>
                  {rel.assumed_fields_count} fields were assumed
                </span>
              </div>
            </div>

            {/* Verdict Box */}
            <div className={`p-3.5 rounded-xl border ${
              rel.verdict_recommendation === 'Go' || rel.verdict_recommendation === 'Scale-Ready'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : rel.verdict_recommendation === 'Pivot'
                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-75 mb-0.5">
                {isIdea ? 'Validation Recommendation' : 'Reliability Verdict'}
              </div>
              <h4 className="font-bold text-sm leading-tight mb-1">{rel.verdict_title}</h4>
              <p className="text-xs leading-relaxed opacity-90">{rel.verdict_narrative}</p>
            </div>
          </div>

          {/* Right Column: Strong / Work On / Risk & Top 3 Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Pillar Counts */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                10-Pillar Breakdown
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-bold text-emerald-800">{rel.summary.strong_count}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Strong (≥7)</div>
                </div>
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-bold text-amber-800">{rel.summary.needs_work_count}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Needs Work (4–6.9)</div>
                </div>
                <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-bold text-rose-800">{rel.summary.risk_count}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Risk (&lt;4)</div>
                </div>
              </div>
            </div>

            {/* Top 3 Immediate Actions */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue block mb-1.5">
                Top 3 Immediate Actions:
              </span>
              <div className="space-y-1.5">
                {rel.top_3_actions.map((act, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="w-4 h-4 rounded-full bg-brand-blue text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="font-medium">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BELOW: 5 TABS NAVIGATION */}
      <div>
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'pillars', label: '10 Pillars', icon: Layers },
            { id: 'market', label: 'Market', icon: TrendingUp },
            { id: 'competitors', label: 'Competitors', icon: Compass },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'roadmap', label: 'Roadmap', icon: CheckCircle2 },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-brand-blue text-brand-blue bg-blue-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div className="pt-4">
          {activeTab === 'pillars' && <PillarsTab pillars={rel.pillars} mode={rel.mode} />}
          {activeTab === 'market' && <MarketTab market={report.market} />}
          {activeTab === 'competitors' && <CompetitorsTab competitors={report.competitors} />}
          {activeTab === 'customers' && <CustomersTab customers={report.customers} />}
          {activeTab === 'roadmap' && <RoadmapTab plan={report.execution_plan} />}
        </div>
      </div>

      {/* Assumptions Log (Accordion or visible box) */}
      {rel.assumptions_log && rel.assumptions_log.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
          <h5 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
            Transparent Assumption Log ({rel.assumptions_log.length} parameters)
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
            {rel.assumptions_log.map((asm, idx) => (
              <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">{asm.field_name}: </span>
                <span>Assumed {asm.assumed_value}. </span>
                <span className="text-slate-400 italic">({asm.reason})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <footer className="text-center py-4 border-t border-slate-200 text-xs text-slate-400">
        <p>{report.disclaimer || 'AI-based analysis. Not investment or legal advice.'}</p>
      </footer>
    </div>
  );
};
