# REBUILD GUIDE — ACES Dashboard Proto

## Overview

**Purpose**: A static single-page application (SPA) for managing audit projects and a financial ledger, built for the ACES (Audit Management & Systems Control) unit.

**Architecture Summary**:
- **React + Vite** static SPA deployed to **GitHub Pages** via GitHub Actions
- **No backend** — all data fetched client-side from **published Google Sheets CSVs**
- **Tab switching** via `useState` (no router)
- **CRUD is in-memory only** — the Google Sheet is the source of truth; local edits are ephemeral (lost on refresh)
- **Column discovery by keyword search** — never hardcode column numbers; search the header row for keywords

**Key Design Decisions**:
| Decision | Rationale |
|---|---|
| No router (`useState` tabs) | Matches Canvas prototype, simpler bundle |
| `@dnd-kit` for Kanban drag-and-drop | Lightweight, accessible, well-typed |
| `papaparse` for CSV parsing | Handles edge cases, encoding, large files |
| `d3` for charts | Full control over SVG, no chart library overhead |
| `@blocknote/react` for WYSIWYG | Code-split (~852 KB), BlockNote JSON stored in CSV column |
| Column keyword discovery (`getColIndex`) | Allows Google Sheet columns to be reordered without breaking the app |
| Metadata rows (ledger header) | First ~3 rows may hold key-value metadata discovered by `getSummaryValue` |
| `localStorage` for templates/dark mode | Persistent user preferences without a backend |

**Live Site**: `https://kirakage88.github.io/aces_dashboard_proto/`

---

## Phase 0: Environment Setup

### 0.1 — Scaffold with Vite

```bash
npm create vite@latest aces-dashboard-proto -- --template react
cd aces-dashboard-proto
```

### 0.2 — Install Dependencies

```bash
npm install react@^18.3.1 react-dom@^18.3.1
npm install papaparse@^5.5.2 d3@^7.9.0 lucide-react@^0.468.0
npm install @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^10.0.0 @dnd-kit/utilities@^3.2.2
npm install @blocknote/core@^0.51.4 @blocknote/react@^0.51.4
npm install -D vite@^6.0.5 @vitejs/plugin-react@^4.3.4
npm install -D tailwindcss@^3.4.17 postcss@^8.4.49 autoprefixer@^10.4.20
npm install -D gh-pages@^6.3.0
```

### 0.3 — Configure `vite.config.js`

**File**: `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/aces_dashboard_proto/',
});
```

The `base` path must match the GitHub Pages repository sub-path. All asset URLs and `import.meta.env.BASE_URL` will use this prefix.

### 0.4 — Tailwind CSS + PostCSS Setup

**File**: `postcss.config.js`

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**File**: `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#101010',
          card: '#090d10',
          text: '#d6def0',
          muted: '#8895b5',
          border: '#1c2330',
          'border-md': '#283040',
          input: '#111a24',
          hover: '#1a2230',
          accent: '#fbcc0e',
        },
      },
    },
  },
  plugins: [],
};
```

**Important**: `darkMode: 'class'` — not `'media'` — so users can toggle independently of system preference.

**File**: `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

### 0.5 — Configure `index.html`

**File**: `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ACES Audit Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 0.6 — Copy Reference CSVs

```
reference/project_reference.csv  →  public/project_reference.csv
reference/ledger_reference.csv   →  public/ledger_reference.csv
```

These serve as fallback data sources in development when `VITE_PROJECT_TRACKER_URL` and `VITE_LEDGER_URL` env vars are not set.

### 0.7 — `.gitignore`

```
node_modules/
dist/
```

### 0.8 — `package.json` Scripts

```json
{
  "name": "aces-dashboard-proto",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist"
  }
}
```

---

## Phase 1: Data Layer

### 1.1 — Sources Config: `src/data/sources.js`

**Purpose**: Centralizes CSV source URLs. Uses environment variables with local file fallbacks for development.

```js
const BASE = import.meta.env.BASE_URL || '/';

export const SHEETS = {
  projectTracker:
    import.meta.env.VITE_PROJECT_TRACKER_URL || `${BASE}project_reference.csv`,
  ledger: import.meta.env.VITE_LEDGER_URL || `${BASE}ledger_reference.csv`,
};
```

**Gotchas**:
- `import.meta.env.BASE_URL` resolves to the Vite `base` path (`/aces_dashboard_proto/`)
- In production, set `VITE_PROJECT_TRACKER_URL` and `VITE_LEDGER_URL` to published Google Sheets CSV export URLs (use `File > Share > Publish to web > Comma-separated values (.csv)`)
- In dev, the local `public/*.csv` files are used

### 1.2 — CSV Parser: `src/data/csvParser.js`

**Purpose**: Core data manipulation layer. Parses CSV with PapaParse, provides CRUD functions on normalized `{ index_, row[] }` records.

```js
import Papa from 'papaparse';

export async function fetchCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const result = Papa.parse(text, { header: false, skipEmptyLines: true });
  return result.data.map((row, i) => ({ index_: i, row }));
}

export function updateItem(data, index, patch) {
  const entry = data.find((d) => d.index_ === index);
  if (!entry) return data;
  return data.map((d) =>
    d.index_ === index
      ? { ...d, row: d.row.map((v, i) => (patch[i] !== undefined ? patch[i] : v)) }
      : d
  );
}

export function deleteItem(data, index) {
  return data.filter((d) => d.index_ !== index);
}

export function insertItem(data, row) {
  const maxIndex = data.reduce((max, d) => Math.max(max, d.index_), -1);
  return [...data, { index_: maxIndex + 1, row }];
}

export function moveItem(data, fromIdx, toIdx) {
  const copy = [...data];
  const [moved] = copy.splice(fromIdx, 1);
  copy.splice(toIdx, 0, moved);
  return copy;
}
```

**Important patterns**:
- `{ header: false, skipEmptyLines: true }` — header row is row 0, not used as object keys
- `index_` is synthetic (array position at parse time), used as stable key
- `patch` is a sparse array — `[undefined, undefined, "new value"]` updates only index 2
- These functions are **pure** — they return new arrays, never mutate

### 1.3 — Data Hook: `src/hooks/useSheetData.js`

**Purpose**: React hook that fetches both CSV sources, exposes reactive `project` and `ledger` objects with CRUD methods, and provides `followLink` for clipboard copying.

```js
import { useState, useEffect, useCallback } from 'react';
import { fetchCSV, updateItem as update, deleteItem as remove, insertItem as insert, moveItem as move } from '../data/csvParser';
import { SHEETS } from '../data/sources';

export default function useSheetData() {
  const [projectData, setProjectData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([fetchCSV(SHEETS.projectTracker), fetchCSV(SHEETS.ledger)])
      .then(([projects, ledger]) => {
        if (!cancelled) {
          setProjectData(projects);
          setLedgerData(ledger);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // ... updateProjectItem, deleteProjectItem, insertProjectItem, moveProjectItem
  // ... updateLedgerItem, deleteLedgerItem, insertLedgerItem, moveLedgerItem

  const followLink = useCallback((url, key, setCopiedKey) => {
    const fallback = (text) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        if (setCopiedKey) { setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000); }
      } catch (err) { console.error('Clipboard fallback failed', err); }
      document.body.removeChild(ta);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        if (setCopiedKey) { setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000); }
      }).catch(() => fallback(url));
    } else { fallback(url); }
  }, []);

  const project = {
    data: projectData,
    updateItem: updateProjectItem,
    deleteItem: deleteProjectItem,
    insertItem: insertProjectItem,
    moveItem: moveProjectItem,
  };

  const ledger = {
    data: ledgerData,
    updateItem: updateLedgerItem,
    deleteItem: deleteLedgerItem,
    insertItem: insertLedgerItem,
    moveItem: moveLedgerItem,
  };

  return { project, ledger, loading, error, followLink };
}
```

**Gotchas**:
- `followLink` copies URL to clipboard — it does NOT navigate. Used for the "Ledger", "Drive", "Files" external resource buttons
- The `cancelled` flag prevents state updates after unmount
- Each CRUD wrapper wraps the pure `csvParser` functions with `setState` callbacks for reactivity

### 1.4 — Constants: `src/constants.js`

**Purpose**: Theme colors, chart color palette, external resource URLs, and tab definitions.

```js
export const THEME = {
  primary: '#550000',
  accent: '#efbf04',
  text: '#1a1a1a',
  bg: '#f8fafc',
  dark: {
    bg: '#101010',
    card: '#090d10',
    text: '#d6def0',
    muted: '#8895b5',
    border: '#1c2330',
    'border-md': '#283040',
    input: '#111a24',
    hover: '#1a2230',
    accent: '#fbcc0e',
  },
};

export const CHART_COLORS = [
  '#550000', '#efbf04', '#800000', '#D4AF37', '#600000',
  '#B8860B', '#a52a2a', '#DAA520', '#4A0000', '#FFD700',
];

export const EXTERNAL_RESOURCES = {
  LEDGER:
    'https://docs.google.com/spreadsheets/d/1lBy3Jo8pG8P4iGdpPJBodfkXnBNy3z3GQmFJlwHbQhI/edit?gid=109249955#gid=109249955',
  DRIVE:
    'https://drive.google.com/drive/folders/170CfFQRYo1lVpTcW0V6mjSq51yJNLw7r?usp=sharing',
  FILES:
    'https://docs.google.com/spreadsheets/d/11YNPckLE7vln3BKwEBX7NP22VnEyng_HAOWu5dYWOpw/edit?gid=0#gid=0',
};

export const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'overview', label: 'Overview' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'ledger', label: 'Ledger' },
];
```

---

## Phase 2: Layout & Shell

### 2.1 — Entry Point: `src/main.jsx`

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2.2 — App Shell: `src/App.jsx`

**Purpose**: Top-level component. Manages tab state via `useState`, computes `spendMap` and `projectCodes` as derived data, and renders the appropriate tab.

```js
import { useState, useMemo } from 'react';
import Layout from './components/Layout';
import useSheetData from './hooks/useSheetData';
import ProjectsTab from './tabs/ProjectsTab';
import OverviewTab from './tabs/OverviewTab';
import CalendarTab from './tabs/CalendarTab';
import LedgerTab from './tabs/LedgerTab';
import { computeSpendMap } from './utils/ledger';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { project, ledger, loading, error, followLink } = useSheetData();
  const spendMap = useMemo(() => computeSpendMap(ledger.data), [ledger.data]);
  const projectCodes = useMemo(() => {
    if (!project.data || project.data.length <= 1) return [];
    return project.data.slice(1).map((r) => r.row[0]).filter(Boolean);
  }, [project.data]);

  const renderTab = () => {
    if (loading) { /* Loading state */ }
    if (error) { /* Error state */ }
    switch (activeTab) {
      case 'home': /* Hero landing page with radial gradient */ break;
      case 'projects': return <ProjectsTab project={project} spendMap={spendMap} />;
      case 'overview': return <OverviewTab project={project} spendMap={spendMap} />;
      case 'calendar': return <CalendarTab project={project} spendMap={spendMap} />;
      case 'ledger': return <LedgerTab ledger={ledger} project={project} projectCodes={projectCodes} followLink={followLink} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} followLink={followLink}>
      {renderTab()}
    </Layout>
  );
}
```

**Home tab rendering** (the hero landing page):
```jsx
<div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#1a0000]">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#550000_0%,_#1a0000_100%)]" />
  <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-[#efbf04]/5 dark:bg-[#fbcc0e]/5 rounded-full blur-[120px] animate-pulse" />
  <div className="z-10 text-center px-6 md:px-10 max-w-6xl">
    <h1 className="text-[4rem] sm:text-[7rem] md:text-[10rem] lg:text-[14rem] font-black text-[#efbf04] dark:text-[#fbcc0e] tracking-tighter leading-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] mb-6 select-none">
      ACES AUDIT
    </h1>
    <p className="text-[#efbf04]/50 dark:text-[#fbcc0e]/50 font-black uppercase tracking-[0.5em] md:tracking-[1em] text-[10px] md:text-sm ml-4">
      Audit Management & Systems Control
    </p>
  </div>
</div>
```

### 2.3 — Layout Shell: `src/components/Layout/index.jsx`

```js
import Header from './Header';
import useDarkMode from '../../hooks/useDarkMode';

export default function Layout({ children, activeTab, onTabChange }) {
  const { isDark, toggle } = useDarkMode();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col font-sans text-slate-900 dark:text-dark-text transition-colors">
      <Header activeTab={activeTab} onTabChange={onTabChange} isDark={isDark} onToggleDark={toggle} />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
```

### 2.4 — Header: `src/components/Layout/Header.jsx`

**Purpose**: Sticky top navigation with tab buttons, dark mode toggle, and mobile hamburger menu. Includes `MutationObserver`-like body scroll lock via `useEffect`.

```js
import { useState, useEffect } from 'react';
import { LayoutDashboard, Kanban as KanbanIcon, BarChart3, Calendar, DollarSign, Menu, X, Sun, Moon } from 'lucide-react';
import { TABS } from '../../constants';

const TAB_ICONS = {
  home: LayoutDashboard,
  projects: KanbanIcon,
  overview: BarChart3,
  calendar: Calendar,
  ledger: DollarSign,
};

export default function Header({ activeTab, onTabChange, isDark, onToggleDark }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // ...
}
```

**Key patterns**:
- Desktop nav: `hidden lg:flex` — tab buttons inside a pill container
- Mobile menu: full-screen overlay with slide-in drawer `w-72 max-w-[80vw]`
- Tab button active style: `bg-white dark:bg-dark-bg text-[#550000] dark:text-dark-accent shadow-md`
- Uses `TABS` from constants — adding a tab to `TABS` automatically adds it to both mobile and desktop nav
- Logo click navigates home: `onClick={() => handleTabClick('home')}`

---

## Phase 3: Projects Tab & Kanban

### 3.1 — Project Utilities: `src/utils/project.js`

**Purpose**: Pure functions for parsing project data, generating codes, building Kanban board structure, and determining status colors.

```js
import { THEME } from '../constants';

export function parseCurrency(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/[^\d.-]/g, '')) || 0;
}
```
Removes `₱`, `,` and other non-numeric characters. Handles `"₱1,000.00"` → `1000`.

```js
export function getStatusStyle(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('not started')) return { color: '#94a3b8', bg: '#f1f5f9' };
  if (s.includes('in progress')) return { color: THEME.accent, bg: '#fefce8' };
  if (s.includes('completed') || s.includes('done')) return { color: '#10b981', bg: '#ecfdf5' };
  if (s.includes('review') || s.includes('audit') || s.includes('post-docs'))
    return { color: THEME.primary, bg: '#fff1f2' };
  return { color: '#64748b', bg: '#f8fafc' };
}
```

```js
export function transformProjects(data) {
  if (!data || data.length <= 1) return [];
  return data.slice(1)
    .filter((row) => row.row[1] || row.row[3])
    .map((row) => {
      let details = null;
      try {
        const raw = row.row[6];
        if (raw) details = JSON.parse(raw);
      } catch {}
      return {
        index_: row.index_,
        id: row.row[0],
        name: row.row[1] || 'Untitled Project',
        head: row.row[2],
        focus: row.row[3],
        date: row.row[4],
        status: row.row[5] || 'Not Started',
        details,                    // BlockNote JSON from column 6
        budget: parseCurrency(row.row[7]),
        notes: row.row[8],
      };
    });
}
```

**CSV column layout for projects**: `[0=Project Code, 1=Project Name, 2=Project Head, 3=Area Focus, 4=Implementation Date, 5=Status, 6=Details (JSON), 7=Budget, 8=Notes]`

```js
export function generateProjectCode(data, dateStr) {
  let month;
  if (dateStr) {
    const d = new Date(dateStr);
    month = String(d.getMonth() + 1).padStart(2, '0');
  } else {
    month = String(new Date().getMonth() + 1).padStart(2, '0');
  }
  const existing = (data || [])
    .slice(1)
    .map((r) => r.row[0])
    .filter((c) => c && c.startsWith(month + '-'))
    .map((c) => parseInt(c.split('-')[1], 10))
    .filter((n) => !isNaN(n));
  const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${month}-${String(nextNum).padStart(3, '0')}`;
}
```

Generates codes like `07-003` (month 7, third project). Scans existing codes to find the next sequential number.

```js
export function buildKanbanBoard(projects) {
  const columns = ['Not Started', 'In Progress', 'Post-Docs', 'Done'];
  const board = {};
  columns.forEach((c) => { board[c] = []; });
  projects.forEach((p) => {
    const status = columns.includes(p.status) ? p.status : 'Not Started';
    board[status].push(p);
  });
  return { columns, board };
}
```

### 3.2 — Shared StatusBadge: `src/components/shared/StatusBadge.jsx`

```js
import { getStatusStyle } from '../../utils/project';

export default function StatusBadge({ status }) {
  const style = getStatusStyle(status);
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {status}
    </div>
  );
}
```

### 3.3 — DroppableZone: `src/components/Tracker/DroppableZone.jsx`

```js
import { useDroppable } from '@dnd-kit/core';

export default function DroppableZone({ id, children }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex-1 px-4 pb-6 overflow-y-auto scrollbar-hide">
      {children}
    </div>
  );
}
```

### 3.4 — ProjectCard: `src/components/Tracker/ProjectCard.jsx`

**Purpose**: Sortable Kanban card with project info, edit/delete buttons, spend progress bar.

```js
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, Calendar, Edit3, Trash2 } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { parseCurrency } from '../../utils/project';

export default function ProjectCard({ project, onEdit, onDelete, spendMap }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.index_.toString() });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const budget = parseCurrency(project.budget);
  const spent = spendMap?.[project.id] || 0;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <div ref={setNodeRef} style={style} className="bg-white dark:bg-dark-card p-5 rounded-[2rem] border border-slate-100 dark:border-dark-border shadow-sm mb-4 group hover:shadow-xl hover:shadow-[#550000]/5 dark:hover:shadow-black/30 transition-all duration-300">
      {/* ... drag handle area with ID badge, edit/delete buttons */}
      {/* ... project name, head, date */}
      {/* ... budget value + StatusBadge */}
      {/* ... spend progress bar: Spent: ₱{spent} {pct}% */}
      <div className="w-full bg-slate-100 dark:bg-dark-hover h-2 rounded-full overflow-hidden">
        <div className="bg-[#efbf04] dark:bg-[#fbcc0e] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

**Important drag-and-drop patterns**:
- `useSortable` must receive `id` as a **string** (required by `@dnd-kit`)
- Drag handle area: `{...attributes} {...listeners}` on the element that initiates drag
- `isDragging` sets opacity to 0.3 on the original position
- `CSS.Translate.toString(transform)` from `@dnd-kit/utilities` applies the transform

### 3.5 — KanbanBoard: `src/components/Tracker/KanbanBoard.jsx`

**Purpose**: Full Kanban board with drag-and-drop between 4 columns and DragOverlay portal.

```js
import { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import ProjectCard from './ProjectCard';
import DroppableZone from './DroppableZone';
import { buildKanbanBoard, getStatusStyle } from '../../utils/project';

export default function KanbanBoard({ projects, updateItem, deleteItem, insertItem, moveItem, onEdit, spendMap }) {
  const [activeDragId, setActiveDragId] = useState(null);
  const { columns, board } = useMemo(() => buildKanbanBoard(projects), [projects]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    if (columns.includes(overId)) {
      const proj = projects.find((p) => p.index_ === activeId);
      if (proj && proj.status !== overId) {
        updateItem(activeId, [undefined, undefined, undefined, undefined, undefined, overId]);
      }
    } else {
      const overIndex = Number(overId);
      if (activeId !== overIndex) {
        moveItem(activeId, overIndex);
      }
    }
  };

  // DragOverlay is rendered via ReactDOM.createPortal to document.body
  return (
    <>
      {/* Header: "Active Pipeline" title + "Initiate Project" button */}
      <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
        <DndContext sensors={sensors} collisionDetection={closestCorners}
          onDragStart={(e) => setActiveDragId(e.active.id)}
          onDragEnd={handleDragEnd}>
          <div className="flex gap-4 md:gap-8 h-full min-w-max">
            {columns.map((col) => (
              <div key={col} className="w-[300px] md:w-[360px] flex flex-col bg-slate-100/50 dark:bg-dark-input/50 rounded-[2.5rem] border border-slate-200/40 dark:border-dark-border-md/40">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusStyle(col).color }} />
                    <h3 className="font-black text-slate-800 dark:text-dark-text text-xs uppercase tracking-widest">{col}</h3>
                  </div>
                  <span className="bg-white dark:bg-dark-input px-3 py-1 rounded-full text-[10px] font-black text-slate-500 dark:text-dark-muted shadow-sm border border-slate-100 dark:border-dark-border-md">
                    {board[col].length}
                  </span>
                </div>
                <DroppableZone id={col}>
                  <SortableContext items={board[col].map((p) => p.index_.toString())} strategy={verticalListSortingStrategy}>
                    {board[col].map((p) => (
                      <ProjectCard key={p.index_} project={p} onEdit={(proj) => onEdit(proj)} onDelete={deleteItem} spendMap={spendMap} />
                    ))}
                  </SortableContext>
                </DroppableZone>
              </div>
            ))}
          </div>
          {typeof document !== 'undefined' &&
            ReactDOM.createPortal(
              <DragOverlay>
                {activeProject ? (
                  <div className="bg-white dark:bg-dark-card p-5 rounded-3xl border-2 border-[#efbf04] dark:border-[#fbcc0e] shadow-2xl w-[320px] scale-105 rotate-3 opacity-90">
                    <h4 className="font-black text-slate-900 dark:text-dark-text">{activeProject.name}</h4>
                  </div>
                ) : null}
              </DragOverlay>,
              document.body,
            )}
        </DndContext>
      </div>
    </>
  );
}
```

**Drag handling logic**:
- Dropping on a column header (`columns.includes(overId)`): update the project's status field via `updateItem`
- Dropping on another card (`overId` is a number): reorder via `moveItem`
- `activeDragId` is tracked to render the DragOverlay
- The `typeof document !== 'undefined'` guard prevents SSR issues
- `closestCorners` collision detection for natural feel

### 3.6 — ProjectsTab: `src/tabs/ProjectsTab.jsx`

**Purpose**: Orchestrates the Projects tab. Lazy-loads `ProjectDetailPage` and `TemplateManager`.

```js
import { useState, useMemo, lazy, Suspense } from 'react';
import { FileText } from 'lucide-react';
import KanbanBoard from '../components/Tracker/KanbanBoard';
import { transformProjects } from '../utils/project';

const TemplateManager = lazy(() => import('../components/Tracker/TemplateManager'));
const ProjectDetailPage = lazy(() => import('../components/Tracker/ProjectDetailPage'));

export default function ProjectsTab({ project, spendMap }) {
  const [detailProject, setDetailProject] = useState(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const projects = useMemo(() => transformProjects(project.data), [project.data]);

  const handleEdit = (proj) => setDetailProject(proj);
  const handleClose = () => setDetailProject(null);

  const handleSave = (index_, payload) => {
    if (index_ != null) {
      project.updateItem(index_, payload);
    } else {
      project.insertItem(index_, payload);
    }
  };

  if (detailProject !== null) {
    return (
      <Suspense fallback={null}>
        <ProjectDetailPage editingItem={detailProject} onSave={handleSave} onClose={handleClose} projectData={project.data} />
      </Suspense>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-lg font-black text-[#550000] tracking-tight">Projects</h2>
        <button onClick={() => setTemplatesOpen(true)} className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 dark:text-dark-muted tracking-widest hover:text-[#550000] dark:hover:text-dark-accent transition-colors">
          <FileText size={14} /> Templates
        </button>
      </div>
      <KanbanBoard projects={projects} updateItem={project.updateItem} deleteItem={project.deleteItem} insertItem={project.insertItem} moveItem={project.moveItem} onEdit={handleEdit} spendMap={spendMap} />
      {templatesOpen && (
        <Suspense fallback={null}>
          <TemplateManager onClose={() => setTemplatesOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
```

---

## Phase 4: Overview Tab

### 4.1 — D3 Donut Chart: `src/components/Overview/D3Donut.jsx`

**Purpose**: SVG donut chart built with D3. Shows budget allocation by area focus (or actual spend in "actual" view).

```js
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { CHART_COLORS } from '../../constants';

export default function D3Donut({ data }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current || !data.length) return;

    const isDark = document.documentElement.classList.contains('dark');
    const width = 260, height = 260, margin = 20;
    const radius = Math.min(width, height) / 2 - margin;

    d3.select(ref.current).selectAll('*').remove();

    const svg = d3.select(ref.current)
      .append('svg').attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'w-full h-auto max-w-[260px]')
      .append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie().value((d) => d.budget).sort(null);
    const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 0.95).cornerRadius(6);
    const hoverArc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius * 1.05).cornerRadius(8);
    const color = d3.scaleOrdinal().range(CHART_COLORS);
    const total = d3.sum(data, (d) => d.budget);

    svg.selectAll('path')
      .data(pie(data)).enter().append('path')
      .attr('d', arc).attr('fill', (d, i) => color(i))
      .attr('stroke', isDark ? '#1f2937' : 'white')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer')
      .on('mouseenter', function () { d3.select(this).transition().duration(200).attr('d', hoverArc); })
      .on('mouseleave', function () { d3.select(this).transition().duration(200).attr('d', arc); });

    svg.append('text').attr('text-anchor', 'middle').attr('dy', '-0.1em')
      .style('font-size', '22px').style('font-weight', '900')
      .style('fill', isDark ? '#fbcc0e' : '#550000')
      .text(`₱${total > 999 ? (total / 1000).toFixed(1) + 'k' : total}`);

    svg.append('text').attr('text-anchor', 'middle').attr('dy', '1.5em')
      .style('font-size', '10px').style('font-weight', '800')
      .style('fill', isDark ? '#9ca3af' : '#64748b')
      .style('text-transform', 'uppercase').text('Total Budget');
  }, [data]);

  return <div ref={ref} className="w-full max-w-[200px] md:max-w-[260px] mx-auto" />;
}
```

**Gotchas**:
- D3 is imperative — the `useEffect` clears and rebuilds the SVG on every `data` change
- Dark mode is detected at render time via `document.documentElement.classList.contains('dark')` (not reactive — re-renders on data change only)
- `pie().sort(null)` preserves the original data order (matching CHART_COLORS sequence)

### 4.2 — AreaFocusDetail: `src/components/Overview/AreaFocusDetail.jsx`

**Purpose**: Lists each area focus with budget, project count, and spend percentage.

```js
import { CHART_COLORS } from '../../constants';

export default function AreaFocusDetail({ stats, view }) {
  return (
    <div className="bg-white dark:bg-dark-card p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-dark-border shadow-sm">
      <h4 className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-dark-muted mb-4 md:mb-6">Area Focus Detail</h4>
      <div className="space-y-2 md:space-y-3">
        {stats.map((s, i) => {
          const pct = s.budget > 0 ? Math.round((s.spent / s.budget) * 100) : 0;
          return (
            <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-slate-50 dark:bg-dark-input rounded-xl md:rounded-2xl border border-slate-100 dark:border-dark-border-md group hover:border-[#efbf04] dark:hover:border-[#fbcc0e] transition-all">
              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-dark-text truncate">{s.focus}</span>
              </div>
              <div className="text-right shrink-0 ml-2">
                {view === 'actual' ? (
                  <>
                    <div className="text-xs md:text-sm font-black text-[#550000]">₱{s.spent.toLocaleString()}</div>
                    <div className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-dark-muted">{pct}% of ₱{s.budget.toLocaleString()}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs md:text-sm font-black text-slate-900 dark:text-dark-text">₱{s.budget.toLocaleString()}</div>
                    <div className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-dark-muted">{s.count} Projects</div>
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
```

### 4.3 — BudgetAllocationList: `src/components/Overview/BudgetAllocationList.jsx`

**Purpose**: Scrollable ranked list of projects by budget, with rank number, name, focus, budget/spend.

```js
import { FileText } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

export default function BudgetAllocationList({ projects, spendMap, view }) {
  const sorted = [...projects].sort((a, b) => b.budget - a.budget);

  return (
    <div className="bg-white dark:bg-dark-card p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-dark-border shadow-sm min-h-[400px] md:min-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h3 className="font-black text-slate-900 dark:text-dark-text flex items-center gap-3 text-sm md:text-base">
          <div className="bg-[#efbf04]/10 dark:bg-dark-accent/10 p-1.5 md:p-2 rounded-xl text-[#efbf04] dark:text-dark-accent">
            <FileText size={16} />
          </div>
          Budget Allocation
        </h3>
        <div className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest">
          Total: {projects.length} Entries
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 md:pr-2 custom-scrollbar space-y-3 md:space-y-4">
        {sorted.map((p, i) => {
          const spent = spendMap?.[p.id] || 0;
          const pct = p.budget > 0 ? Math.min((spent / p.budget) * 100, 100) : 0;
          const remaining = Math.max(p.budget - spent, 0);
          return (
            <div key={p.index_} className="flex items-center gap-3 md:gap-6 p-3 md:p-5 rounded-2xl md:rounded-3xl bg-white dark:bg-dark-input border border-slate-100 dark:border-dark-border-md hover:shadow-lg transition-all">
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-dark-hover flex items-center justify-center font-black text-slate-400 dark:text-dark-muted text-[9px] md:text-xs shrink-0">
                #{i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-black text-slate-900 dark:text-dark-text truncate text-xs md:text-sm">{p.name}</h5>
                <p className="text-[8px] md:text-[10px] font-bold text-slate-400 dark:text-dark-muted uppercase tracking-widest mt-0.5 md:mt-1">{p.focus}</p>
              </div>
              {view === 'actual' ? (
                <div className="text-right shrink-0">
                  <div className="text-xs md:text-sm font-black text-[#550000]">₱{spent.toLocaleString()}</div>
                  <div className="mt-1 hidden md:block">
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-dark-hover rounded-full overflow-hidden ml-auto">
                      <div className="bg-[#efbf04] dark:bg-[#fbcc0e] h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 dark:text-dark-muted mt-0.5">₱{remaining.toLocaleString()} left</div>
                  </div>
                </div>
              ) : (
                <div className="text-right shrink-0">
                  <div className="text-xs md:text-sm font-black text-[#550000]">₱{p.budget.toLocaleString()}</div>
                  <div className="mt-1"><StatusBadge status={p.status} /></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 4.4 — OverviewTab: `src/tabs/OverviewTab.jsx`

**Purpose**: Tab container with "Allocation"/"Actual Spent" toggle, stats computation via `useMemo`, and grid layout.

```js
import { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { PieChart as PieChartIcon, TrendingDown } from 'lucide-react';
import D3Donut from '../components/Overview/D3Donut';
import AreaFocusDetail from '../components/Overview/AreaFocusDetail';
import BudgetAllocationList from '../components/Overview/BudgetAllocationList';
import { transformProjects } from '../utils/project';

export default function OverviewTab({ project, spendMap }) {
  const [view, setView] = useState('allocation');
  const projects = useMemo(() => transformProjects(project.data), [project.data]);

  const stats = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      if (p.focus && String(p.focus).toLowerCase() !== 'uncategorized') {
        if (!map[p.focus]) map[p.focus] = { focus: p.focus, count: 0, budget: 0, spent: 0 };
        map[p.focus].count++;
        map[p.focus].budget += p.budget;
        map[p.focus].spent += spendMap?.[p.id] || 0;
      }
    });
    return Object.values(map).sort((a, b) => b.budget - a.budget);
  }, [projects, spendMap]);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div className="flex bg-slate-100/50 dark:bg-dark-input/50 p-1 rounded-2xl border border-slate-200/40 dark:border-dark-border-md/40">
          <button onClick={() => setView('allocation')} className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all flex items-center gap-2 ${view === 'allocation' ? 'bg-white dark:bg-dark-input text-[#550000] dark:text-dark-accent shadow-md' : 'text-slate-500 dark:text-dark-muted hover:text-slate-800 dark:hover:text-dark-text'}`}>
            <PieChartIcon size={14} strokeWidth={3} /> Allocation
          </button>
          <button onClick={() => setView('actual')} className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all flex items-center gap-2 ${view === 'actual' ? 'bg-white dark:bg-dark-input text-[#550000] dark:text-dark-accent shadow-md' : 'text-slate-500 dark:text-dark-muted hover:text-slate-800 dark:hover:text-dark-text'}`}>
            <TrendingDown size={14} strokeWidth={3} /> Actual Spent
          </button>
        </div>
      </div>
      {/* Grid: D3Donut + AreaFocusDetail | BudgetAllocationList */}
    </div>
  );
}
```

---

## Phase 5: Calendar Tab

### 5.1 — CalendarGrid: `src/components/Calendar/CalendarGrid.jsx`

**Purpose**: Full month grid with navigation, day cells showing up to 3 projects with colored status borders.

```js
import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getStatusStyle } from '../../utils/project';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ calendarDate, projects, onPrevMonth, onNextMonth, onDayClick, onProjectClick }) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayOfMonth = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

  const projectsWithDates = useMemo(() => {
    return projects.map((p) => {
      let parsedDate = null;
      if (p.date) {
        const str = String(p.date).trim();
        const parts = str.split('/');
        if (parts.length === 3) {
          const [m, d, y] = parts.map((v) => parseInt(v, 10));
          parsedDate = new Date(y, m - 1, d);
        } else {
          const d = new Date(str);
          if (!isNaN(d.getTime())) parsedDate = d;
        }
      }
      return { ...p, parsedDate };
    });
  }, [projects]);
}
```

**Date parsing**: Tries `MM/DD/YYYY` format first, then falls back to native `Date` constructor. This handles both "6/29/2026" and ISO date strings.

**Day cell rendering**:
```jsx
<div onClick={() => onDayClick(dayNum, month, year)}
  className="min-h-[80px] md:min-h-[140px] bg-slate-50 dark:bg-dark-input/50 hover:bg-white dark:hover:bg-dark-hover hover:border-[#efbf04] dark:hover:border-[#fbcc0e] hover:shadow-lg cursor-pointer border border-slate-100 dark:border-dark-border-md rounded-xl md:rounded-3xl p-1.5 md:p-3 flex flex-col transition-all group">
  <div className="flex justify-between items-start mb-1 md:mb-2">
    <span className="text-[10px] md:text-xs font-black text-slate-600 dark:text-dark-muted group-hover:text-[#550000] dark:group-hover:text-dark-accent group-hover:scale-110 transition-all">{dayNum}</span>
  </div>
  <div className="space-y-1 overflow-y-auto mt-1 max-h-[50px] md:max-h-[110px] pr-1 custom-scrollbar">
    {dayProjects.slice(0, 3).map((proj) => (
      <div key={proj.index_} onClick={(e) => { e.stopPropagation(); onProjectClick(proj); }}
        className="text-[8px] md:text-[10px] font-bold p-1 md:p-2 rounded-lg md:rounded-xl bg-white dark:bg-dark-input border border-slate-100 dark:border-dark-border-md shadow-sm flex flex-col gap-0.5 md:gap-1 hover:border-[#efbf04] dark:hover:border-[#fbcc0e] transition-all"
        style={{ borderLeft: `3px solid ${getStatusStyle(proj.status).color}` }}>
        <span className="truncate text-slate-800 dark:text-dark-text leading-tight">{proj.name}</span>
      </div>
    ))}
    {dayProjects.length > 3 && <div className="text-[7px] md:text-[8px] font-black text-[#550000] text-center">+{dayProjects.length - 3} more</div>}
  </div>
</div>
```

### 5.2 — UnscheduledPanel: `src/components/Calendar/UnscheduledPanel.jsx`

**Purpose**: Sidebar listing projects without dates. Click opens the project detail modal.

```js
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

export default function UnscheduledPanel({ unscheduledProjects, onProjectClick }) {
  return (
    <div className="lg:col-span-4 space-y-6 md:space-y-8">
      <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-[2rem] md:rounded-[3rem] shadow-sm p-5 md:p-8 flex flex-col max-h-[400px] md:max-h-[640px]">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="font-black text-slate-900 dark:text-dark-text tracking-tight flex items-center gap-2 text-sm md:text-base">
            <AlertCircle size={16} className="text-[#efbf04] dark:text-[#fbcc0e]" />
            Unscheduled ({unscheduledProjects.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 md:space-y-3">
          {unscheduledProjects.length === 0 ? (
            <div className="py-8 md:py-12 text-center text-slate-300 dark:text-dark-muted">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-400 opacity-60" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">All projects scheduled</span>
            </div>
          ) : (
            unscheduledProjects.map((proj) => (
              <div key={proj.index_} onClick={() => onProjectClick(proj)}
                className="p-3 md:p-4 bg-slate-50 dark:bg-dark-input hover:bg-white dark:hover:bg-dark-hover hover:border-[#efbf04] dark:hover:border-[#fbcc0e] hover:shadow-md border border-slate-100 dark:border-dark-border-md rounded-xl md:rounded-2xl cursor-pointer transition-all group">
                <h4 className="font-black text-slate-800 dark:text-dark-text text-[10px] md:text-xs leading-snug group-hover:text-[#550000] dark:group-hover:text-dark-accent transition-colors truncate">{proj.name}</h4>
                <div className="flex justify-between items-center text-[9px] md:text-[10px] text-slate-400 dark:text-dark-muted font-black mt-1">
                  <span>{proj.head || 'No Assigned Lead'}</span>
                  <span className="text-[#550000]">₱{proj.budget.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

### 5.3 — CalendarTab: `src/tabs/CalendarTab.jsx`

**Purpose**: Orchestrates the Calendar tab with date state, project filtering, and modal management.

```js
import { useState, useMemo, lazy, Suspense } from 'react';
import CalendarGrid from '../components/Calendar/CalendarGrid';
import UnscheduledPanel from '../components/Calendar/UnscheduledPanel';
import { transformProjects } from '../utils/project';

const ProjectDetailModal = lazy(() => import('../components/Tracker/ProjectDetailModal'));

export default function CalendarTab({ project, spendMap }) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const projects = useMemo(() => transformProjects(project.data), [project.data]);
  // ... date parsing, prev/next handlers, day click, project click, save
}
```

---

## Phase 6: Ledger Tab

### 6.1 — Ledger Utilities: `src/utils/ledger.js`

**Purpose**: Currency formatting, metadata discovery from header rows, column index discovery, transaction transformation, and spend map computation.

```js
export function parsePHP(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/[₱,]/g, '')) || 0;
}

export function formatPHP(val) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(val);
}
```

**Metadata discovery** — the first 3 rows of the ledger CSV may contain key-value metadata:
```js
export function getSummaryValue(data, keyword) {
  for (let r = 0; r < Math.min(data.length, 3); r++) {
    const idx = data[r].row.findIndex(
      (cell) => typeof cell === 'string' && cell.toLowerCase().includes(keyword.toLowerCase())
    );
    if (idx !== -1) {
      for (let i = idx + 1; i < Math.min(idx + 4, data[r].row.length); i++) {
        const val = data[r].row[i];
        if (val !== null && val !== '' && !(typeof val === 'string' && val.includes(':'))) {
          return val;
        }
      }
    }
  }
  return null;
}
```

**Ledger CSV column layout (from `reference/ledger_reference.csv`)**:
```
Date Recorded, Entry ID, Type, Date Issued, Description, Invoice/Doc No., Debit, Credit, Account, Account No., Project ID, Filing Status, Submission Status, Document Link, Entry by
```

**Column discovery** — find header row by searching for "no.":
```js
export function getColIndex(headers, keywords) {
  return headers.findIndex(
    (h) => h && keywords.some((k) => h.toLowerCase().includes(k.toLowerCase()))
  );
}
```

**Transaction transformation** — converts raw CSV rows into typed objects:
```js
export function transformTransactions(data) {
  if (!data || data.length === 0) return [];
  const headerRowIndex = data.findIndex((row) =>
    row.row.some((cell) => typeof cell === 'string' && cell.toLowerCase().includes('no.'))
  );
  if (headerRowIndex === -1) return [];

  const headers = data[headerRowIndex].row;
  const col = {
    no: getColIndex(headers, ['no.']),
    date: getColIndex(headers, ['date recorded']),
    entryCode: getColIndex(headers, ['entry code', 'entry id']),
    type: getColIndex(headers, ['type']),
    dateIssued: getColIndex(headers, ['date issued']),
    description: getColIndex(headers, ['description']),
    invoice: getColIndex(headers, ['invoice', 'doc no']),
    debit: getColIndex(headers, ['debit']),
    credit: getColIndex(headers, ['credit']),
    account: getColIndex(headers, ['account']),
    accountNo: getColIndex(headers, ['account no.']),
    project: getColIndex(headers, ['project']),
    filing: getColIndex(headers, ['filing status']),
    submission: getColIndex(headers, ['submission status']),
    link: getColIndex(headers, ['document link', 'gdrive']),
    entryBy: getColIndex(headers, ['entry by']),
  };

  const val = (idx, row) => (idx !== -1 && idx < row.length ? row[idx] : null);

  return data.slice(headerRowIndex + 1)
    .filter((item) => item.row.some((cell) => cell !== null && cell !== ''))
    .map((item) => ({
      index_: item.index_,
      no: val(col.no, item.row),
      date: val(col.date, item.row),
      entryCode: val(col.entryCode, item.row),
      type: val(col.type, item.row),
      dateIssued: val(col.dateIssued, item.row),
      description: val(col.description, item.row) || 'No description',
      invoice: val(col.invoice, item.row),
      debit: parsePHP(val(col.debit, item.row)),
      credit: parsePHP(val(col.credit, item.row)),
      account: val(col.account, item.row) || 'Uncategorized',
      accountNo: val(col.accountNo, item.row),
      project: val(col.project, item.row) || 'General',
      filing: val(col.filing, item.row) || 'Pending',
      submission: val(col.submission, item.row),
      link: val(col.link, item.row),
      entryBy: val(col.entryBy, item.row),
      raw: item.row,        // kept for edits
    }));
}
```

**Spend map** — how much each project has spent (sum of credits):
```js
export function computeSpendMap(ledgerData) {
  const transactions = transformTransactions(ledgerData);
  const map = {};
  transactions.forEach((t) => {
    const code = t.project;
    if (!code || code === 'General') return;
    const amount = t.credit; // outflow = actual spend
    map[code] = (map[code] || 0) + amount;
  });
  return map;
}
```

### 6.2 — ContextRibbon: `src/components/Ledger/ContextRibbon.jsx`

**Purpose**: Maroon ribbon bar showing month (with prev/next navigation), book status, opened-on, and opened-by metadata.

```js
import { Calendar, Clock, User, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ContextRibbon({ summary, onPrevMonth, onNextMonth }) {
  return (
    <div className="bg-[#550000] text-white px-3 md:px-8 py-2 text-[10px] flex flex-wrap items-center justify-between gap-3 border-b border-[#800000]">
      {/* Month navigator with ChevronLeft/ChevronRight */}
      {/* Status badge (ACTIVE = emerald) */}
      {/* Opened on / Opened by */}
    </div>
  );
}
```

### 6.3 — MetricCards: `src/components/Ledger/MetricCards.jsx`

**Purpose**: Four metric cards: Total Debit, Total Credit, Net Balance, Record Count.

```js
import { ArrowDownRight, ArrowUpRight, DollarSign, Layers } from 'lucide-react';
import { formatPHP } from '../../utils/ledger';

export default function MetricCards({ totalDebit, totalCredit, balance, count }) {
  // ... 4 cards in a responsive grid
}
```

### 6.4 — ChartsPanel: `src/components/Ledger/ChartsPanel.jsx`

**Purpose**: Two sections — debit distribution by project (horizontal bar chart) and account breakdown (percentage list). Uses D3 `rollups`.

```js
import { useMemo } from 'react';
import * as d3 from 'd3';
import { BarChart3, PieChart } from 'lucide-react';
import { formatPHP } from '../../utils/ledger';

export default function ChartsPanel({ transactions, totalDebit }) {
  const debitByProject = useMemo(
    () => d3.rollups(transactions, (v) => d3.sum(v, (d) => d.debit), (d) => d.project)
      .sort((a, b) => b[1] - a[1]),
    [transactions]
  );

  const debitByAccount = useMemo(
    () => d3.rollups(transactions, (v) => d3.sum(v, (d) => d.debit), (d) => d.account)
      .sort((a, b) => b[1] - a[1]),
    [transactions]
  );

  return (
    <div className="lg:col-span-4 space-y-4 md:space-y-6">
      {/* Project Distribution: horizontal bars */}
      {/* Account Breakdown: percentage list */}
    </div>
  );
}
```

### 6.5 — TransactionTable: `src/components/Ledger/TransactionTable.jsx`

**Purpose**: Full-featured transaction table with project/account filters, 8 columns, inline actions.

```js
import { Filter, Calendar, Hash, Tag, ExternalLink, Edit2, Trash2, Layers } from 'lucide-react';
import { formatPHP } from '../../utils/ledger';

export default function TransactionTable({ transactions, filteredTransactions, filterProject, filterAccount, onFilterProject, onFilterAccount, projects, accounts, followLink, onEdit, onDelete }) {
  // ...
}
```

**Filter UI**: Two `<select>` dropdowns with `Filter` icon overlays:
```jsx
<div className="relative">
  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
  <select className="pl-9 pr-7 md:pr-8 py-2 md:py-2.5 bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border-md rounded-xl text-[10px] md:text-[11px] font-black text-slate-600 dark:text-dark-text outline-none focus:ring-2 focus:ring-[#550000]/10 appearance-none cursor-pointer"
    value={filterProject} onChange={(e) => onFilterProject(e.target.value)}>
    <option value="All">All Projects</option>
    {projects.filter((p) => p !== 'All').map((p) => <option key={p} value={p}>{p}</option>)}
  </select>
</div>
```

**Table columns**: `# | Detailed Description | Reference | Categorization | Debit | Credit | Status | Actions`
- Actions show on hover: ExternalLink (clipboard copy), Edit, Delete
- Empty state: `<Layers size={64} />` with "Empty Ledger" message

### 6.6 — TransactionModal: `src/components/Ledger/TransactionModal.jsx`

**Purpose**: Add/Edit modal with all ledger fields including auto-generated entry codes and date-driven project code selection.

```js
import { useState, useMemo } from 'react';
import { X, Calendar, Hash, FileText, User, Tag } from 'lucide-react';

export default function TransactionModal({ editingIndex, transactions, projectData, projectCodes, onSave, onClose }) {
  // ...
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
}
```

**Form submission** — uses `FormData` to collect values, maps them to the raw row array by index:
```js
const handleSubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const row = editingTransaction ? [...editingTransaction.raw] : new Array(15).fill(null);
  row[0] = fd.get('date');        // column indices match CSV schema
  row[1] = fd.get('entryCode');
  // ... all 15 columns
  row[14] = fd.get('entryBy');
  onSave(editingIndex, row);
  onClose();
};
```

### 6.7 — LedgerTab: `src/tabs/LedgerTab.jsx`

**Purpose**: Orchestrates the entire Ledger tab. Computes derived data (transactions, summary, filtered list), manages filter/ribbon month state.

**Key state**:
```js
const [isAddingEntry, setIsAddingEntry] = useState(false);
const [editingIndex, setEditingIndex] = useState(null);
const [filterProject, setFilterProject] = useState('All');
const [filterAccount, setFilterAccount] = useState('All');
const [ribbonMonth, setRibbonMonth] = useState(() => MONTH_NAMES[new Date().getMonth()]);
```

**Month filtering** — transactions are filtered by month extracted from their date field, compared against `ribbonMonth`:
```js
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
```

**Gotcha**: `ribbonMonth` overrides `summary.month` when passed to `ContextRibbon`. The summary metadata is read-only (used for display); the ribbon month is mutable state.

---

## Phase 7: Project Details & Templates

### 7.1 — Template Utilities: `src/utils/templates.js`

**Purpose**: CRUD for BlockNote templates in `localStorage`. Seeds a hardcoded default template on first access.

**Keys**: `aces_templates` (JSON array), `aces_default_template_id` (string ID).

```js
const STORAGE_KEY = 'aces_templates';
const DEFAULT_KEY = 'aces_default_template_id';

const HARDCODED_TEMPLATE = {
  name: 'Default Template',
  content: [
    { type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Project Title', styles: {} }] },
    // ... headings, paragraphs, bullet lists, dividers
  ],
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function seedIfEmpty() {
  let templates = load();
  if (!templates || templates.length === 0) {
    const id = uid();
    templates = [{ ...HARDCODED_TEMPLATE, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    saveToStorage(templates);
    localStorage.setItem(DEFAULT_KEY, id);
  }
  return templates;
}

export function getTemplates() { return seedIfEmpty(); }
export function getDefaultTemplate() {
  const templates = getTemplates();
  const defaultId = localStorage.getItem(DEFAULT_KEY);
  return templates.find((t) => t.id === defaultId) || templates[0];
}
export function saveTemplate(template) { /* upsert with id generation */ }
export function deleteTemplate(id) { /* remove, fix default if needed */ }
export function setDefaultTemplate(id) { localStorage.setItem(DEFAULT_KEY, id); }
```

### 7.2 — ProjectDetailPage: `src/components/Tracker/ProjectDetailPage.jsx`

**Purpose**: Full-page project editor with BlockNote WYSIWYG and collapsible properties table.

**Key patterns**:
```js
import { useCreateBlockNote, BlockNoteViewRaw } from '@blocknote/react';
import '@blocknote/react/style.css';

// Dark mode detection via MutationObserver (useSyncExternalStore)
const isDark = useSyncExternalStore(
  (cb) => {
    const observer = new MutationObserver(cb);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  },
  () => document.documentElement.classList.contains('dark')
);

// BlockNote editor creation
const editor = useCreateBlockNote({
  initialContent: isEditing && editingItem.details
    ? editingItem.details
    : defaultContent(),  // getDefaultTemplate().content
  defaultStyles: false,
});
```

**Properties table** — uses a custom `PropertyRow` component:
```jsx
function PropertyRow({ label, children }) {
  return (
    <div className="grid grid-cols-[120px_1fr] border-b border-slate-100 dark:border-dark-border last:border-b-0">
      <div className="px-4 py-2.5 text-[11px] font-bold text-slate-500 dark:text-dark-muted border-r border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-hover/30 flex items-center">
        {label}
      </div>
      <div className="px-4 py-2.5 flex items-center">{children}</div>
    </div>
  );
}
```

**Save** — serializes BlockNote document to JSON string, stores in `row[6]`:
```js
const handleSubmit = () => {
  const detailsJSON = JSON.stringify(editor.document);
  const payload = [
    isEditing ? editingItem.id : nextCode,    // row[0]
    name,                                      // row[1]
    head,                                      // row[2]
    focus,                                     // row[3]
    date,                                      // row[4]
    status,                                    // row[5]
    detailsJSON,                               // row[6]
    budget,                                    // row[7]
    '',                                        // row[8] notes
  ];
  onSave(editingItem?.index_, payload);
  onClose();
};
```

### 7.3 — ProjectDetailModal: `src/components/Tracker/ProjectDetailModal.jsx`

**Purpose**: Modal version of the project detail editor (used in Calendar tab). Same form fields and BlockNote editor, but rendered as a centered modal overlay.

```jsx
// Overlay
<div className="fixed inset-0 bg-[#550000]/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center">
  <div className="bg-white dark:bg-dark-card rounded-t-[3rem] md:rounded-[3rem] shadow-2xl w-[95vw] md:w-[90vw] max-w-[1000px] max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom md:zoom-in duration-200">
    {/* ... same header, properties, BlockNote editor, footer */}
  </div>
</div>
```

### 7.4 — TemplateManager: `src/components/Tracker/TemplateManager.jsx`

**Purpose**: In-app template CRUD with a list view and an inline editor using BlockNote.

**List view**: Shows templates with name, default badge, and actions (Set Default, Edit, Delete).

**Editor** (`TemplateEditor` sub-component): Full BlockNote editor inside a modal with name input and save/back buttons.

```js
function TemplateEditor({ template, onSaved, onBack, onClose }) {
  const [name, setName] = useState(template.name);
  const editor = useCreateBlockNote({
    initialContent: template.content || [],
    defaultStyles: false,
  });
  const handleSave = () => {
    const content = editor.document;
    saveTemplate({ ...template, name, content });
    onSaved();
  };
  // ... modal with BlockNoteViewRaw
}
```

### 7.5 — Lazy Loading BlockNote

Both `ProjectDetailPage`, `ProjectDetailModal`, and `TemplateManager` use `React.lazy()`:
```js
const ProjectDetailPage = lazy(() => import('../components/Tracker/ProjectDetailPage'));
const ProjectDetailModal = lazy(() => import('../components/Tracker/ProjectDetailModal'));
const TemplateManager = lazy(() => import('../components/Tracker/TemplateManager'));
```

This code-splits the ~852 KB BlockNote bundle into a separate chunk, keeping the main bundle at ~346 KB.

---

## Phase 8: Dark Mode

### 8.1 — `useDarkMode` Hook: `src/hooks/useDarkMode.js`

**Purpose**: Toggles `dark` class on `<html>`, persists to `localStorage`, respects system preference.

```js
import { useState, useEffect, useCallback } from 'react';

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark);
  }, [isDark]);

  const toggle = useCallback(() => setIsDark((prev) => !prev), []);

  return { isDark, toggle };
}
```

**Behavior**:
1. On initial load, checks `localStorage['darkMode']` first
2. If not stored, falls back to `prefers-color-scheme: dark` media query
3. On toggle, updates `<html class="dark">` and persists to localStorage
4. Used in `Layout/index.jsx` and passed down to `Header`

### 8.2 — Tailwind Dark Mode

Configured with `darkMode: 'class'` in `tailwind.config.js`. All components use `dark:` variants:

```jsx
<div className="bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text transition-colors">
```

Custom dark palette colors: `dark-bg`, `dark-card`, `dark-text`, `dark-muted`, `dark-border`, `dark-border-md`, `dark-input`, `dark-hover`, `dark-accent`.

### 8.3 — BlockNote Dark Mode

BlockNote uses a separate theme prop. Detected via `MutationObserver`:

```jsx
const isDark = useSyncExternalStore(/* MutationObserver on <html class> */);
// ...
<BlockNoteViewRaw editor={editor} theme={isDark ? 'dark' : 'light'} />
```

---

## Phase 9: Deployment

### 9.1 — `npm run deploy` Script

In `package.json`:
```json
"deploy": "gh-pages -d dist"
```

Manual deploy: `npm run build && npm run deploy`

### 9.2 — GitHub Actions Auto-Deploy

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Important**: This workflow triggers on push to `main`. The `peaceiris/actions-gh-pages` action handles pushing to `gh-pages` branch.

### 9.3 — Base Path

Vite config sets `base: '/aces_dashboard_proto/'` — all asset URLs and `import.meta.env.BASE_URL` will be prefixed with this path. This must match the GitHub Pages repository sub-path.

---

## Phase 10: Polish & Optimizations

### 10.1 — Code-Split BlockNote

```js
const ProjectDetailPage = lazy(() => import('../components/Tracker/ProjectDetailPage'));
const ProjectDetailModal = lazy(() => import('../components/Tracker/ProjectDetailModal'));
const TemplateManager = lazy(() => import('../components/Tracker/TemplateManager'));
```

Wrapped in `<Suspense fallback={null}>` to show nothing during load (the chunk is ~852 KB).

### 10.2 — Mobile Responsive

- Hamburger menu in `Header` (`lg:hidden`) with slide-in drawer
- Body scroll lock when mobile menu is open
- Responsive grid layouts using `grid-cols-1 lg:grid-cols-12`
- Text size scaling: `text-[10px] md:text-sm`
- Calendar: `min-h-[80px] md:min-h-[140px]` day cells
- Table: horizontal scroll with `min-w-[900px]` on the `<table>`

### 10.3 — Performance

- `useMemo` on all transformed data (projects list, transactions, stats, filtered results)
- `useCallback` on all CRUD methods passed via props
- `cancelled` flag in `useSheetData` fetch to prevent updates after unmount
- D3 charts unmount/remount via `selectAll('*').remove()`
- Custom scrollbar styles for overflow containers

### 10.4 — Clipboard Fallback

The `followLink` function has a two-tier clipboard approach:
1. `navigator.clipboard.writeText()` (modern API)
2. Fallback: create hidden `<textarea>`, `select()`, `execCommand('copy')`

---

## Appendix A: Data Contracts

### A.1 — Project Tracker CSV Columns

| Index | Field | Description |
|-------|-------|-------------|
| 0 | Project Code | Auto-generated (`MM-NNN`) |
| 1 | Project Name | Title |
| 2 | Project Head | Lead name |
| 3 | Area Focus | One of: Organizational Development, Student Services and Formation, Community Involvement |
| 4 | Implementation Date | `MM/DD/YYYY` |
| 5 | Status | Not Started / In Progress / Post-Docs / Done |
| 6 | Details | BlockNote JSON (stringified) |
| 7 | Budget | Currency string (`₱1,000.00`) |
| 8 | Notes | Free text |

### A.2 — Ledger CSV Columns

| Index | Field | Description |
|-------|-------|-------------|
| 0 | Date Recorded | Transaction date |
| 1 | Entry ID | Auto-generated (`MM-NNN`) |
| 2 | Type | Income / Subsidy / Expenditure |
| 3 | Date Issued | |
| 4 | Description | Memo/purpose |
| 5 | Invoice/Doc No. | Reference number |
| 6 | Debit | Inflow amount |
| 7 | Credit | Outflow amount |
| 8 | Account | SACEV / PTA / Others |
| 9 | Account No. | |
| 10 | Project ID | Project code (FK) |
| 11 | Filing Status | Pending / Filed / Active |
| 12 | Submission Status | Pending / Submitted / Revised / Approved |
| 13 | Document Link | GDrive URL |
| 14 | Entry By | Staff name |

### A.3 — Metadata Rows (Ledger, rows 0-2)

Scanned by `getSummaryValue`. Common keys:
- `Transaction Month` or `Month`
- `Monthly Debit`, `Monthly Credit`, `Monthly Balance`
- `Book Status` (ACTIVE)
- `Opened On`, `Opened By`

---

## Appendix B: File Tree

```
aces-dashboard-proto/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── AGENTS.md
├── PLAN.md
├── REBUILD_GUIDE.md
├── public/
│   ├── project_reference.csv
│   └── ledger_reference.csv
├── reference/
│   ├── project_reference.csv
│   ├── ledger_reference.csv
│   ├── ACES Project Dashboard/         (Canvas prototype reference)
│   ├── ACES Ledger Dashboard/          (Canvas prototype reference)
│   └── XU - ACES Project Template.pdf
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── constants.js
    ├── data/
    │   ├── csvParser.js
    │   └── sources.js
    ├── hooks/
    │   ├── useSheetData.js
    │   └── useDarkMode.js
    ├── utils/
    │   ├── ledger.js
    │   ├── project.js
    │   └── templates.js
    ├── tabs/
    │   ├── ProjectsTab.jsx
    │   ├── OverviewTab.jsx
    │   ├── CalendarTab.jsx
    │   └── LedgerTab.jsx
    └── components/
        ├── Layout/
        │   ├── index.jsx
        │   └── Header.jsx
        ├── shared/
        │   └── StatusBadge.jsx
        ├── Tracker/
        │   ├── KanbanBoard.jsx
        │   ├── DroppableZone.jsx
        │   ├── ProjectCard.jsx
        │   ├── ProjectDetailPage.jsx
        │   ├── ProjectDetailModal.jsx
        │   └── TemplateManager.jsx
        ├── Overview/
        │   ├── D3Donut.jsx
        │   ├── AreaFocusDetail.jsx
        │   └── BudgetAllocationList.jsx
        ├── Calendar/
        │   ├── CalendarGrid.jsx
        │   └── UnscheduledPanel.jsx
        └── Ledger/
            ├── ContextRibbon.jsx
            ├── MetricCards.jsx
            ├── ChartsPanel.jsx
            ├── TransactionTable.jsx
            └── TransactionModal.jsx
```

---

## Appendix C: Key Gotchas & Pitfalls

1. **Column indices are NEVER hardcoded** — always use `getColIndex()` with keyword arrays. The Google Sheet columns can be reordered without breaking the app.

2. **No router** — Tabs are controlled by `useState('home')`. The app is not SEO-friendly, which is fine for an authenticated internal dashboard.

3. **In-memory CRUD** — All changes are lost on page refresh. The Google Sheet is the only source of truth. Users are expected to copy changes to the Sheet manually.

4. **BlockNote is heavy** — Always lazy-load it (`React.lazy` + `Suspense`). The bundle is ~852 KB.

5. **BlockNote default styles** — Pass `defaultStyles: false` to `useCreateBlockNote` to avoid style conflicts with Tailwind.

6. **Dark mode detection in D3** — The donut chart detects dark mode at render time via `document.documentElement.classList.contains('dark')`. It won't live-update on toggle — re-render only on data change.

7. **`@dnd-kit` version compatibility** — `@dnd-kit/sortable@^10` requires `@dnd-kit/core@^6`. The `id` passed to `useSortable` must be a string. The `moveItem` function operates on array index order, not `index_`.

8. **Date parsing** — Projects use `MM/DD/YYYY` format. The calendar tries split-by-`/` first, then falls back to `new Date(str)`. Always handle invalid dates gracefully.

9. **`useSyncExternalStore` for dark mode in BlockNote** — BlockNote needs a `theme` prop (`'dark' | 'light'`). Use `useSyncExternalStore` with a `MutationObserver` watching the `<html>` class attribute for reactive updates.

10. **`followLink` copies, does not navigate** — It uses `navigator.clipboard.writeText()` with a `<textarea>` fallback. The `setCopiedKey` callback shows a "COPIED" state for 2 seconds.
