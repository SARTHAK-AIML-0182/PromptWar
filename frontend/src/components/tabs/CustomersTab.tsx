import React from 'react';
import { CustomerReport } from '../../types';
import { Users, DollarSign, ArrowUpRight, Flame } from 'lucide-react';

interface CustomersTabProps {
  customers: CustomerReport;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({ customers }) => {
  return (
    <div className="space-y-5">
      {/* Demand Evidence Card */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1 text-amber-800">
          <Flame className="w-4 h-4 text-amber-600" />
          <h4 className="font-bold text-xs uppercase tracking-wider">Demand Signals & Search Pull</h4>
        </div>
        <p className="text-xs text-amber-950 leading-relaxed font-medium">
          {customers.demand_evidence}
        </p>
      </div>

      {/* Personas Cards */}
      <div>
        <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-blue" />
          Validated Target Buyer Personas
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.personas.map((p, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition flex flex-col justify-between">
              <div>
                {/* Persona Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-xs shrink-0">
                    P{idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">{p.name}</h5>
                    <p className="text-xs text-slate-500">{p.role_demographics}</p>
                  </div>
                </div>

                {/* Core Pain */}
                <div className="mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-0.5">
                    Acute Daily Pain Point
                  </span>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed bg-rose-50/40 p-2 rounded-lg border border-rose-100">
                    {p.core_pain_point}
                  </p>
                </div>

                {/* Current Alternative */}
                <div className="mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Current Makeshift Alternative
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {p.current_alternative}
                  </p>
                </div>
              </div>

              {/* Willingness to Pay */}
              <div className="pt-2.5 border-t border-slate-100 mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-brand-green" />
                  Willingness to Pay:
                </span>
                <span className="font-semibold text-slate-800 text-right">{p.willingness_to_pay}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acquisition Channels */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <ArrowUpRight className="w-4 h-4 text-brand-blue" />
          Recommended Customer Acquisition Channels
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {customers.acquisition_channels.map((chan, i) => (
            <div key={i} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 font-medium">
              • {chan}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
