import React from 'react';
import { Currency } from '../types';
import { History, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  onCurrencyToggle: () => void;
  onOpenHistory: () => void;
  onNewAnalysis: () => void;
  hasActiveReport: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  onCurrencyToggle,
  onOpenHistory,
  onNewAnalysis,
  hasActiveReport
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNewAnalysis}>
          <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">Startup Co-Pilot</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-brand-blue border border-blue-200">
                PS08
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Multi-Agent Startup Reliability & Readiness System</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveReport && (
            <button
              onClick={onNewAnalysis}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              + New Analysis
            </button>
          )}

          {/* Currency Toggle */}
          <button
            onClick={onCurrencyToggle}
            className="flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
            title="Toggle Currency Display"
          >
            <span className={currency === 'INR' ? 'text-brand-blue font-bold' : 'text-slate-400'}>₹ INR</span>
            <span className="mx-1 text-slate-300">|</span>
            <span className={currency === 'USD' ? 'text-brand-blue font-bold' : 'text-slate-400'}>$ USD</span>
          </button>

          {/* Past Reports Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Past Reports</span>
          </button>
        </div>
      </div>
    </header>
  );
};
