import { Filter, Calendar, Hash, Tag, ExternalLink, Edit2, Trash2, Layers } from 'lucide-react';
import { formatPHP } from '../../utils/ledger';

export default function TransactionTable({
  transactions,
  filteredTransactions,
  filterProject,
  filterAccount,
  onFilterProject,
  onFilterAccount,
  projects,
  accounts,
  followLink,
  onEdit,
  onDelete,
}) {
  return (
    <div className="lg:col-span-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                className="pl-9 pr-7 md:pr-8 py-2 md:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] md:text-[11px] font-black text-slate-600 outline-none focus:ring-2 focus:ring-[#550000]/10 appearance-none cursor-pointer max-w-[140px] md:max-w-none"
                value={filterProject}
                onChange={(e) => onFilterProject(e.target.value)}
              >
                <option value="All">All Projects</option>
                {projects
                  .filter((p) => p !== 'All')
                  .map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                className="pl-9 pr-7 md:pr-8 py-2 md:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] md:text-[11px] font-black text-slate-600 outline-none focus:ring-2 focus:ring-[#550000]/10 appearance-none cursor-pointer max-w-[140px] md:max-w-none"
                value={filterAccount}
                onChange={(e) => onFilterAccount(e.target.value)}
              >
                <option value="All">All Accounts</option>
                {accounts
                  .filter((a) => a !== 'All')
                  .map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-slate-100">
            Showing {filteredTransactions.length} items
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 bg-white/95 backdrop-blur z-20">
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Detailed Description</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Categorization</th>
                <th className="px-6 py-4 text-right">Debit</th>
                <th className="px-6 py-4 text-right">Credit</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => (
                <tr key={t.index_} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 text-center font-mono text-[11px] text-slate-300 group-hover:text-slate-400">
                    {t.no ? String(t.no).padStart(2, '0') : '--'}
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800 text-sm group-hover:text-[#550000] transition-colors max-w-xs truncate">
                      {t.description}
                    </div>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <Calendar size={10} className="text-slate-300" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight">
                        {t.date || 'UNSET'}
                      </span>
                      {t.entryBy && (
                        <>
                          <div className="h-2 w-[1px] bg-slate-200" />
                          <span className="text-[9px] text-slate-400 font-bold">By: {t.entryBy}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      {t.invoice && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[#550000] bg-[#550000]/5 w-fit px-1.5 py-0.5 rounded uppercase">
                          <Hash size={10} /> {t.invoice}
                        </div>
                      )}
                      {t.entryCode && (
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">
                          Code: {t.entryCode}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 uppercase mb-1">
                      <Tag size={10} className="text-slate-300" /> {t.project}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 pl-4">
                      {t.account} {t.accountNo && `(${t.accountNo})`}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-mono text-xs font-black text-slate-900">
                    {t.debit > 0 ? formatPHP(t.debit) : '\u2014'}
                  </td>
                  <td className="px-6 py-5 text-right font-mono text-xs font-black text-rose-500">
                    {t.credit > 0 ? formatPHP(t.credit) : '\u2014'}
                  </td>
                  <td className="px-6 py-5 text-center space-y-1">
                    <span
                      className={`block w-full text-center px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
                        t.filing?.toLowerCase().includes('filed') ||
                        t.filing?.toLowerCase().includes('done')
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : t.filing?.toLowerCase().includes('active')
                            ? 'bg-[#550000]/10 text-[#550000] border-[#550000]/10'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}
                    >
                      {t.filing}
                    </span>
                    {t.submission && (
                      <span
                        className={`block w-full text-center px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
                          t.submission?.toLowerCase().includes('submitted') ||
                          t.submission?.toLowerCase().includes('done')
                            ? 'bg-[#550000]/10 text-[#550000] border-[#550000]/10'
                            : 'bg-slate-50 text-slate-400 border-slate-100'
                        }`}
                      >
                        S: {t.submission}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      {t.link && (
                        <button
                          onClick={() => followLink(t.link)}
                          className="p-2 text-slate-400 hover:text-[#550000] hover:bg-white rounded-xl transition-all shadow-sm active:scale-90"
                          title="Open Link"
                        >
                          <ExternalLink size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(t.index_)}
                        className="p-2 text-slate-400 hover:text-[#550000] hover:bg-white rounded-xl transition-all shadow-sm active:scale-90"
                        title="Edit Entry"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(t.index_)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Layers size={64} strokeWidth={1} />
                      <p className="text-xl font-black uppercase tracking-widest text-slate-800">
                        Empty Ledger
                      </p>
                      <p className="text-sm font-medium text-slate-500">
                        No transactions match your current selection.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
