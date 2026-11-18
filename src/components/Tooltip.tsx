import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  term: string;
  explanation: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ term, explanation }) => {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1 group cursor-pointer" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span className="border-b border-dashed border-slate-400 font-medium text-slate-700">{term}</span>
      <HelpCircle className="w-3.5 h-3.5 ml-0.5 text-slate-400 group-hover:text-brand-blue transition-colors" />
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 p-2 bg-slate-900 text-white text-xs rounded-md shadow-lg z-50 pointer-events-none leading-relaxed text-center">
          {explanation}
        </span>
      )}
    </span>
  );
};
