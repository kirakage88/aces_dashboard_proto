# ACES Dashboard Prototype

A centralized dashboard for the Association of the College of Engineering Students (ACES) at Xavier University. Built with React + Vite, deployed on GitHub Pages, with Google Sheets as the backend data layer.

## Reference Code

The `reference/` folder contains the original Google Sheets Canvas prototype:

| File | Description |
|---|---|
| `reference/ACES Project Dashboard` | Complete Canvas app code — React + dnd-kit Kanban, D3.js donut chart, calendar view, clipboard link navigation. Built in AppSheet Canvas but serves as the feature reference for the custom React build. |

**Key features to re-implement from Canvas:**
- 4-tab navigation (Home, Projects/Kanban, Overview/Charts, Calendar)
- Drag-and-drop Kanban board for project status tracking
- D3.js budget allocation donut chart
- Calendar with unscheduled projects panel
- Modal form for adding/editing projects
- Clipboard-based Google resource linking (Ledger, Drive, Files)

## Architecture

```
Google Sheets ──→ Published as CSV/JSON ──→ React app (static) ──→ GitHub Pages
  (data entry)    (auto-updating URL)        (reads + displays)
```

**Key design decisions:**
- **No backend server** — static site only, data is fetched client-side from published Google Sheets
- **Google Sheets is the source of truth** — departments continue using Sheets for data entry, the dashboard only reads
- **GitHub Pages for hosting** — free, fast, no maintenance
- **React + Vite** — modern toolchain, easy to extend

## Sheets (Data Sources)

| Tracker | Purpose | Status |
|---|---|---|
| Project Tracker | Master list of all projects and their status | Configured |
| Ledger | Financial tracking (income/expenditure per project) | Configured |
| Project Documentation | Google Doc template per project (linked, not fetched) | N/A |
| Physical Filing System | Labeled physical folders (offline, linked only) | N/A |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Add a Google Sheet as a data source

1. Open your Google Sheet
2. **File → Share → Publish to web**
3. Choose **Entire Document** or a specific sheet, format **CSV**
4. Copy the published URL
5. Add it to `src/data/sources.js` (or equivalent config file)

### Deploy to GitHub Pages

```bash
npm run build
npm run deploy
```

The site goes live at `https://<username>.github.io/aces-dashboard-proto/`.

## Project Structure

```
aces-dashboard-proto/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── Dashboard/    # Summary cards, KPIs
│   │   ├── Tracker/      # Table views for each tracker
│   │   └── Layout/       # Navigation, header
│   ├── data/             # Sheet URLs, data fetching logic
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## Features (Planned)

- [ ] Summary dashboard with KPI cards (total projects, budget spent, pending items)
- [ ] Project Tracker table view with filtering and search
- [ ] Ledger view with financial summaries
- [ ] Auto-refresh from Google Sheets
- [ ] Dark mode toggle
- [ ] Mobile responsive

## Related

- [ACES Audit System Proposal](https://docs.google.com/document/d/1MJAomhbz34-tsTv4Cx11ASyIm-mbkoWAPknO9BrBegI/edit)
- ACES Project Documentation Framework (Obsidian vault)
