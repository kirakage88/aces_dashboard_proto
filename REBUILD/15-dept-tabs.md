# Phase 15: Department-Specific Tabs

> **Goal:** Build custom tabs for Finance and Events departments. These are placeholder implementations that will be refined when the departments provide their reference Google Sheets.

---

## 15.1 — Finance Budget Tab (`src/tabs/FinanceBudgetTab.jsx`)

Displays budget allocation and spending for Finance department projects only.

```jsx
import { useState, useMemo } from 'react';
import { PieChart, TrendingDown } from 'lucide-react';
import D3Donut from '../components/Overview/D3Donut';
import BudgetAllocationList from '../components/Overview/BudgetAllocationList';

export default function FinanceBudgetTab({ project, spendMap }) {
  const [view, setView] = useState('allocation');

  // Finance department projects are already filtered by RLS
  const stats = useMemo(() => {
    const map = {};
    (project.data || []).forEach((p) => {
      const focus = p.area_focus || 'Uncategorized';
      if (!map[focus]) map[focus] = { focus, count: 0, budget: 0, spent: 0 };
      map[focus].count++;
      map[focus].budget += p.budget || 0;
      map[focus].spent += spendMap?.[p.project_code] || 0;
    });
    return Object.values(map).sort((a, b) => b.budget - a.budget);
  }, [project.data, spendMap]);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <h2 className="text-xl font-black text-slate-800 dark:text-dark-text mb-6">
        Budget Dashboard
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <D3Donut data={stats} />
        </div>
        <div className="lg:col-span-7">
          <BudgetAllocationList projects={project.data} spendMap={spendMap} view={view} />
        </div>
      </div>
    </div>
  );
}
```

**Refinement checklist (when Finance provides their reference sheet):**
- [ ] Define `finance_budget_items` table schema
- [ ] Add appropriation columns (allocated vs. utilized, fiscal year)
- [ ] Add multi-year budget comparison
- [ ] Add approval status workflow

## 15.2 — Finance Disbursements Tab (`src/tabs/FinanceDisbursementsTab.jsx`)

Shows expenditure transactions with status tracking.

```jsx
import { useState, useMemo } from 'react';
import TransactionTable from '../components/Ledger/TransactionTable';
import MetricCards from '../components/Ledger/MetricCards';

export default function FinanceDisbursementsTab({ ledger, project, followLink }) {
  // Filter to Expenditure type only
  const disbursements = useMemo(() => {
    return (ledger.data || []).filter(t => t.type === 'Expenditure');
  }, [ledger.data]);

  const totalDebit = disbursements.reduce((acc, t) => acc + (t.debit || 0), 0);
  const totalCredit = disbursements.reduce((acc, t) => acc + (t.credit || 0), 0);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
      <h2 className="text-xl font-black text-slate-800 dark:text-dark-text mb-6">
        Disbursements
      </h2>
      <MetricCards totalDebit={totalDebit} totalCredit={totalCredit}
                   balance={totalDebit - totalCredit} count={disbursements.length} />
      <div className="mt-6">
        <TransactionTable
          transactions={disbursements}
          filteredTransactions={disbursements}
          filterProject="All"
          onFilterProject={() => {}}
          projects={['All']}
          accounts={['All']}
          followLink={followLink}
        />
      </div>
    </div>
  );
}
```

**Refinement checklist (when Finance provides reference sheet):**
- [ ] Add check/voucher number tracking
- [ ] Add approval workflow (pending → approved → released)
- [ ] Add payee/vendor information
- [ ] Add fund source (GAA, local, remittances)

## 15.3 — Events Dashboard Tab (`src/tabs/EventsDashboardTab.jsx`)

Shows Events department's projects, calendar, and event-specific metrics.

```jsx
import { useState, useMemo } from 'react';
import CalendarGrid from '../components/Calendar/CalendarGrid';
import StatusBadge from '../components/shared/StatusBadge';

export default function EventsDashboardTab({ project }) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const stats = useMemo(() => {
    const total = project.data.length;
    const upcoming = project.data.filter(p => {
      if (!p.implementation_date) return false;
      return new Date(p.implementation_date) >= today;
    }).length;
    const completed = project.data.filter(p => p.status === 'Done').length;
    return { total, upcoming, completed, inProgress: total - completed };
  }, [project.data, today]);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-dark-card rounded-2xl p-4 ...">
          <p className="text-2xl font-black">{stats.total}</p>
          <p className="text-xs text-slate-400">Total Events</p>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-2xl p-4 ...">
          <p className="text-2xl font-black">{stats.upcoming}</p>
          <p className="text-xs text-slate-400">Upcoming</p>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-2xl p-4 ...">
          <p className="text-2xl font-black">{stats.inProgress}</p>
          <p className="text-xs text-slate-400">In Progress</p>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-2xl p-4 ...">
          <p className="text-2xl font-black">{stats.completed}</p>
          <p className="text-xs text-slate-400">Completed</p>
        </div>
      </div>

      {/* Calendar */}
      <CalendarGrid
        projects={project.data}
        month={month} year={year}
        onMonthChange={(m, y) => { setMonth(m); setYear(y); }}
        onProjectClick={() => {}}
      />
    </div>
  );
}
```

**Refinement checklist (when Events provides reference sheet):**
- [ ] Define `events_plans` table schema
- [ ] Add event type classifications (seminar, workshop, competition, etc.)
- [ ] Add venue, attendance tracking
- [ ] Add resource allocation (personnel, equipment)
- [ ] Add program flow / itinerary

---

## 15.4 — Adding a Department Tab (Pattern)

When a new department reference sheet arrives, follow this pattern:

1. **Add table to Supabase** — create the table matching the reference sheet columns
2. **Create tab component** — `src/tabs/NewDeptTab.jsx` that queries the new table
3. **Register in `TAB_REGISTRY`** — add to `src/roles.js`
4. **Add to role config** — add the tab ID to the department's `tabs` array in `ROLES`
5. **Wire into App.jsx** — add a `case` for the new tab

```js
// In src/roles.js — registration:
TAB_REGISTRY['new-dept-tab'] = {
  label: 'New Tab Name',
  icon: SomeIcon,
  component: () => NewDeptTabComponent,
};

ROLES.newDept = {
  label: 'New Department',
  tabs: ['home', 'projects', 'calendar', 'new-dept-tab'],
  filterDept: 'NewDept',
};
```

---

## Next Step

Proceed to [`16-deployment.md`](16-deployment.md) to deploy the app.
