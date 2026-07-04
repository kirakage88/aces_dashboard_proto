const BASE = import.meta.env.BASE_URL || '/';

export const SHEETS = {
  projectTracker:
    import.meta.env.VITE_PROJECT_TRACKER_URL || `${BASE}project_reference.csv`,
  ledger: import.meta.env.VITE_LEDGER_URL || `${BASE}ledger_reference.csv`,
};
