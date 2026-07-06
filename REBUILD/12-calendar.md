# Phase 12: Calendar Tab

> **Goal:** Build the Calendar tab with a month grid, project date plotting, and unscheduled projects panel.

---

## 12.1 — CalendarTab (`src/tabs/CalendarTab.jsx`)

```jsx
import { useState, useMemo, lazy, Suspense } from 'react';
import CalendarGrid from '../components/Calendar/CalendarGrid';
import UnscheduledPanel from '../components/Calendar/UnscheduledPanel';

const ProjectDetailModal = lazy(() => import('../components/Tracker/ProjectDetailModal'));

export default function CalendarTab({ project, spendMap }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [detailProject, setDetailProject] = useState(null);

  // Split projects into scheduled (have a date) and unscheduled
  const { scheduled, unscheduled } = useMemo(() => {
    const s = [], u = [];
    (project.data || []).forEach((p) => {
      if (p.implementation_date) s.push(p);
      else u.push(p);
    });
    return { scheduled: s, unscheduled: u };
  }, [project.data]);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <CalendarGrid
            projects={scheduled}
            month={currentMonth}
            year={currentYear}
            onMonthChange={(m, y) => { setCurrentMonth(m); setCurrentYear(y); }}
            onProjectClick={(p) => setDetailProject(p)}
          />
        </div>
        <div className="lg:col-span-1">
          <UnscheduledPanel
            projects={unscheduled}
            onProjectClick={(p) => setDetailProject(p)}
          />
        </div>
      </div>

      {detailProject && (
        <Suspense fallback={null}>
          <ProjectDetailModal
            editingItem={detailProject}
            onSave={project.updateItem}
            onClose={() => setDetailProject(null)}
            projectData={project.data}
          />
        </Suspense>
      )}
    </div>
  );
}
```

**Key change from old version:** Uses `p.implementation_date` instead of the CSV-renamed `p.date`. Use the exact column name from your Supabase schema.

## 12.2 — CalendarGrid (`src/components/Calendar/CalendarGrid.jsx`)

Renders a month grid with days and project dots. Projects are plotted on their `implementation_date`.

```jsx
export default function CalendarGrid({ projects, month, year, onMonthChange, onProjectClick }) {
  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build a map of date → project for quick lookup
  const projectMap = {};
  (projects || []).forEach((p) => {
    if (p.implementation_date) {
      const d = new Date(p.implementation_date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!projectMap[key]) projectMap[key] = [];
      projectMap[key].push(p);
    }
  });

  const handlePrev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const handleNext = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // Renders the month grid with:
  // - Day headers (S M T W T F S)
  // - Previous month's trailing days (grayed out)
  // - Current month's days with colored dots for projects
  // - Click handler on day cells → opens ProjectDetailModal for that project
}
```

## 12.3 — UnscheduledPanel (`src/components/Calendar/UnscheduledPanel.jsx`)

Lists projects without an `implementation_date`:

```jsx
export default function UnscheduledPanel({ projects, onProjectClick }) {
  return (
    <div className="bg-white dark:bg-dark-card ... rounded-[2rem] ...">
      <h3 className="text-sm font-black text-slate-500 dark:text-dark-muted uppercase tracking-widest">
        Unscheduled
      </h3>
      <div className="space-y-2 mt-4">
        {projects.map((p) => (
          <button key={p.id} onClick={() => onProjectClick(p)}
            className="w-full text-left ...">
            <p className="text-xs font-bold truncate">{p.name}</p>
            <p className="text-[10px] text-slate-400">{p.project_code}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Next Step

Proceed to [`13-ledger.md`](13-ledger.md) to build the full Ledger dashboard.
