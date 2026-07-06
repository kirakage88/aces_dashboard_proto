# ACES Dashboard Prototype

A centralized dashboard for the Association of the College of Engineering Students (ACES) at Xavier University — project management, financial tracking, role-based departmental views, and document linking.

Built with **React + Vite**, backed by **Supabase (PostgreSQL)**, deployed on **GitHub Pages**.

> **Live site:** https://kirakage88.github.io/aces_dashboard_proto/

---

## Features

- **Role-based access** — Login via Google OAuth. Office of the President sees all tabs; Finance sees Ledger + Budget; Events sees Calendar + Event Dashboard; standard departments see Projects + Calendar. Each role sees only their department's data (enforced by Row-Level Security).
- **Kanban board** — Drag-and-drop project cards across Not Started / In Progress / Post-Docs / Done columns. Cards show progress bars based on ledger spending.
- **Project detail page** — Full-page WYSIWYG editor (BlockNote) with Notion-like property table (code, name, head, focus, dates, status, budget). Template system for new projects.
- **Overview tab** — D3.js donut chart (budget by area focus), sorted project budget list with rank, spending breakdown.
- **Calendar tab** — Month grid with projects plotted on implementation dates. Unscheduled projects sidebar.
- **Ledger tab** — Transaction table with project/account filters, inline editing. Summary cards (total debit, credit, balance, count). D3.js charts and month navigation.
- **Department-specific tabs** — Finance gets Budget + Disbursements dashboards; Events gets Events Dashboard. Additional departments can be added via reference sheets.
- **Template manager** — In-app creation, editing, deletion, and default-selection of BlockNote project templates. Persisted to Supabase.
- **Dark mode** — Toggle with live `<html class="dark">` toggle, persists to `localStorage`.
- **Mobile responsive** — Hamburger menu navigation on small screens, responsive layouts throughout.

---

## Tech Stack

| Category | Library |
|---|---|
| Framework | React 18, Vite 6 |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL 15+) |
| Auth | Supabase Auth (Google OAuth) |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| Charts | D3.js 7 |
| WYSIWYG Editor | @blocknote/react 0.51 (lazy-loaded, ~852 KB) |
| Icons | Lucide React |
| Deployment | GitHub Pages, Vercel (future) |

---

## Architecture

```
Browser ──→ React (Vite SPA) ──→ Supabase SDK ──→ PostgreSQL
                                        │
                                   Google OAuth
                                        │
                                   Row-Level Security
```

- **Supabase is the only backend** — data, auth, and security all in one service.
- **Google OAuth** — users sign in with their Xavier Google account.
- **Row-Level Security** — each user's role determines what data they can read/write. Enforced at the database level, not just UI hiding.
- **No global state library** — `useState` + `useMemo` + `useCallback` only.
- **Lazy loading** — BlockNote editor chunk (~852 KB) loaded on demand via `React.lazy`.
- **Typed data** — Supabase returns objects with named properties (`.name`, `.budget`, `.status`) instead of CSV row arrays.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase account (free tier)

### Install & Run

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration SQL from `SCHEMA.md` in the SQL Editor
3. Enable Google OAuth in Authentication → Providers
4. Copy `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`:

```env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Build

```bash
npm run build     # outputs to dist/
```

No test suite exists; `build` is the only verification step.

---

## Project Structure

```
aces-dashboard-proto/
├── public/                    # Static assets
├── reference/                 # Data contract CSVs + Canvas prototype specs
├── REBUILD/                   # Step-by-step rebuild guide (phases 1-16)
├── src/
│   ├── App.jsx                # Root component, auth gate, tab switcher
│   ├── main.jsx               # Entry point
│   ├── roles.js               # Role config + tab registry (NEW)
│   ├── constants.js           # Theme colors, chart colors
│   ├── index.css              # Tailwind directives + custom styles
│   ├── lib/
│   │   └── supabase.js        # Supabase client init (NEW)
│   ├── hooks/
│   │   ├── useAuth.js         # Google OAuth auth state (NEW)
│   │   ├── useSupabaseData.js # Data fetching + CRUD (NEW)
│   │   └── useDarkMode.js     # Dark mode toggle
│   ├── components/
│   │   ├── LoginScreen.jsx    # Google OAuth login (NEW)
│   │   ├── Layout/            # Header, navigation, dark mode toggle
│   │   ├── Tracker/           # KanbanBoard, ProjectDetailPage, TemplateManager
│   │   ├── Calendar/          # Calendar grid, day panel
│   │   ├── Ledger/            # Transaction table, summary cards, filters
│   │   ├── Overview/          # Donut chart, budget list
│   │   └── shared/            # StatusBadge
│   ├── tabs/                  # Tab-level views (Projects, Overview, Calendar, Ledger, Budget, Disbursements, Events)
│   └── utils/                 # ledger.js, project.js, templates.js
├── SCHEMA.md                  # Full database schema + migration SQL (NEW)
├── handoff.md                 # AI co-developer guide (NEW)
├── REBUILD_GUIDE.md           # Rebuild guide TOC
├── vite.config.js             # Vite + React plugin, base path config
├── tailwind.config.js         # Dark mode custom palette
└── PLAN.md                    # Roadmap
```

---

## Rebuild Guide

If you want to rebuild this app from scratch, see:

- `REBUILD_GUIDE.md` — Table of contents for all 16 phases
- `REBUILD/` directory — Detailed step-by-step instructions per phase
- `handoff.md` — Concise reference for AI co-developers
- `SCHEMA.md` — Migration SQL and database documentation

---

## Deployment

### Automatic (CI)

Push to `main` — GitHub Actions builds and deploys to GitHub Pages. Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set as repository secrets.

### Manual

```bash
npm run build
npm run deploy      # gh-pages -d dist
```

---

## Related

- [ACES Audit System Proposal](https://docs.google.com/document/d/1MJAomhbz34-tsTv4Cx11ASyIm-mbkoWAPknO9BrBegI/edit)
- `SCHEMA.md` — Database schema and migration SQL
- `reference/*.csv` — Data contract (column definitions)
- `reference/ACES Project Dashboard/` — Canvas prototype spec
- `reference/ACES Ledger Dashboard/` — Canvas prototype spec
