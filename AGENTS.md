# ACES Dashboard Proto — Agent Guide

## Status

Fully implemented React + Vite SPA, **deployed** to GitHub Pages. See `PLAN.md` for full roadmap.

## Architecture

- **React + Vite** static SPA, **no backend**. Tab switching via `useState` (no router).
- Data fetched client-side from **published Google Sheets CSV URLs** (env vars `VITE_PROJECT_TRACKER_URL`, `VITE_LEDGER_URL`). Falls back to `public/*.csv` for dev.
- CSV format: `{ index_: number, row: string[] }`. Column positions discovered by **keyword search on header row** (`getColIndex()` in `src/utils/ledger.js`). **Do not hardcode column numbers** — always use the keyword search pattern.
- CRUD is **in-memory only** (`src/data/csvParser.js`). Google Sheet is the source of truth; local changes are ephemeral.
- Theme: maroon `#550000` / gold `#efbf04`.

## Key Dependencies

`@dnd-kit/core` + `@dnd-kit/sortable` (Kanban drag-and-drop), `d3` (charts), `papaparse` (CSV), `lucide-react` (icons), `tailwindcss` (styling).

## Commands

```bash
npm run dev          # http://localhost:5173 (or next available port)
npm run build        # static dist/
npm run deploy       # gh-pages push to https://kirakage88.github.io/aces_dashboard_proto/
```

No tests exist (`build` is the only verification step).

## Important Patterns

- **Column discovery**: Header row is found by searching for a cell containing `'no.'`. All column indices use `getColIndex(headers, ['keyword1', 'keyword2'])`. Any new field must follow this pattern.
- **Metadata rows** (ledger): First 3 rows may contain key-value metadata (e.g. "transaction month", "monthly debit") discovered by `getSummaryValue()`. If absent, fallbacks are used (current month, "System").
- **Ledger month filtering**: The `ribbonMonth` state drives transaction filtering by month (extracted from the `date` field). The `summary.month` from metadata is overridden by `ribbonMonth` when passed to ContextRibbon.
- **Spend map**: `computeSpendMap(ledger.data)` sums `credit` per project code. Used by Kanban card progress bars and Overview tab.
- **GitHub Pages base path**: `/aces_dashboard_proto/` (set in `vite.config.js`). The CSV fetch URL uses `import.meta.env.BASE_URL` automatically.
- **Reactive data**: `useSheetData()` hook returns `{ project, ledger, loading, error, followLink }`. Both `project` and `ledger` expose `{ data, updateItem, deleteItem, insertItem, moveItem }`.

## Reference Material

- `reference/*.csv` — data contract (column names and sample rows for both sheets).
- `reference/ACES Project Dashboard/` — Canvas prototype (Kanban + D3 charts + calendar). This is the **spec** for the Projects/Overview/Calendar tabs.
- `reference/ACES Ledger Dashboard/` — Canvas prototype (ledger table, CRUD, rollups). This is the **spec** for the Ledger tab.
