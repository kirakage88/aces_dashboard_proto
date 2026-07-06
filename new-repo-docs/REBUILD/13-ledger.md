# Phase 13: Ledger Dashboard

> **Goal:** Build the full Ledger tab with context ribbon, metric cards, charts, transaction table, and CRUD modal.

---

## 13.1 — LedgerTab (`src/tabs/LedgerTab.jsx`)

The orchestrator for the ledger dashboard.

```jsx
import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import ContextRibbon from '../components/Ledger/ContextRibbon';
import MetricCards from '../components/Ledger/MetricCards';
import ChartsPanel from '../components/Ledger/ChartsPanel';
import TransactionTable from '../components/Ledger/TransactionTable';
import TransactionModal from '../components/Ledger/TransactionModal';

const MONTH_NAMES = ['January','February',/*...*/'December'];

export default function LedgerTab({ ledger, project, projectCodes, followLink }) {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterProject, setFilterProject] = useState('All');
  const [filterAccount, setFilterAccount] = useState('All');
  const [ribbonMonth, setRibbonMonth] = useState(MONTH_NAMES[new Date().getMonth()]);

  // Month filtering on transactions
  const filteredTransactions = useMemo(() => {
    const targetMonth = ribbonMonth.toLowerCase();
    return (ledger.data || []).filter((t) => {
      const mp = filterProject === 'All' || (t.project_code || t.project) === filterProject;
      const ma = filterAccount === 'All' || t.account === filterAccount;
      let mm = true;
      if (t.date_recorded) {
        const d = new Date(t.date_recorded);
        mm = MONTH_NAMES[d.getMonth()].toLowerCase() === targetMonth;
      }
      return mp && ma && mm;
    });
  }, [ledger.data, filterProject, filterAccount, ribbonMonth]);

  const monthlyDebit = filteredTransactions.reduce((acc, t) => acc + (t.debit || 0), 0);
  const monthlyCredit = filteredTransactions.reduce((acc, t) => acc + (t.credit || 0), 0);
  const calcBalance = monthlyDebit - monthlyCredit;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-dark-bg ...">
      <ContextRibbon month={ribbonMonth}
        onPrevMonth={() => { /* shift month -1 */ }}
        onNextMonth={() => { /* shift month +1 */ }} />

      <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full flex-1 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-dark-text">
            Ledger Dashboard
          </h1>
          <button onClick={() => setIsAddingEntry(true)}
            className="bg-[#550000] hover:bg-[#800000] text-[#efbf04] px-6 py-3 rounded-2xl font-black
                       text-xs md:text-sm transition-all shadow-xl active:scale-95 flex items-center gap-2">
            <Plus size={20} strokeWidth={3} /> Add Transaction
          </button>
        </header>

        <MetricCards totalDebit={monthlyDebit} totalCredit={monthlyCredit}
                     balance={calcBalance} count={filteredTransactions.length} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ChartsPanel transactions={filteredTransactions} totalDebit={monthlyDebit} />
          <TransactionTable
            transactions={ledger.data}
            filteredTransactions={filteredTransactions}
            filterProject={filterProject} filterAccount={filterAccount}
            onFilterProject={setFilterProject} onFilterAccount={setFilterAccount}
            projects={['All', ...new Set((ledger.data||[]).map(t => t.project_code || t.project).filter(Boolean))]}
            accounts={['All', ...new Set((ledger.data||[]).map(t => t.account).filter(Boolean))]}
            followLink={followLink}
            onEdit={(id) => setEditingId(id)}
            onDelete={async (id) => { await ledger.deleteItem(id); }}
          />
        </div>
      </div>

      {(isAddingEntry || editingId != null) && (
        <TransactionModal
          editingId={editingId}
          transactions={ledger.data}
          projectData={project.data}
          projectCodes={projectCodes}
          onSave={(id, payload) => {
            if (id != null) ledger.updateItem(id, payload);
            else ledger.insertItem(payload);
            setIsAddingEntry(false);
            setEditingId(null);
          }}
          onClose={() => { setIsAddingEntry(false); setEditingId(null); }}
        />
      )}
    </div>
  );
}
```

**Key changes from old version:**
- Uses `t.debit`, `t.credit`, `t.date_recorded`, `t.account` instead of `t.row[index]`
- Month filtering uses `new Date(t.date_recorded)` instead of split-by-`/`
- CRUD functions are async (return Promises)
- No more `getSummaryValue()` or metadata rows — all data is in named columns

## 13.2 — ContextRibbon (`src/components/Ledger/ContextRibbon.jsx`)

Shows current month with prev/next navigation, book status, and metadata.

```jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ContextRibbon({ month, onPrevMonth, onNextMonth }) {
  return (
    <div className="bg-[#550000] dark:bg-[#1a0000] px-4 md:px-8 py-3 flex items-center justify-between
                    text-white shadow-xl">
      <button onClick={onPrevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all">
        <ChevronLeft size={20} />
      </button>
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-widest opacity-60">Transaction Month</p>
        <p className="text-lg md:text-xl font-black">{month}</p>
      </div>
      <button onClick={onNextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
```

## 13.3 — MetricCards (`src/components/Ledger/MetricCards.jsx`)

Four summary cards: total debit, total credit, net balance, transaction count.

```jsx
import { TrendingUp, TrendingDown, Wallet, FileText } from 'lucide-react';
import { formatPHP } from '../../utils/ledger';

export default function MetricCards({ totalDebit, totalCredit, balance, count }) {
  const cards = [
    { label: 'Total Debit', value: formatPHP(totalDebit), icon: TrendingUp, color: 'text-red-600' },
    { label: 'Total Credit', value: formatPHP(totalCredit), icon: TrendingDown, color: 'text-emerald-600' },
    { label: 'Balance', value: formatPHP(balance), icon: Wallet, color: 'text-[#550000]' },
    { label: 'Records', value: String(count), icon: FileText, color: 'text-slate-600' },
  ];
  // Renders cards in a 4-column grid
}
```

## 13.4 — ChartsPanel (`src/components/Ledger/ChartsPanel.jsx`)

Two D3 visualizations: horizontal bar chart (debit by project) and account breakdown.

Uses the same D3 pattern as Phase 11 but for financial data. Reads `t.project_code`, `t.debit`, `t.account` from typed transaction objects.

## 13.5 — TransactionTable (`src/components/Ledger/TransactionTable.jsx`)

Filterable table with columns for date, code, description, debit, credit, statuses, and actions.

**Key change:** Uses `t.id` as the unique identifier instead of `t.index_`. The edit/delete handlers pass the Supabase `id` to the parent.

## 13.6 — TransactionModal (`src/components/Ledger/TransactionModal.jsx`)

Full CRUD form for single transaction with all 13 fields from the ledger schema.

**Key change:** Fields map directly to typed properties:
- `t.date_recorded` → date input
- `t.entry_code` → text input
- `t.type` → select (Income / Subsidy / Expenditure)
- `t.debit` → number input
- `t.credit` → number input (NUMERIC from Supabase, no parsePHP needed)
- `t.account` → select (SACEV / PTA / Other TBA / etc.)
- `t.filing_status` → select (Pending / Filed / Active)
- `t.submission_status` → select (Pending / Submitted / Revised / Approved)
- `t.document_link` → text input
- `t.entry_by` → text input

---

## Next Step

Proceed to [`14-rbac-login.md`](14-rbac-login.md) to implement the role-based access control and login screen.
