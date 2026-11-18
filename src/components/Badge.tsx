import React from 'react';

interface BadgeProps {
  status: 'Strong' | 'Needs Work' | 'Risk' | 'Not Applicable' | string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-300';
  let dot = 'bg-slate-400';

  if (status === 'Strong' || status.includes('Strong') || status.includes('🟢')) {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    dot = 'bg-emerald-500';
  } else if (status === 'Needs Work' || status.includes('Moderate') || status.includes('🟡')) {
    bg = 'bg-amber-50 text-amber-800 border-amber-300';
    dot = 'bg-amber-500';
  } else if (status === 'Risk' || status.includes('Risk') || status.includes('🔴')) {
    bg = 'bg-rose-50 text-rose-800 border-rose-300';
    dot = 'bg-rose-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
};
