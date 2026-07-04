import { FileText } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

export default function BudgetAllocationList({ projects, spendMap, view }) {
  const sorted = [...projects].sort((a, b) => b.budget - a.budget);

  return (
    <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm min-h-[400px] md:min-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h3 className="font-black text-slate-900 flex items-center gap-3 text-sm md:text-base">
          <div className="bg-[#efbf04]/10 p-1.5 md:p-2 rounded-xl text-[#efbf04]">
            <FileText size={16} />
          </div>
          Budget Allocation
        </h3>
        <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Total: {projects.length} Entries
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar space-y-3 md:space-y-4">
        {sorted.map((p, i) => {
          const spent = spendMap?.[p.id] || 0;
          const pct = p.budget > 0 ? Math.min((spent / p.budget) * 100, 100) : 0;
          const remaining = Math.max(p.budget - spent, 0);
          return (
            <div
              key={p.index_}
              className="flex items-center gap-3 md:gap-6 p-3 md:p-5 rounded-2xl md:rounded-3xl bg-white border border-slate-100 hover:shadow-lg transition-all"
            >
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-[9px] md:text-xs shrink-0">
                #{i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-black text-slate-900 truncate text-xs md:text-sm">{p.name}</h5>
                <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 md:mt-1">
                  {p.focus}
                </p>
              </div>
              {view === 'actual' ? (
                <div className="text-right shrink-0">
                  <div className="text-xs md:text-sm font-black text-[#550000]">₱{spent.toLocaleString()}</div>
                  <div className="mt-1 hidden md:block">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-auto">
                      <div
                        className="bg-[#efbf04] h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                      ₱{remaining.toLocaleString()} left
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-right shrink-0">
                  <div className="text-xs md:text-sm font-black text-[#550000]">₱{p.budget.toLocaleString()}</div>
                  <div className="mt-1"><StatusBadge status={p.status} /></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
