# ACES Dashboard Proto — Agent Guide

## Status

Fully implemented React + Vite SPA, **deployed** to GitHub Pages via GitHub Actions (push to main triggers auto-deploy). See `PLAN.md` for full roadmap.

## Architecture

- **React + Vite** static SPA, **no backend**. Tab switching via `useState` (no router).
- Data fetched client-side from **published Google Sheets CSV URLs** (env vars `VITE_PROJECT_TRACKER_URL`, `VITE_LEDGER_URL`). Falls back to `public/*.csv` in dev.
- CSV rows: `{ index_: number, row: string[] }`. Column positions discovered by **keyword search on header row** (`getColIndex()` in `src/utils/ledger.js`). **Never hardcode column numbers** — always use the keyword search pattern.
- CRUD is **in-memory only** (`src/data/csvParser.js`). Google Sheet is source of truth; local changes are ephemeral.
- Theme: maroon `#550000` / gold `#efbf04`. Dark mode via `class` toggle (`useDarkMode` hook, persists to `localStorage`).

## Key Dependencies

`@dnd-kit/core` + `@dnd-kit/sortable` (Kanban), `d3` (charts), `papaparse` (CSV), `lucide-react` (icons), `@blocknote/react` v0.51.4 (WYSIWYG editor), `tailwindcss` (styling).

## Commands

```bash
npm run dev          # http://localhost:5173
npm run build        # static dist/ (only verification step — no tests exist)
npm run deploy       # gh-pages push (manual; CI auto-deploys on push to main)
```

## Important Patterns

- **Column discovery**: Header row found by searching for cell containing `'no.'`. Use `getColIndex(headers, ['keyword1', 'keyword2'])`. Any new field must follow this pattern.
- **Metadata rows** (ledger): First 3 rows may contain key-value metadata (e.g. "transaction month") discovered by `getSummaryValue()`. If absent, fallbacks are used (current month, "System").
- **Ledger month filtering**: `ribbonMonth` state drives transaction filtering by month (extracted from `date` field). Metadata `summary.month` is overridden by `ribbonMonth` when passed to ContextRibbon.
- **Spend map**: `computeSpendMap(ledger.data)` sums `credit` per project code. Used by Kanban card progress bars and Overview tab.
- **GitHub Pages base path**: `/aces_dashboard_proto/` (in `vite.config.js`). CSV fetch URLs use `import.meta.env.BASE_URL` automatically.
- **Reactive data**: `useSheetData()` hook returns `{ project, ledger, loading, error, followLink }`. Both expose `{ data, updateItem, deleteItem, insertItem, moveItem }`.
- **Clipboard linking**: `followLink(url, key, setCopiedKey)` copies URL to clipboard via `navigator.clipboard.writeText()` with `<textarea>` fallback. No navigation.
- **Project details**: `transformProjects()` parses `row[6]` as JSON (BlockNote blocks). The `details` field stores BlockNote JSON in CSV column index 6.
- **Templates**: Stored in `localStorage` under `aces_templates` / `aces_default_template_id`. Seeded with a hardcoded template on first access. Managed via `src/utils/templates.js` (`getTemplates`, `getDefaultTemplate`, `saveTemplate`, `deleteTemplate`, `setDefaultTemplate`). Used in ProjectDetailPage and ProjectDetailModal as `getDefaultTemplate().content`.
- **Lazy chunks**: BlockNote is code-split via `React.lazy` (~852 KB loaded on demand). Main bundle is ~346 KB.

## Reference Material

- `reference/*.csv` — data contract (column names and sample rows for both sheets).
- `reference/ACES Project Dashboard/` — Canvas prototype spec for Projects/Overview/Calendar tabs.
- `reference/ACES Ledger Dashboard/` — Canvas prototype spec for Ledger tab.
