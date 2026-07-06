# ACES Dashboard — Final Product

> **Starting point:** This directory contains all the documentation, schema, and rebuild guides for the ACES Dashboard. Copy this entire folder into your new repository and start building.

---

## Quick Start

| You want to... | Start here |
|---|---|
| **Learn HTML/CSS/JS/React first** | [`REBUILD/00-learning-path.md`](REBUILD/00-learning-path.md) |
| **Build the app from scratch** | [`REBUILD_GUIDE.md`](REBUILD_GUIDE.md) |
| **See the database schema** | [`SCHEMA.md`](SCHEMA.md) |
| **Give context to an AI co-developer** | [`handoff.md`](handoff.md) |
| **See the roadmap** | [`PLAN.md`](PLAN.md) |
| **Check known issues** | [`BUGS.md`](BUGS.md) |

---

## Directory Structure

```
new-repo-docs/
├── README.md                   ← You are here
├── SCHEMA.md                   # Database schema, migration SQL, RLS policies
├── handoff.md                  # AI co-developer guide
├── REBUILD_GUIDE.md            # Master rebuild guide (Table of Contents)
├── PLAN.md                     # Implementation roadmap
├── AGENTS.md                   # Agent guide (for AI tools)
├── BUGS.md                     # Known issues
├── REBUILD/                    # Phase-by-phase rebuild instructions
│   ├── 00-learning-path.md     # Learning curriculum for beginners
│   ├── 01-overview.md          →  16-deployment.md
├── reference/                  # Data contracts and Canvas specs
│   ├── project_reference.csv
│   ├── ledger_reference.csv
│   ├── ACES Project Dashboard/  # Canvas prototype
│   └── ACES Ledger Dashboard/   # Canvas prototype
└── docs/
    └── deployment-strategy.md   # GitHub Pages deployment notes
```

---

## Architecture Summary

```
Browser ──→ React (Vite SPA) ──→ Supabase SDK ──→ PostgreSQL
                                        │
                                   Google OAuth
                                        │
                                   Row-Level Security
```

- **Frontend:** React 18 + Vite 6 + Tailwind CSS 3
- **Backend:** Supabase (PostgreSQL 15+)
- **Auth:** Google OAuth via Supabase Auth
- **Security:** Row-Level Security (server-enforced per-role access)
- **Deployment:** GitHub Pages (static SPA)

---

## Roles

| Office | Tab Access | Data Scope |
|---|---|---|
| Office of the President | All 5 tabs | All departments |
| Office of the VP | All 5 tabs | All departments |
| Office of the Exec. Secretary | All 5 tabs | All departments |
| Finance & Treasury | Ledger, Budget, Disbursements | Finance only |
| Events Management | Projects, Calendar, Events Dashboard | Events only |
| DRCA | Projects, Calendar | DRCA only |
| Standard (other depts) | Projects, Calendar | Their own dept |

---

## What You'll Build

1. **Supabase project** with 5 tables, RLS policies, and seed data
2. **Google OAuth login** — users sign in with their Google account
3. **Role-based navigation** — each role sees only their tabs and data
4. **Kanban board** — drag-and-drop project management
5. **Project editor** — WYSIWYG BlockNote editor with templates
6. **Overview dashboard** — D3 donut charts and budget lists
7. **Calendar** — month grid with project timelines
8. **Ledger dashboard** — transaction table with CRUD, charts, and month filters
9. **Department-specific dashboards** — Finance (Budget, Disbursements), Events (Events Dashboard)

Each phase in `REBUILD/` walks you through building one piece. Follow them in order.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL 15+) |
| Auth | Supabase Auth (Google OAuth) |
| Charts | D3.js 7 |
| Drag & Drop | @dnd-kit |
| WYSIWYG | @blocknote/react 0.51 |
| Icons | Lucide React |
| Deploy | GitHub Pages |
