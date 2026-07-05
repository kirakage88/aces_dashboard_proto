# ACES Dashboard Prototype

A centralized dashboard for the Association of the College of Engineering Students (ACES) at Xavier University — project management, financial tracking, and document linking, all in one place.

Built with **React + Vite**, deployed on **GitHub Pages**, with **Google Sheets** as the backend data layer. No server needed.

> **Live site:** https://kirakage88.github.io/aces_dashboard_proto/

---

## Features

- **5-tab navigation** — Home, Projects (Kanban), Overview (Charts), Calendar, Ledger
- **Kanban board** — Drag-and-drop project cards across Not Started / In Progress / Post-Docs / Done columns. Cards show progress bars based on ledger spending.
- **Project detail page** — Full-page WYSIWYG editor (BlockNote) with Notion-like property table (code, name, head, focus, dates, status, budget). Template system for new projects.
- **Overview tab** — D3.js donut chart (budget by area focus), sorted project budget list with rank, spending breakdown.
- **Calendar tab** — Month grid with projects plotted on implementation dates. Unscheduled projects sidebar. Day click opens project detail modal.
- **Ledger tab** — Transaction table with project/account filters, inline editing. Summary cards (total debit, credit, balance, count). D3.js horizontal bar chart (debit by project) and account breakdown list. Month navigation with header metadata.
- **Template manager** — In-app creation, editing, deletion, and default-selection of BlockNote project templates. Persisted to localStorage.
- **Dark mode** — Toggle with live `<html class="dark">` toggle, persists to localStorage.
- **Clipboard linking** — Click external resource buttons (Ledger, Drive, Files) to copy URLs to clipboard.
- **Mobile responsive** — Hamburger menu navigation on small screens, responsive layouts throughout.

---

## Tech Stack

| Category | Library |
|---|---|
| Framework | React 18, Vite 6 |
| Styling | Tailwind CSS 3 |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| Charts | D3.js 7 |
| CSV Parsing | PapaParse |
| WYSIWYG Editor | @blocknote/react 0.51 (lazy-loaded, ~852 KB) |
| Icons | Lucide React |
| Deployment | gh-pages, GitHub Actions |

---

## Implementation Phases

| Phase | Description |
|---|---|
| **Phase 0** — Scaffold | Vite project init, install deps, CSV parser, public fallback CSVs, GitHub Pages base config |
| **Phase 1** — Shell & Data | `App.jsx` tab switcher, Layout/Header with navigation, `useSheetData()` hook, theme constants (maroon/gold), external resource clipboard buttons |
| **Phase 2** — Project Dashboard | Kanban board (dnd-kit), project CRUD modal, D3 donut + bar charts (Overview), Calendar tab with month grid + unscheduled panel |
| **Phase 3** — Ledger Dashboard | Summary metric cards, D3 horizontal bar chart + account breakdown, transaction table with filters/CRUD, month navigation with header metadata |
| **Phase 4** — Deploy | GitHub Actions auto-deploy on push to main, `gh-pages` manual fallback |
| **Phase 5** — Project Details | Full-page BlockNote editor with properties table, template management (localStorage CRUD), code-split BlockNote lazy chunk |
| **Phase 6** (planned) | Project views & filters (Kanban/Table/Calendar switcher, global filter bar) |

---

## Architecture

```
Google Sheets ──→ Published as CSV ──→ React app (static) ──→ GitHub Pages
  (data entry)    (auto-updating URL)     (reads + displays)
```

- **No backend** — Static SPA only. Data fetched client-side from published Google Sheets CSV URLs.
- **Google Sheets is the source of truth** — CRUD operations are in-memory only (ephemeral). Departments continue using Sheets for data entry.
- **Column discovery** — Header row is found by searching for a cell containing `"no."`. All column indices use `getColIndex(headers, ['keyword1', 'keyword2'])` — never hardcoded.
- **Lazy loading** — BlockNote editor chunk (~852 KB) loaded on demand via `React.lazy`. Main bundle is ~346 KB.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. In dev mode, data loads from `public/*.csv` unless `VITE_PROJECT_TRACKER_URL` and `VITE_LEDGER_URL` env vars are set.

### Configure Google Sheets as data source

1. Open your Google Sheet → **File → Share → Publish to web**
2. Choose sheet, format **CSV**, copy the published URL
3. Set environment variables or update `src/data/sources.js`

### Build

```bash
npm run build     # outputs to dist/
```

No test suite exists; `build` is the only verification step.

---

## Project Structure

```
aces-dashboard-proto/
├── public/                    # Static assets (dev CSV fallbacks)
├── reference/                 # Data contract CSVs + Canvas prototype specs
├── src/
│   ├── App.jsx                # Root component, tab switcher
│   ├── main.jsx               # Entry point
│   ├── constants.js           # Theme colors, chart colors, tab definitions
│   ├── index.css              # Tailwind directives + custom styles
│   ├── components/
│   │   ├── Layout/            # Header, navigation, dark mode toggle
│   │   ├── Tracker/           # KanbanBoard, ProjectDetailPage, TemplateManager, etc.
│   │   ├── Calendar/          # Calendar grid, day panel
│   │   ├── Ledger/            # Transaction table, summary cards, filters
│   │   ├── Overview/          # Donut chart, budget list
│   │   └── shared/            # Shared UI components
│   ├── tabs/                  # Tab-level views (Projects, Overview, Calendar, Ledger)
│   ├── data/                  # CSV fetching (csvParser.js), sheet URL config (sources.js)
│   ├── hooks/                 # useSheetData, useDarkMode
│   └── utils/                 # ledger.js, project.js, templates.js
├── vite.config.js             # Vite + React plugin, base path config
├── tailwind.config.js         # Dark mode custom palette
├── postcss.config.js          # Tailwind + autoprefixer
└── PLAN.md                    # Full roadmap
```

---

## Deployment

### Automatic (CI)

Push to `main` — GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages automatically.

### Manual

```bash
npm run build
npm run deploy      # gh-pages -d dist
```

---

## Related

- [ACES Audit System Proposal](https://docs.google.com/document/d/1MJAomhbz34-tsTv4Cx11ASyIm-mbkoWAPknO9BrBegI/edit)
- ACES Project Documentation Framework (Obsidian vault)
