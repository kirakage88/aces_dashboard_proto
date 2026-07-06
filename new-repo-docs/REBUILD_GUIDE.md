# REBUILD GUIDE — ACES Dashboard

> **Purpose:** Step-by-step guide for a human developer to rebuild the ACES Dashboard from scratch.
> **Architecture:** React + Vite SPA · Supabase (PostgreSQL) · GitHub Pages
> **Status:** Prototype phase — final product will be rebuilt in a separate repository.

---

## Before You Start

**Are you a beginner?** Start with [`REBUILD/00-learning-path.md`](REBUILD/00-learning-path.md). It tells you what HTML/CSS/JS/React concepts to learn before each phase, with free resources and a daily study schedule.

If you already know React (components, hooks, state, async/await), skip Phase 0 and start at Phase 1.

---

## How to Use This Guide

This guide is split into numbered phases in the `REBUILD/` directory. Each phase builds on the previous one. Follow them in order.

---

## Phase Index

| # | File | What You'll Build | Prerequisite Knowledge | Est. Time |
|---|---|---|---|---|
| **0** | [`REBUILD/00-learning-path.md`](REBUILD/00-learning-path.md) | **Learning roadmap** — what to study before each phase | None — this is the starting point | 1–8 weeks |
| 1 | [`REBUILD/01-overview.md`](REBUILD/01-overview.md) | Architecture overview, design decisions, tech stack rationale | Basic JavaScript | Read |
| 2 | [`REBUILD/02-environment.md`](REBUILD/02-environment.md) | Vite scaffold, dependencies, Tailwind, PostCSS, config files | Terminal basics, npm | 30 min |
| 3 | [`REBUILD/03-supabase-schema.md`](REBUILD/03-supabase-schema.md) | Supabase project, migration SQL, tables, RLS, seed data | None (just run SQL) | 1 hr |
| 4 | [`REBUILD/04-authentication.md`](REBUILD/04-authentication.md) | Google OAuth setup, `useAuth` hook | JavaScript async/await, objects | 1 hr |
| 5 | [`REBUILD/05-data-layer.md`](REBUILD/05-data-layer.md) | Supabase client, `useSupabaseData` hook, typed CRUD | React useState, useEffect, useCallback | 2 hr |
| 6 | [`REBUILD/06-utilities.md`](REBUILD/06-utilities.md) | Currency helpers, project helpers, spend map | JavaScript array methods (map, filter, reduce) | 1 hr |
| 7 | [`REBUILD/07-core-ui.md`](REBUILD/07-core-ui.md) | Layout, Header (dynamic tabs), dark mode, theme constants | React components, props, JSX | 2 hr |
| 8 | [`REBUILD/08-home-screen.md`](REBUILD/08-home-screen.md) | Hero screen, loading/error states, login gate | Conditional rendering in React | 30 min |
| 9 | [`REBUILD/09-kanban-projects.md`](REBUILD/09-kanban-projects.md) | DnD Kit Kanban board, project cards, drag-and-drop CRUD | React useState, useMemo, lifting state | 3 hr |
| 10 | [`REBUILD/10-project-detail-templates.md`](REBUILD/10-project-detail-templates.md) | BlockNote WYSIWYG editor, project properties, template system | React Suspense, lazy loading | 3 hr |
| 11 | [`REBUILD/11-overview-charts.md`](REBUILD/11-overview-charts.md) | D3 donut chart, area focus detail, budget allocation list | JavaScript array methods, SVG basics | 2 hr |
| 12 | [`REBUILD/12-calendar.md`](REBUILD/12-calendar.md) | Month grid, project plotting, unscheduled panel | Date manipulation in JavaScript | 2 hr |
| 13 | [`REBUILD/13-ledger.md`](REBUILD/13-ledger.md) | Transaction table, metrics, charts, CRUD modal, month nav | Multiple state variables, async CRUD | 4 hr |
| 14 | [`REBUILD/14-rbac-login.md`](REBUILD/14-rbac-login.md) | Role config, login screen, role-based navigation, tab registry | Auth flow, prop drilling, lazy components | 2 hr |
| 15 | [`REBUILD/15-dept-tabs.md`](REBUILD/15-dept-tabs.md) | Finance Budget, Disbursements, Events Dashboard | Component reuse patterns | 2 hr |
| 16 | [`REBUILD/16-deployment.md`](REBUILD/16-deployment.md) | GitHub Pages, environment variables, Vercel prep | GitHub, terminal basics | 30 min |

**Estimated time if you know React:** ~24–30 hours  
**Estimated time if you're learning:** 1–3 months (including study time)

---

## Architecture Summary

```
Browser ──→ React (Vite SPA) ──→ Supabase SDK ──→ PostgreSQL
                                        │
                                   Google OAuth
                                        │
                                   Row-Level Security
```

- **Frontend:** React 18 + Vite 6, single-page app, no router (`useState` tab switching)
- **Backend:** Supabase (PostgreSQL 15+) — the ONLY backend
- **Auth:** Google OAuth via Supabase Auth
- **Database:** 5 tables (`departments`, `users`, `projects`, `transactions`, `templates`)
- **Security:** Row-Level Security (RLS) — server-enforced per-role data access
- **State:** `useState` + `useMemo` + `useCallback` — no global state library
- **Deployment:** GitHub Pages (static SPA)

---

## What If I'm a Beginner?

You're in the right place. This guide is designed so you can **learn while building**. Each phase lists exactly what you need to know before starting. If you don't know it yet, Phase 0 tells you where to learn it.

**The key mindset shift:** You don't need to understand everything before you start. Start Phase 2 (environment setup) after learning basic HTML/CSS/JS. You'll learn React and Supabase naturally as you build each phase. The code you write in Phase 9 (Kanban) will make more sense because you've already used the data structures in Phase 5.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Supabase instead of Google Sheets CSV | Persistent CRUD, real security, SQL queries, relationships |
| Google OAuth | Matches existing Google ecosystem, no password management |
| RLS for access control | Server-enforced, not cosmetic UI hiding |
| `NUMERIC(12,2)` instead of float | Eliminates PHP currency precision bugs at the database level |
| `JSONB` for BlockNote content | Native JSON storage, queryable with `->>` operator |
| Named columns instead of `row[]` indexing | Self-documenting code, no column-position coupling |
| Tab registry pattern | Role-based tab sets are data-driven, not hardcoded |
| No global state library | Overkill for this scale; `useState` is simpler and sufficient |

---

## Version History

| Date | Author | Changes |
|---|---|---|
| 2026-07-07 | AI | v2 — Complete rewrite for Supabase architecture. Added `REBUILD/` phase files, `SCHEMA.md`, `handoff.md`. |
| 2026-07-07 | AI | v2.1 — Added `REBUILD/00-learning-path.md` for beginners. Added prerequisite knowledge column to phase index. |

---

## Reference Material

- `SCHEMA.md` — Full database schema with migration SQL
- `handoff.md` — AI co-developer guide (concise patterns reference)
- `reference/*.csv` — Data contract (column definitions from Google Sheets)
- `reference/ACES Project Dashboard/` — Canvas prototype spec
- `reference/ACES Ledger Dashboard/` — Canvas prototype spec
