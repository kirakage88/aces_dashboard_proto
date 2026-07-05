import { useState, useMemo } from 'react';
import {
  X, Calendar, Hash, FileText, User, Tag,
} from 'lucide-react';
import { generateProjectCode } from '../../utils/project';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function TransactionModal({
  editingIndex,
  transactions,
  projectData,
  projectCodes,
  onSave,
  onClose,
}) {
  const isEditing = editingIndex != null;
  const editingTransaction = isEditing
    ? transactions.find((t) => t.index_ === editingIndex)
    : null;

  const [selectedDate, setSelectedDate] = useState(
    editingTransaction?.date || ''
  );

  const nextEntryCode = useMemo(() => {
    if (isEditing) return editingTransaction?.entryCode || '';
    const month = selectedDate
      ? String(new Date(selectedDate).getMonth() + 1).padStart(2, '0')
      : 'XX';
    const existing = transactions
      .filter((t) => t.entryCode && t.entryCode.startsWith(month))
      .map((t) => parseInt(t.entryCode.split('-')[1], 10))
      .filter((n) => !isNaN(n));
    const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
    return `${month}-${String(next).padStart(3, '0')}`;
  }, [isEditing, editingTransaction, transactions, selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const row = editingTransaction
      ? [...editingTransaction.raw]
      : new Array(15).fill(null);

    row[0] = fd.get('date');
    row[1] = fd.get('entryCode');
    row[2] = fd.get('type');
    row[3] = fd.get('dateIssued');
    row[4] = fd.get('description');
    row[5] = fd.get('invoice');
    row[6] = parseFloat(fd.get('debit')) || 0;
    row[7] = parseFloat(fd.get('credit')) || 0;
    row[8] = fd.get('account');
    row[9] = fd.get('accountNo');
    row[10] = fd.get('project');
    row[11] = fd.get('filing');
    row[12] = fd.get('submission');
    row[14] = fd.get('entryBy');

    onSave(editingIndex, row);
    onClose();
  };

  return (
      <div className="fixed inset-0 bg-slate-900/40 dark:bg-dark-bg/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[9999]">
        <div className="bg-white dark:bg-dark-card rounded-t-[40px] md:rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] md:max-h-[95vh] flex flex-col animate-in slide-in-from-bottom md:fade-in md:zoom-in duration-200 transition-colors">
          <div className="px-6 md:p-8 py-5 md:py-8 border-b border-slate-50 dark:border-dark-border flex justify-between items-center bg-slate-50/50 dark:bg-dark-input/50 shrink-0 transition-colors">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-dark-text tracking-tight transition-colors">
                {isEditing ? 'Update Record' : 'Register Transaction'}
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-dark-muted font-black uppercase tracking-widest mt-1 transition-colors">
                Audit Log Modification
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-dark-muted hover:text-slate-600 dark:hover:text-gray-300 p-2 md:p-3 bg-white dark:bg-dark-input rounded-full shadow-sm hover:shadow transition-all"
            >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 md:p-10 space-y-5 md:space-y-8 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Transaction Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-muted" size={16} />
                  <input
                    name="date"
                    type="date"
                    className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 dark:text-dark-text text-sm"
                    defaultValue={editingTransaction?.date || ''}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Reference Code
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-muted" size={16} />
                  <input
                    name="entryCode"
                    value={nextEntryCode}
                    readOnly
                    className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-slate-200 dark:bg-dark-hover border border-slate-200 dark:border-dark-border-md rounded-2xl outline-none font-black text-slate-700 dark:text-dark-text uppercase cursor-not-allowed text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Type / Category
                </label>
                <select
                  name="type"
                  className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 dark:text-dark-text cursor-pointer text-sm"
                  defaultValue={editingTransaction?.type || ''}
                >
                  <option value="">Select Type...</option>
                  {['Income', 'Subsidy', 'Expenditure'].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Date Issued
                </label>
                  <input
                    name="dateIssued"
                    type="date"
                    className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 dark:text-dark-text text-sm"
                  defaultValue={editingTransaction?.dateIssued || ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                Invoice / Document No.
              </label>
              <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-muted" size={16} />
                  <input
                    name="invoice"
                    className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 dark:text-dark-text text-sm"
                  placeholder="Invoice or Receipt #"
                  defaultValue={editingTransaction?.invoice || ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                Official Description
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-muted" size={16} />
                <input
                  name="description"
                  className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 dark:text-dark-text text-sm"
                  placeholder="Enter purpose or memo..."
                  required
                  defaultValue={editingTransaction?.description || ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Debit (+) Inflow
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-500">
                    ₱
                  </div>
                  <input
                    name="debit"
                    type="number"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 md:py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all font-black text-emerald-900 text-sm"
                    defaultValue={editingTransaction?.debit || 0}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Credit (-) Outflow
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-rose-500">
                    ₱
                  </div>
                  <input
                    name="credit"
                    type="number"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 md:py-4 bg-rose-50/30 border border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-100 focus:border-rose-400 outline-none transition-all font-black text-rose-900 text-sm"
                    defaultValue={editingTransaction?.credit || 0}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Project Code
                </label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-muted" size={16} />
                  <select
                    name="project"
                    className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 cursor-pointer text-sm"
                    defaultValue={editingTransaction?.project || ''}
                  >
                    <option value="">Select Project...</option>
                    {projectCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Account Category
                </label>
                <select
                  name="account"
                  className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 dark:text-dark-text cursor-pointer text-sm"
                  defaultValue={editingTransaction?.account || ''}
                >
                  <option value="">Select Account...</option>
                  {['SACEV', 'PTA', 'Others'].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Account No.
                </label>
                  <input
                    name="accountNo"
                    className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 dark:text-dark-text text-sm"
                  placeholder="e.g. 1234-5678"
                  defaultValue={editingTransaction?.accountNo || ''}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Filing Status
                </label>
                <select
                  name="filing"
                  className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 dark:text-dark-text cursor-pointer text-sm"
                  defaultValue={editingTransaction?.filing || 'Pending'}
                >
                  {['Pending', 'Filed', 'Active'].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Submission Status
                </label>
                <select
                  name="submission"
                  className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 dark:text-dark-text cursor-pointer text-sm"
                  defaultValue={editingTransaction?.submission || 'Pending'}
                >
                  <option>Pending</option>
                  <option>Submitted</option>
                  <option>Revised</option>
                  <option>Approved</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest ml-1 transition-colors">
                  Entry By
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-muted" size={16} />
                  <input
                    name="entryBy"
                    className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/10 focus:border-[#550000] outline-none transition-all font-black text-slate-700 dark:text-dark-text text-sm"
                    placeholder="Staff Name"
                    defaultValue={editingTransaction?.entryBy || ''}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 md:p-8 py-5 md:py-8 border-t border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-dark-input/50 flex gap-4 shrink-0 transition-colors">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 md:py-4 bg-white dark:bg-dark-input border border-slate-200 dark:border-dark-border-md hover:bg-slate-50 dark:hover:bg-dark-hover text-slate-600 dark:text-dark-text font-black rounded-3xl transition-all uppercase tracking-widest text-[10px] md:text-[11px]"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              className="flex-[2] py-3 md:py-4 bg-[#550000] hover:bg-[#800000] text-[#efbf04] dark:text-[#fbcc0e] font-black rounded-3xl shadow-2xl shadow-[#550000]/20 transition-all uppercase tracking-widest text-[10px] md:text-[11px] active:scale-95"
            >
              {isEditing ? 'Confirm Update' : 'Finalize Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
