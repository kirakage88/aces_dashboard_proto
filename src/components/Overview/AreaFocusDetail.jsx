import { CHART_COLORS } from '../../constants';

export default function AreaFocusDetail({ stats, view }) {
  return (
    <div className="bg-white dark:bg-dark-card p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-dark-border shadow-sm transition-colors">
      <h4 className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-dark-muted mb-4 md:mb-6 transition-colors">
        Area Focus Detail
      </h4>
      <div className="space-y-2 md:space-y-3">
        {stats.map((s, i) => {
          const pct = s.budget > 0 ? Math.round((s.spent / s.budget) * 100) : 0;
          return (
            <div
              key={i}
              className="flex items-center justify-between p-3 md:p-4 bg-slate-50 dark:bg-dark-input rounded-xl md:rounded-2xl border border-slate-100 dark:border-dark-border-md group hover:border-[#efbf04] dark:hover:border-[#fbcc0e] transition-all"
            >
              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                <div
                  className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-dark-text truncate transition-colors">{s.focus}</span>
              </div>
              <div className="text-right shrink-0 ml-2">
                {view === 'actual' ? (
                  <>
                    <div className="text-xs md:text-sm font-black text-[#550000]">₱{s.spent.toLocaleString()}</div>
                    <div className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-dark-muted transition-colors">
                      {pct}% of ₱{s.budget.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs md:text-sm font-black text-slate-900 dark:text-dark-text transition-colors">₱{s.budget.toLocaleString()}</div>
                    <div className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-dark-muted transition-colors">{s.count} Projects</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
