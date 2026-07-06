# ACES Dashboard — Agent Guide

## Status

Prototype migrating from CSV-based SPA to **Supabase-backed** application with role-based access control (RBAC). See `PLAN.md` for full roadmap.

## Architecture

- **React + Vite** SPA, **Supabase (PostgreSQL)** backend, **GitHub Pages** deployment.
- Tab switching via `useState` (no router).
- Auth via **Google OAuth** (Supabase Auth).
- **Row-Level Security** — data access enforced at database level per role.
- Data is **typed objects** with named properties (`.name`, `.budget`, `.status`), not CSV row arrays.

## Key Dependencies

`@supabase/supabase-js` (database), `@dnd-kit/core` + `@dnd-kit/sortable` (Kanban), `d3` (charts), `lucide-react` (icons), `@blocknote/react` v0.51.4 (WYSIWYG editor), `tailwindcss` (styling).

## Commands

```bash
npm run dev          # http://localhost:5173
npm run build        # static dist/ (only verification step)
npm run deploy       # gh-pages push (manual; CI auto-deploys on push to main)
```

## Important Patterns

- **Supabase client**: `supabase.from('projects').select('*')` — typed data with named columns.
- **No CSV patterns**: Do NOT use `getColIndex`, `row[index]`, or `papaparse`. These are legacy from the old architecture.
- **RLS handles filtering**: Don't manually filter data by department in components. RLS returns only the rows the user is allowed to see.
- **Tab registry**: Tab definitions live in `src/roles.js` (`TAB_REGISTRY` + `ROLES`). New tabs are registered here, not in `constants.js`.
- **Data hooks**: `useSupabaseData()` returns `{ project: { data, updateItem, deleteItem, insertItem, moveItem }, ledger: {...}, loading, error }`. Same shape as old hooks, but data is typed objects.
- **Auth**: `useAuth()` returns `{ user, profile (public.users + departments), loading, signIn, signOut }`. Profile includes role and department_id.
- **Spend map**: `computeSpendMap(ledger.data)` sums `credit` per project code. Uses typed `.credit` and `.project_code` properties.
- **BlockNote**: `details` field is JSONB (already parsed). Pass directly to `useCreateBlockNote({ initialContent })`. Lazy-load via `React.lazy`.
- **Templates**: Stored in Supabase `templates` table, not localStorage. Use async functions from `src/utils/templates.js`.
- **Clipboard linking**: `followLink(url, key, setCopiedKey)` — same implementation, no changes.
- **GitHub Pages base path**: `/aces_dashboard_proto/` (in `vite.config.js`).

## Reference Material

- `SCHEMA.md` — Full database schema, migration SQL, RLS policies
- `handoff.md` — AI co-developer reference (concise patterns)
- `REBUILD_GUIDE.md` — Step-by-step rebuild guide (17 phases in `REBUILD/`; Phase 0 is a beginner learning path)
- `reference/*.csv` — Data contract (column names and sample rows)
- `reference/ACES Project Dashboard/` — Canvas prototype spec
- `reference/ACES Ledger Dashboard/` — Canvas prototype spec
