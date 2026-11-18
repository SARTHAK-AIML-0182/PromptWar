import React from 'react';
import { CompetitorReport } from '../../types';
import { ShieldCheck, Target, ExternalLink } from 'lucide-react';

interface CompetitorsTabProps {
  competitors: CompetitorReport;
}

export const CompetitorsTab: React.FC<CompetitorsTabProps> = ({ competitors }) => {
  return (
    <div className="space-y-5">
      {/* Strategic Moat & Whitespace Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positioning Whitespace */}
        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm bg-gradient-to-br from-blue-50/40 to-white">
          <div className="flex items-center gap-2 mb-2 text-brand-blue">
            <Target className="w-4 h-4" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Identified Positioning Whitespace</h4>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {competitors.positioning_gap}
          </p>
        </div>

        {/* Moat Assessment */}
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm bg-gradient-to-br from-emerald-50/40 to-white">
          <div className="flex items-center gap-2 mb-2 text-brand-green">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Defensible Moat Strategy</h4>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {competitors.moat_assessment}
          </p>
        </div>
      </div>

      {/* Competitors Matrix */}
      <div>
        <h4 className="font-bold text-sm text-slate-900 mb-3">Key Competitors & Alternatives (Direct & Indirect)</h4>
        <div className="grid grid-cols-1 gap-3">
          {competitors.competitors.map((c, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 transition hover:border-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-sm text-slate-900">{c.name}</h5>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    c.type.toLowerCase().includes('direct')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {c.type} Competitor
                  </span>
                </div>
                <div className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  <span className="font-semibold text-slate-500">Pricing Model: </span>
                  <span className="font-medium text-slate-800">{c.pricing_model}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Strengths */}
                <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-1">
                    Key Strengths
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {c.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-rose-700 block mb-1">
                    Exploitable Weaknesses
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {c.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {c.url && (
                <div className="mt-2 text-right">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-brand-blue hover:underline inline-flex items-center gap-1"
                  >
                    Visit Competitor Website <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
