# handoff.md — AI Co-Developer Guide

> **Project:** ACES Dashboard
> **Status:** Phase 1 Prototype (Supabase + RBAC)
> **Final product** will be rebuilt in a separate repository. This repo is the prototyping sandbox.

---

## Architecture

```
Browser ──→ React (Vite SPA)
               │
               ├──→ Supabase SDK ──→ PostgreSQL (projects, transactions, users, etc.)
               │                       └── RLS (Row-Level Security)
               │
               ├──→ localStorage (dark mode preference only)
               │
               └──→ D3, BlockNote, @dnd-kit (client-side rendering)
```

**No backend server.** Supabase is the only backend — the JS SDK talks directly from the browser to PostgreSQL via RLS.

---

## File Structure

```
src/
├── lib/
│   └── supabase.js              # Supabase client init
├── hooks/
│   ├── useAuth.js               # Auth state (Google OAuth)
│   ├── useSupabaseData.js       # Data fetching + CRUD (replaces useSheetData)
│   └── useDarkMode.js           # Unchanged
├── roles.js                     # Role config + tab registry (NEW)
├── components/
│   ├── LoginScreen.jsx          # Google OAuth login (NEW)
│   ├── Layout/
│   │   ├── index.jsx
│   │   └── Header.jsx           # Dynamic tabs per role
│   ├── shared/
│   │   └── StatusBadge.jsx      # Unchanged
│   ├── Tracker/                 # Unchanged (consumes typed data)
│   ├── Overview/                # Unchanged
│   ├── Calendar/                # Unchanged
│   └── Ledger/                  # Unchanged
├── tabs/                        # Unchanged (receives filtered data)
├── utils/
│   ├── ledger.js                # Keep: parsePHP, formatPHP, computeSpendMap
│   │                            # Remove: getColIndex, getSummaryValue, transformTransactions
│   ├── project.js               # Keep: parseCurrency, getStatusStyle, buildKanbanBoard
│   │                            # Remove: transformProjects (row-based indexing)
│   └── templates.js             # Rewrite: Supabase queries replace localStorage
├── data/                        # REMOVED - replaced by Supabase
│   ├── csvParser.js             # (deleted)
│   └── sources.js               # (deleted)
├── App.jsx                      # Auth gate + role-based tab rendering
├── main.jsx                     # Unchanged
├── constants.js                 # Unchanged (theme, chart colors)
└── index.css                    # Unchanged
```

---

## Data Model (Supabase)

| Table | Purpose | Key Fields |
|---|---|---|
| `departments` | Office lookup | `id`, `code` (OP/OVP/OES/Finance/Events/DRCA/General) |
| `users` | Linked to `auth.users` via Google OAuth | `id`, `email`, `department_id`, `role` |
| `projects` | Audit projects | `id`, `department_id`, `project_code`, `name`, `status`, `budget`, `details` (JSONB) |
| `transactions` | Financial ledger | `id`, `department_id`, `project_id`, `debit`, `credit`, `type`, `account` |
| `templates` | BlockNote project templates | `id`, `name`, `content` (JSONB), `is_default` |

Full schema: `SCHEMA.md`

---

## Key Patterns

### 1. Data flow

```jsx
// src/hooks/useSupabaseData.js
// Returns the SAME shape as old useSheetData so components don't change:
// { project: { data, updateItem, deleteItem, insertItem, moveItem },
//   ledger: { data, ... },
//   loading, error }
//
// But `data` is now typed objects instead of { index_, row[] }:
//   Old: { index_: 5, row: ['06-001', 'Project Name', ...] }
//   New: { id: 1, project_code: '06-001', name: 'Project Name', budget: 1000, ... }
```

### 2. Typed data replaces row-based indexing

**Old (CSV):**
```js
const name = project.row[1];                // magic number index
const details = JSON.parse(project.row[6]); // parse raw string
```

**New (Supabase):**
```js
const name = project.name;                  // named property
const details = project.details;            // already parsed JSON
```

### 3. Tab registry pattern

```js
// src/roles.js
export const TAB_REGISTRY = {
  home:        { component: HomeScreen,      label: 'Home', icon: LayoutDashboard },
  projects:    { component: ProjectsTab,      label: 'Projects', icon: KanbanIcon },
  overview:    { component: OverviewTab,      label: 'Overview', icon: BarChart3 },
  calendar:    { component: CalendarTab,      label: 'Calendar', icon: Calendar },
  ledger:      { component: LedgerTab,        label: 'Ledger', icon: DollarSign },
  budget:      { component: FinanceBudgetTab, label: 'Budget', icon: PieChart },
  disbursements: { component: FinanceDisbursementsTab, label: 'Disbursements', icon: TrendingDown },
  'events-dashboard': { component: EventsDashboardTab, label: 'Events', icon: CalendarCheck },
};

// Role config maps role → allowed tab IDs
export const ROLES = {
  op:      { label: 'Office of the President',  tabs: ['home','projects','overview','calendar','ledger'] },
  finance: { label: 'Finance & Treasury',       tabs: ['home','ledger','budget','disbursements'] },
  events:  { label: 'Events Management',        tabs: ['home','projects','calendar','events-dashboard'] },
  // ...
};
```

### 4. Role-based data filtering

The `useSupabaseData` hook accepts the current role and applies a department filter:

```js
// If role has a dept filter, add WHERE clause
const query = supabase.from('projects').select('*');
if (role.dept) {
  query.eq('department_id', role.deptId);
}
```

Executive roles (`role === 'executive'`) skip the filter — RLS handles their access server-side.

### 5. Auth flow

```jsx
// src/hooks/useAuth.js
// Uses supabase.auth.getSession() + onAuthStateChange listener
// Returns { user, session, loading, signIn, signOut }
//
// On first Google sign-in:
//   1. Supabase creates auth.users row
//   2. App checks if public.users row exists
//   3. If not, creates one (prompts user to select department/role)
```

---

## Component Behavior Changes

| Component | Old (CSV) | New (Supabase) |
|---|---|---|
| `ProjectDetailPage` | Receives CSV row, transforms each field manually | Receives typed project object directly |
| `TransactionModal` | Parses `row[6]`, `row[11]`, etc. | Receives typed `transaction.debit`, `transaction.account` |
| `KanbanBoard` | `buildKanbanBoard(transformProjects(data))` | `buildKanbanBoard(data)` (already typed) |
| `D3Donut` | Receives computed stats from OverviewTab | Same — stats computed from typed data |

---

## State Management Rules

- **No global state library.** `useState` + `useMemo` + `useCallback` only (same as original)
- Auth state from `useAuth` hook
- Data from `useSupabaseData` hook
- Dark mode from `useDarkMode` hook
- Role from `localStorage` + `useState` (backed by auth JWT claim)

---

## Critical Gotchas

1. **RLS is real security.** Unlike the old CSV app where filtering was cosmetic, RLS prevents unauthorized data access at the database level. Always test RLS policies with different roles.

2. **Components expect typed objects.** When writing new components or editing old ones, do NOT reference `row[0]`, `row[1]`, etc. Use named properties like `project.name`, `transaction.debit`.

3. **`computeSpendMap` still works.** It takes an array of transaction objects with `.project` and `.credit` properties. The Supabase data retains these property names.

4. **BlockNote `details` field.** In the old app, `row[6]` was a JSON string that needed `JSON.parse`. In Supabase, `details` is already `JSONB` — no parsing needed. But the editor component still expects a JavaScript object/array.

5. **Lazy loading BlockNote.** Still required — `React.lazy(() => import('...'))` for ProjectDetailPage, ProjectDetailModal, and TemplateManager. The chunk is ~852 KB.

6. **Google OAuth setup is manual.** See `REBUILD/04-authentication.md` for the Google Cloud Console + Supabase dashboard steps.

7. **`templates` table replaces `localStorage`.** Old app stored templates under `aces_templates` / `aces_default_template_id`. Migrate existing localStorage data to the `templates` table via a one-time script if needed.

---

## New Components to Build

| Component | File | Priority |
|---|---|---|
| Supabase client init | `src/lib/supabase.js` | Phase 1 |
| `useAuth` hook | `src/hooks/useAuth.js` | Phase 1 |
| `useSupabaseData` hook | `src/hooks/useSupabaseData.js` | Phase 1 |
| Login screen | `src/components/LoginScreen.jsx` | Phase 1 |
| Role config + tab registry | `src/roles.js` | Phase 1 |
| Finance Budget tab | `src/tabs/FinanceBudgetTab.jsx` | Phase 2 |
| Finance Disbursements tab | `src/tabs/FinanceDisbursementsTab.jsx` | Phase 2 |
| Events Dashboard tab | `src/tabs/EventsDashboardTab.jsx` | Phase 2 |

---

## Reference

- `SCHEMA.md` — Full database schema, migration SQL, RLS policies
- `REBUILD/` — Step-by-step rebuild guide for human developers (Phase 0 is a learning path for beginners)
- `reference/*.csv` — Data contract (column definitions)
- `reference/ACES Project Dashboard/` — Canvas prototype spec
- `reference/ACES Ledger Dashboard/` — Canvas prototype spec
