import React from 'react';
import { MarketReport } from '../../types';
import { TrendingUp, Clock, ExternalLink, Lightbulb } from 'lucide-react';
import { Tooltip } from '../Tooltip';

interface MarketTabProps {
  market: MarketReport;
}

export const MarketTab: React.FC<MarketTabProps> = ({ market }) => {
  return (
    <div className="space-y-5">
      {/* TAM / SAM / SOM Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* TAM */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-brand-blue transition">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              TAM
              <Tooltip term="" explanation="Total Addressable Market: The overall revenue opportunity if you achieved 100% market share." />
            </span>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Total Market</span>
          </div>
          <div className="text-xl font-bold text-slate-900 my-1">{market.tam.value_display}</div>
          <p className="text-xs text-slate-600 leading-snug">{market.tam.plain_explanation}</p>
          <div className="text-[10px] text-slate-400 mt-2 italic border-t border-slate-100 pt-1.5">
            Method: {market.tam.methodology}
          </div>
        </div>

        {/* SAM */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-brand-blue transition">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              SAM
              <Tooltip term="" explanation="Serviceable Addressable Market: The segment of TAM targeted by your specific product and geography." />
            </span>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Serviceable</span>
          </div>
          <div className="text-xl font-bold text-slate-900 my-1">{market.sam.value_display}</div>
          <p className="text-xs text-slate-600 leading-snug">{market.sam.plain_explanation}</p>
          <div className="text-[10px] text-slate-400 mt-2 italic border-t border-slate-100 pt-1.5">
            Method: {market.sam.methodology}
          </div>
        </div>

        {/* SOM */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-brand-blue transition">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              SOM
              <Tooltip term="" explanation="Serviceable Obtainable Market: The realistic realistic market share you can capture in the next 2-4 years." />
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Obtainable</span>
          </div>
          <div className="text-xl font-bold text-slate-900 my-1">{market.som.value_display}</div>
          <p className="text-xs text-slate-600 leading-snug">{market.som.plain_explanation}</p>
          <div className="text-[10px] text-slate-400 mt-2 italic border-t border-slate-100 pt-1.5">
            Method: {market.som.methodology}
          </div>
        </div>
      </div>

      {/* Growth & Timing Drivers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Growth Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-brand-green flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Industry Growth Rate</h4>
            <div className="text-base font-bold text-slate-900 my-0.5">{market.cagr_growth_rate}</div>
            <p className="text-xs text-slate-600">{market.summary}</p>
          </div>
        </div>

        {/* Timing ("Why Now?") */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Market Timing ("Why Now?")</h4>
            <p className="text-xs text-slate-800 font-medium mt-1 leading-relaxed">{market.timing_assessment}</p>
          </div>
        </div>
      </div>

      {/* Key Trends */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          3–5 Macro Industry Trends
        </h4>
        <div className="space-y-2">
          {market.key_trends.map((trend, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{trend}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Sources */}
      {market.sources && market.sources.length > 0 && (
        <div className="pt-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Research Sources & Evidence Citations</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {market.sources.map((s, i) => (
              <a
                key={i}
                href={s.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-xs p-2.5 rounded-lg border border-slate-200 bg-white hover:border-brand-blue hover:shadow-xs transition flex items-center justify-between group"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-800 block truncate group-hover:text-brand-blue">{s.title}</span>
                  <span className="text-[10px] text-slate-400">{s.is_estimate ? 'AI Synthetic Estimate' : 'External Research Study'}</span>
                </div>
                {s.url && <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-blue shrink-0" />}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
