export const SHEETS = {
  projectTracker:
    import.meta.env.VITE_PROJECT_TRACKER_URL || '/project_reference.csv',
  ledger: import.meta.env.VITE_LEDGER_URL || '/ledger_reference.csv',
};
