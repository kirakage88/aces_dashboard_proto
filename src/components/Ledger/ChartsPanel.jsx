import { useMemo } from 'react';
import * as d3 from 'd3';
import { BarChart3, PieChart } from 'lucide-react';
import { formatPHP } from '../../utils/ledger';

export default function ChartsPanel({ transactions, totalDebit }) {
  const debitByProject = useMemo(
    () =>
      d3
        .rollups(transactions, (v) => d3.sum(v, (d) => d.debit), (d) => d.project)
        .sort((a, b) => b[1] - a[1]),
    [transactions]
  );

  const debitByAccount = useMemo(
    () =>
      d3
        .rollups(transactions, (v) => d3.sum(v, (d) => d.debit), (d) => d.account)
        .sort((a, b) => b[1] - a[1]),
    [transactions]
  );

  return (
    <div className="lg:col-span-4 space-y-4 md:space-y-6">
      <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border transition-colors">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="p-1.5 md:p-2 bg-[#550000]/10 text-[#550000] rounded-lg">
            <BarChart3 size={16} />
          </div>
          <h3 className="font-black text-slate-800 dark:text-dark-text uppercase text-[10px] md:text-xs tracking-widest transition-colors">
            Project Distribution
          </h3>
        </div>
        <div className="space-y-4 md:space-y-6">
          {debitByProject.map(([name, value], i) => (
            <div key={name || i}>
              <div className="flex justify-between text-[10px] md:text-[11px] mb-1.5 md:mb-2">
                <span className="font-black text-slate-500 dark:text-dark-muted truncate uppercase tracking-tight transition-colors">
                  {name || 'General'}
                </span>
                <span className="font-black text-slate-900 dark:text-dark-text transition-colors">{formatPHP(value)}</span>
              </div>
              <div className="w-full bg-slate-50 dark:bg-dark-input h-1.5 md:h-2 rounded-full overflow-hidden transition-colors">
                <div
                  className="bg-[#550000] h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(value / (totalDebit || 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border transition-colors">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="p-1.5 md:p-2 bg-[#efbf04]/10 dark:bg-dark-accent/10 text-[#efbf04] dark:text-dark-accent rounded-lg">
            <PieChart size={16} />
          </div>
          <h3 className="font-black text-slate-800 dark:text-dark-text uppercase text-[10px] md:text-xs tracking-widest transition-colors">
            Account Breakdown
          </h3>
        </div>
        <div className="space-y-2 md:space-y-3">
          {debitByAccount.map(([name, value], i) => (
            <div
              key={name || i}
              className="flex items-center justify-between p-2.5 md:p-3.5 bg-slate-50/50 dark:bg-dark-input/50 rounded-xl md:rounded-2xl hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors group"
            >
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div
                  className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: d3.schemeTableau10[i % 10] }}
                />
                <span className="text-[10px] md:text-[11px] font-black text-slate-600 dark:text-dark-text truncate uppercase tracking-tight transition-colors">
                  {name || 'Uncategorized'}
                </span>
              </div>
              <span className="text-[10px] md:text-[11px] font-black text-slate-400 dark:text-dark-muted group-hover:text-[#550000] dark:group-hover:text-dark-accent transition-colors shrink-0 ml-2">
                {Math.round((value / (totalDebit || 1)) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
