import React from 'react';
import { X, ArrowRight, FileText } from 'lucide-react';
import { PastReportItem } from '../types';
import { StatusBadge } from './Badge';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: PastReportItem[];
  onSelectReport: (jobId: string) => void;
}

export const HistoryModal: React.FC<ModalProps> = ({ isOpen, onClose, reports, onSelectReport }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 max-h-[85vh] flex flex-col border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Saved Reliability Reports</h2>
            <p className="text-xs text-slate-500">Instant offline access to past founder evaluations</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto divide-y divide-slate-100 py-2 flex-1">
          {reports.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              No past reports generated yet. Run your first analysis!
            </div>
          ) : (
            reports.map((r) => (
              <div
                key={r.job_id}
                onClick={() => {
                  onSelectReport(r.job_id);
                  onClose();
                }}
                className="py-3 px-3 hover:bg-blue-50/50 rounded-xl cursor-pointer transition flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 group-hover:text-brand-blue">{r.startup_name}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {r.mode} Stage
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{r.created_at.slice(0, 10)}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{r.verdict}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">{r.overall_score}/10</div>
                    <StatusBadge status={r.score_badge} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-blue transition" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
