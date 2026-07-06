# Phase 1: Architecture Overview

> **Goal:** Understand the full architecture, tech stack, and design decisions before writing any code.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                         │
│  ┌───────────────────────────────────────────┐   │
│  │         React SPA (Vite build)             │   │
│  │                                            │   │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐   │   │
│  │  │  Auth    │ │  Data    │ │  UI       │   │   │
│  │  │  (OAuth) │ │  (SDK)   │ │  (React)  │   │   │
│  │  └────┬────┘ └────┬─────┘ └───────────┘   │   │
│  └───────┼───────────┼───────────────────────┘   │
└──────────┼───────────┼───────────────────────────┘
           │           │
           ▼           ▼
     ┌─────────────────────┐
     │     Supabase         │
     │  ┌───────────────┐   │
     │  │  Auth Service  │   │
     │  │  (Google OAuth)│   │
     │  └───────┬───────┘   │
     │  ┌───────▼───────┐   │
     │  │  PostgreSQL    │   │
     │  │  + RLS         │   │
     │  └───────────────┘   │
     └─────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | React 18 | Industry standard, component model |
| **Build tool** | Vite 6 | Fast HMR, tree-shaking, easy deployment |
| **Styling** | Tailwind CSS 3 | Utility-first, dark mode via `class` |
| **Database** | Supabase (PostgreSQL 15+) | Managed Postgres with built-in auth + RLS |
| **Auth** | Supabase Auth (Google OAuth) | No password management, matches Google ecosystem |
| **Charts** | D3.js 7 | Full SVG control, no chart-library abstraction |
| **Drag & Drop** | @dnd-kit/core + sortable | Lightweight, accessible, well-typed |
| **WYSIWYG** | @blocknote/react 0.51 | Notion-like editor, code-split lazy chunk |
| **Icons** | Lucide React | Clean SVG icons, tree-shakeable |
| **Data SDK** | @supabase/supabase-js | First-party Supabase client |
| **Deploy** | GitHub Pages + Vercel | Static SPA now, full-stack later |

---

## Database Tables

5 tables, detailed in `SCHEMA.md`:

| Table | Rows Est. | Purpose |
|---|---|---|
| `departments` | 7 | Office lookup (OP, OVP, OES, Finance, Events, DRCA, General) |
| `users` | ~50 | Linked to Supabase Auth, contains role + department |
| `projects` | ~200 | Audit projects with BlockNote content |
| `transactions` | ~3000 | Financial ledger entries |
| `templates` | ~10 | BlockNote project templates |

---

## Role Model

| Role | Departments | Tab Access | Data Scope |
|---|---|---|---|
| `executive` | OP, OVP, OES | All 5 main tabs | All departments |
| `finance` | Finance | Home, Ledger, Budget, Disbursements | Finance only |
| `events` | Events | Home, Projects, Calendar, Events Dashboard | Events only |
| `drca` | DRCA | Home, Projects, Calendar | DRCA only |
| `standard` | Other depts | Home, Projects, Calendar | Their own dept |

Roles are enforced by **RLS at the database level** and **tab filtering at the UI level**.

---

## What Changed From the CSV Version

| Old (CSV) | New (Supabase) |
|---|---|
| Google Sheets → CSV → parse → display | Supabase SDK → typed objects → display |
| `papaparse` dependency | `@supabase/supabase-js` dependency |
| In-memory CRUD (lost on refresh) | Persistent CRUD (database writes) |
| Column discovery via `getColIndex()` | Named SQL columns |
| Data: `{ index_, row[] }` | Data: `{ id, name, budget, ... }` |
| Cosmetic UI filtering only | Server-enforced RLS security |
| Templates in `localStorage` | Templates in `templates` table |
| `sources.js` + `csvParser.js` | `lib/supabase.js` + hook |

---

## When to Build What

1. **Foundation** (Phases 2-4): Vite project → Supabase schema → Auth
2. **Data Layer** (Phase 5-6): Supabase client → typed data hooks → utilities
3. **Core UI** (Phase 7-8): Layout → Header → Home screen → login gate
4. **Feature Tabs** (Phase 9-13): Kanban → Details → Overview → Calendar → Ledger
5. **RBAC** (Phase 14-15): Role config → Login screen → Dept tabs
6. **Deploy** (Phase 16): Build → GitHub Pages → Vercel prep

---

## Next Step

Proceed to [`02-environment.md`](02-environment.md) to scaffold the Vite project and install dependencies.
