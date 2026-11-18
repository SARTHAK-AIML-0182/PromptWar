import React from 'react';
import { ExecutionPlan } from '../../types';
import { Calendar, Flag, AlertOctagon, CheckSquare } from 'lucide-react';

interface RoadmapTabProps {
  plan: ExecutionPlan;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ plan }) => {
  return (
    <div className="space-y-5">
      {/* North Star Primary Goal */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1 text-brand-blue">
          <Flag className="w-4 h-4" />
          <h4 className="font-bold text-xs uppercase tracking-wider">90-Day North Star Metric</h4>
        </div>
        <p className="text-sm font-bold text-slate-900 leading-snug">
          {plan.primary_goal}
        </p>
      </div>

      {/* 30-60-90 Day Phases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plan.phases.map((phase, pIdx) => {
          const colors = [
            'border-blue-300 bg-blue-50/20 text-brand-blue',
            'border-indigo-300 bg-indigo-50/20 text-indigo-700',
            'border-emerald-300 bg-emerald-50/20 text-brand-green'
          ];
          const badgeClass = colors[pIdx % colors.length];

          return (
            <div key={pIdx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div>
                {/* Phase Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${badgeClass}`}>
                    {phase.phase_name}
                  </span>
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>

                <h5 className="font-bold text-xs text-slate-900 mb-3 leading-snug">
                  {phase.objective}
                </h5>

                {/* Tasks List */}
                <div className="space-y-3">
                  {phase.tasks.map((task, tIdx) => (
                    <div key={tIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 leading-tight">{task.title}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                          task.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mb-2 leading-relaxed">{task.description}</p>
                      
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[10px]">
                        <span className="font-semibold text-brand-blue">Owner: {task.owner_role}</span>
                        <span className="font-medium text-slate-500 italic truncate max-w-[130px]">KPI: {task.success_metric}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical Risk Mitigation */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-rose-700 mb-0.5">Critical Execution Trap to Avoid</h4>
          <p className="text-xs text-rose-950 font-medium leading-relaxed">
            {plan.critical_risk_mitigation}
          </p>
        </div>
      </div>
    </div>
  );
};
