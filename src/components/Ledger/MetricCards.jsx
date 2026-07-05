import { ArrowDownRight, ArrowUpRight, DollarSign, Layers } from 'lucide-react';
import { formatPHP } from '../../utils/ledger';

export default function MetricCards({ totalDebit, totalCredit, balance, count }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border hover:shadow-md transition-all transition-colors">
        <div className="flex justify-between items-center mb-3 md:mb-6">
          <div className="p-2 md:p-3 bg-[#550000]/10 text-[#550000] rounded-xl md:rounded-2xl">
            <ArrowDownRight size={18} />
          </div>
          <span className="text-[8px] md:text-[10px] font-black text-[#efbf04] dark:text-[#fbcc0e] bg-[#efbf04]/10 dark:bg-[#fbcc0e]/10 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase leading-tight text-center">
            Monthly Inflow
          </span>
        </div>
        <p className="text-[9px] md:text-xs font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest mb-1 transition-colors">Total Debit</p>
        <p className="text-lg md:text-2xl font-black text-slate-800 dark:text-dark-text truncate transition-colors">{formatPHP(totalDebit)}</p>
      </div>

      <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border hover:shadow-md transition-all transition-colors">
        <div className="flex justify-between items-center mb-3 md:mb-6">
          <div className="p-2 md:p-3 bg-rose-50 text-rose-600 rounded-xl md:rounded-2xl">
            <ArrowUpRight size={18} />
          </div>
          <span className="text-[8px] md:text-[10px] font-black text-rose-500 bg-rose-50/50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase leading-tight text-center">
            Monthly Outflow
          </span>
        </div>
        <p className="text-[9px] md:text-xs font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest mb-1 transition-colors">Total Credit</p>
        <p className="text-lg md:text-2xl font-black text-slate-800 dark:text-dark-text truncate transition-colors">{formatPHP(totalCredit)}</p>
      </div>

      <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-dark-border hover:shadow-md transition-all transition-colors">
        <div className="flex justify-between items-center mb-3 md:mb-6">
          <div className="p-2 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl">
            <DollarSign size={18} />
          </div>
          <span className="text-[8px] md:text-[10px] font-black text-emerald-500 bg-emerald-50/50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase leading-tight text-center">
            Current Balance
          </span>
        </div>
        <p className="text-[9px] md:text-xs font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest mb-1 transition-colors">Net Position</p>
        <p
          className={`text-lg md:text-2xl font-black truncate ${balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
        >
          {formatPHP(balance)}
        </p>
      </div>

      <div className="bg-[#550000] p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl text-white">
        <div className="flex justify-between items-center mb-3 md:mb-6">
          <div className="p-2 md:p-3 bg-white/10 dark:bg-dark-accent/10 text-[#efbf04] dark:text-[#fbcc0e] rounded-xl md:rounded-2xl">
            <Layers size={18} />
          </div>
          <span className="text-[8px] md:text-[10px] font-black text-[#efbf04] dark:text-[#fbcc0e] bg-white/5 dark:bg-dark-accent/10 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full uppercase leading-tight text-center">
            Record Count
          </span>
        </div>
        <p className="text-[9px] md:text-xs font-black text-slate-300 dark:text-dark-muted uppercase tracking-widest mb-1 transition-colors">Total Entries</p>
        <p className="text-lg md:text-2xl font-black truncate">{count} Transactions</p>
      </div>
    </div>
  );
}
