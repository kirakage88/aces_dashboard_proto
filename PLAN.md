# Implementation Roadmap — ACES Dashboard Proto

## Phase 0 — Project Scaffold

- `npm create vite@latest` (React)
- Install deps: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `lucide-react`, `d3`, `papaparse`
- `vite.config.js` — configure `base` path for GH Pages deploy
- `src/data/sources.js` — config file with published Google Sheets CSV URLs
- CSV parsing utility that normalizes Sheet rows into `{ index_, row[] }` format (matching Canvas prototype expectations)
- Copy `reference/*.csv` into `public/` so dev mode can fetch them locally

## Phase 1 — Shell & Data Layer

- `App.jsx` — `useState`-based tab switcher (no router needed): `home | projects | overview | calendar | ledger`
- `src/components/Layout/` — Header with tab navigation + external resource clipboard buttons (Ledger/Drive/Files URLs)
- `src/hooks/useSheetData.js` — fetches CSV from configured URL (or local fallback), parses via PapaParse, exposes `data`, `updateItem`, `deleteItem`, `insertItem`, `moveItem`, `followLink` (clipboard copy)
- Theme constants: primary `#550000`, accent `#efbf04`, chart color palette matching Canvas prototype

## Phase 2 — Project Dashboard (Projects + Overview + Calendar tabs)

- **Projects tab** — `@dnd-kit` Kanban with 4 columns: Not Started / In Progress / Post-Docs / Done. Drag cards to update status. Project CRUD modal (copying the Canvas form layout). Status badges with color coding.
- **Overview tab** — D3 donut chart: budget allocation by Area Focus. Sorted project budget list with rank.
- **Calendar tab** — Month grid navigation. Projects plotted on their implementation date. Unscheduled projects sidebar panel. Day click → add/edit modal.

## Phase 3 — Ledger Dashboard (Ledger tab)

- Summary metric cards: Total Debit, Total Credit, Net Balance, Record count
- D3 horizontal bar chart: debit distribution by project
- D3 account breakdown list with percentages
- Transaction table with project/account filter dropdowns
- Transaction CRUD modal with all fields from the ledger CSV schema
- Month navigation that reads/updates metadata from Sheet header rows

## Phase 4 — Polish & Deploy

- Dark mode toggle
- Mobile responsive layout
- `npm run build` → `npm run deploy` (`gh-pages`)

---

## Key Architecture Notes

1. **Data format** — Sheet rows are `{ index_: number, row: string[] }`. Column positions found by searching header row for keywords (see Ledger's `getColIndex` pattern).
2. **No backend** — CRUD is in-memory array mutation only (Sheet is source of truth).
3. **Clipboard linking** — `navigator.clipboard.writeText()` with `<textarea>` fallback. No navigation, just copy.
4. **Currency parsing** — `₱1,000.00` → `String(val).replace(/[^\d.-]/g, '')`.
5. **No router** — Tab switching with `useState`, matching the Canvas prototype pattern.
