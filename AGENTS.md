# ACES Dashboard Proto — Agent Guide

## Status

This is an **unimplemented prototype**. The repo has a README spec and `reference/` (Canvas app links + sample CSVs) but **no source code, no package.json, no build tooling**. Any code an agent writes here is starting from scratch.

## Architecture (from README)

- **React + Vite** static SPA, **no backend**.
- Data fetched client-side from **published Google Sheets CSV URLs**.
- Deployed to **GitHub Pages** (`npm run build && npm run deploy`).
- Google Sheets = source of truth (read-only for the dashboard).

## Reference Material

- `reference/*.csv` — data contract for Project Tracker and Ledger.
- `reference/ACES Project Dashboard/` — Canvas prototype (Kanban + D3 charts + calendar).
- `reference/ACES Ledger Dashboard/` — Canvas prototype (ledger table, transaction CRUD, rollups).

## Key design constraints

1. Clipboard-based linking to Google resources (Docs, Drive, Sheets) — no file uploads.
2. No backend server, no auth — data must be publicly published CSV.
3. Tab navigation: Home → Projects (Kanban) → Overview (Charts) → Calendar.

## Commands (once scaffolded)

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static dist/
npm run deploy       # gh-pages push
```
