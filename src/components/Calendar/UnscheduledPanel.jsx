import { AlertCircle, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

export default function UnscheduledPanel({ unscheduledProjects, onProjectClick }) {
  return (
    <div className="lg:col-span-4 space-y-6 md:space-y-8">
      <div className="bg-white border border-slate-100 rounded-[2rem] md:rounded-[3rem] shadow-sm p-5 md:p-8 flex flex-col max-h-[400px] md:max-h-[640px]">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2 text-sm md:text-base">
            <AlertCircle size={16} className="text-[#efbf04]" />
            Unscheduled ({unscheduledProjects.length})
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 md:space-y-3">
          {unscheduledProjects.length === 0 ? (
            <div className="py-8 md:py-12 text-center text-slate-300">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400 opacity-60" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">All projects scheduled</span>
            </div>
          ) : (
            unscheduledProjects.map((proj) => (
              <div
                key={proj.index_}
                onClick={() => onProjectClick(proj)}
                className="p-3 md:p-4 bg-slate-50 hover:bg-white hover:border-[#efbf04] hover:shadow-md border border-slate-100 rounded-xl md:rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-start gap-2 mb-1 md:mb-2">
                  <h4 className="font-black text-slate-800 text-[10px] md:text-xs leading-snug group-hover:text-[#550000] transition-colors truncate">
                    {proj.name}
                  </h4>
                  <StatusBadge status={proj.status} />
                </div>
                <div className="flex justify-between items-center text-[9px] md:text-[10px] text-slate-400 font-black">
                  <span>{proj.head || 'No Assigned Lead'}</span>
                  <span className="text-[#550000]">₱{proj.budget.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
