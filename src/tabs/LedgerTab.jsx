import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import ContextRibbon from '../components/Ledger/ContextRibbon';
import MetricCards from '../components/Ledger/MetricCards';
import ChartsPanel from '../components/Ledger/ChartsPanel';
import TransactionTable from '../components/Ledger/TransactionTable';
import TransactionModal from '../components/Ledger/TransactionModal';
import {
  transformTransactions,
  getSummaryValue,
  parsePHP,
} from '../utils/ledger';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function LedgerTab({ ledger, project, projectCodes, followLink }) {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [filterProject, setFilterProject] = useState('All');
  const [filterAccount, setFilterAccount] = useState('All');
  const [ribbonMonth, setRibbonMonth] = useState(() => MONTH_NAMES[new Date().getMonth()]);

  const transactions = useMemo(() => transformTransactions(ledger.data), [ledger.data]);

  const summary = useMemo(() => {
    const now = new Date();
    return {
      month: getSummaryValue(ledger.data, 'transaction \nmonth')
        || getSummaryValue(ledger.data, 'month')
        || MONTH_NAMES[now.getMonth()],
      debit: parsePHP(getSummaryValue(ledger.data, 'monthly debit')),
      credit: parsePHP(getSummaryValue(ledger.data, 'monthly credit')),
      balance: parsePHP(getSummaryValue(ledger.data, 'monthly balance')),
      status: getSummaryValue(ledger.data, 'book status') || 'ACTIVE',
      openedOn: getSummaryValue(ledger.data, 'opened on') || now.toLocaleDateString(),
      openedBy: getSummaryValue(ledger.data, 'opened by') || 'System',
    };
  }, [ledger.data]);

  const projects = ['All', ...new Set(transactions.map((t) => t.project).filter(Boolean))];
  const accounts = ['All', ...new Set(transactions.map((t) => t.account).filter(Boolean))];

  const filteredTransactions = useMemo(() => {
    const targetMonth = ribbonMonth.toLowerCase();
    return transactions.filter((t) => {
      const mp = filterProject === 'All' || t.project === filterProject;
      const ma = filterAccount === 'All' || t.account === filterAccount;
      let mm = true;
      if (t.date) {
        const parts = String(t.date).split(/[-/]/);
        const mIdx = parts.length >= 2
          ? parseInt(parts[1], 10) - 1
          : new Date(t.date).getMonth();
        mm = mIdx >= 0 && mIdx < 12 && MONTH_NAMES[mIdx].toLowerCase() === targetMonth;
      }
      return mp && ma && mm;
    });
  }, [transactions, filterProject, filterAccount, ribbonMonth]);

  const monthlyDebit = filteredTransactions.reduce((acc, t) => acc + t.debit, 0);
  const monthlyCredit = filteredTransactions.reduce((acc, t) => acc + t.credit, 0);
  const calcBalance = monthlyDebit - monthlyCredit;

  const handleMonthShift = (delta) => {
    setRibbonMonth((prev) => {
      const idx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === prev.toLowerCase());
      const nextIdx = (idx + delta + 12) % 12;
      return MONTH_NAMES[nextIdx];
    });
  };

  const handleSave = (index_, row) => {
    if (index_ != null) {
      ledger.updateItem(index_, row);
    } else {
      ledger.insertItem(index_, row);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      <ContextRibbon
        summary={{ ...summary, month: ribbonMonth }}
        onPrevMonth={() => handleMonthShift(-1)}
        onNextMonth={() => handleMonthShift(1)}
      />

      <div className="p-3 md:p-8 max-w-[1600px] mx-auto w-full flex-1 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              Ledger Dashboard
              <div className="h-6 w-[2px] bg-slate-100 hidden sm:block" />
              <span className="text-[10px] md:text-xs font-bold text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full shadow-sm">
                Real-time Sync
              </span>
            </h1>
          </div>
          <button
            onClick={() => setIsAddingEntry(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#550000] hover:bg-[#800000] text-[#efbf04] px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-black text-xs md:text-sm transition-all shadow-xl shadow-[#550000]/20 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            Add Transaction
          </button>
        </header>

        <MetricCards
          totalDebit={monthlyDebit}
          totalCredit={monthlyCredit}
          balance={calcBalance}
          count={filteredTransactions.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ChartsPanel transactions={filteredTransactions} totalDebit={monthlyDebit} />

          <TransactionTable
            transactions={transactions}
            filteredTransactions={filteredTransactions}
            filterProject={filterProject}
            filterAccount={filterAccount}
            onFilterProject={setFilterProject}
            onFilterAccount={setFilterAccount}
            projects={projects}
            accounts={accounts}
            followLink={followLink}
            onEdit={(idx) => setEditingIndex(idx)}
            onDelete={(idx) => ledger.deleteItem(idx)}
          />
        </div>
      </div>

      {(isAddingEntry || editingIndex != null) && (
        <TransactionModal
          editingIndex={editingIndex}
          transactions={transactions}
          projectData={project.data}
          projectCodes={projectCodes}
          onSave={handleSave}
          onClose={() => { setIsAddingEntry(false); setEditingIndex(null); }}
        />
      )}
    </div>
  );
}
