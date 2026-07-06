# Phase 5: Data Layer

> **Goal:** Build the Supabase data fetching hook that replaces the old CSV-based `useSheetData` and `csvParser.js`.

---

## 5.1 — What's Different From the CSV Version

| Aspect | Old (CSV) | New (Supabase) |
|---|---|---|
| Data format | `{ index_: number, row: string[] }` | Typed objects with named properties |
| Parsing | Manual column indexing via `getColIndex()` | SQL query selects named columns |
| CRUD | Array mutation in `csvParser.js` | `supabase.from('table').insert/update/delete` |
| Loading | Single fetch at startup | Single fetch + realtime subscriptions (optional) |
| Filtering | Manual `.filter()` in components | SQL `WHERE` clause + RLS |

## 5.2 — Create `src/hooks/useSupabaseData.js`

This hook mirrors the old `useSheetData` API so components don't need major changes:

```js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export default function useSupabaseData(user, profile) {
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // RLS automatically filters based on the user's role
      // Executive roles see all rows; department roles see only their own
      const [projRes, txRes] = await Promise.all([
        supabase.from('projects').select('*').order('sort_order'),
        supabase.from('transactions').select('*').order('date_recorded', { ascending: false }),
      ]);

      if (projRes.error) throw projRes.error;
      if (txRes.error) throw txRes.error;

      setProjects(projRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  // ---- CRUD: Projects ----

  const updateProject = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setProjects((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  }, []);

  const deleteProject = useCallback(async (id) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const insertProject = useCallback(async (project) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...project, department_id: profile?.department_id })
      .select()
      .single();

    if (error) throw error;
    setProjects((prev) => [...prev, data]);
    return data;
  }, [profile]);

  const moveProject = useCallback(async (fromIdx, toIdx) => {
    // Reorder projects — updates sort_order for both items
    const copy = [...projects];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);

    const updates = copy.map((p, i) => ({
      id: p.id,
      sort_order: i,
    }));

    // Batch update sort_order
    const { error } = await supabase
      .from('projects')
      .upsert(updates);

    if (error) throw error;
    setProjects(copy);
  }, [projects]);

  // ---- CRUD: Transactions ----

  const updateTransaction = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const insertTransaction = useCallback(async (tx) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...tx, department_id: profile?.department_id })
      .select()
      .single();

    if (error) throw error;
    setTransactions((prev) => [data, ...prev]);
    return data;
  }, [profile]);

  // ---- Return shape matching old useSheetData ----

  const project = useMemo(() => ({
    data: projects,
    updateItem: updateProject,
    deleteItem: deleteProject,
    insertItem: insertProject,
    moveItem: moveProject,
  }), [projects, updateProject, deleteProject, insertProject, moveProject]);

  const ledgerObj = useMemo(() => ({
    data: transactions,
    updateItem: updateTransaction,
    deleteItem: deleteTransaction,
    insertItem: insertTransaction,
    moveItem: null, // transactions don't need reordering
  }), [transactions, updateTransaction, deleteTransaction, insertTransaction]);

  return { project: project, ledger: ledgerObj, loading, error, refetch: fetchData };
}
```

## 5.3 — Return Value Shape

The hook returns an object that matches the old `useSheetData` shape:

```js
{
  project: {
    data: [...],          // Array of typed project objects
    updateItem: fn,       // (id, updates) → Promise
    deleteItem: fn,       // (id) → Promise
    insertItem: fn,       // (project) → Promise
    moveItem: fn,         // (fromIdx, toIdx) → Promise
  },
  ledger: {
    data: [...],          // Array of typed transaction objects
    updateItem: fn,
    deleteItem: fn,
    insertItem: fn,
    moveItem: null,
  },
  loading: bool,
  error: string | null,
  refetch: fn,            // Manual refresh
}
```

## 5.4 — Important: Typed Data vs Old Row-Based Data

**Old data shape (CSV):**
```js
{
  index_: 5,
  row: ['06-001', 'Project Test 1', 'Clars', 'Organizational Development',
        '6/29/2026', 'Not Started', '{"type":"doc"...}', '₱1,000.00', '']
}
// Access: project.row[1] → name, project.row[7] → budget
```

**New data shape (Supabase):**
```js
{
  id: 1,
  project_code: '06-001',
  name: 'Project Test 1',
  head: 'Clars',
  area_focus: 'Organizational Development',
  implementation_date: '2026-06-29',
  status: 'Not Started',
  details: { type: 'doc', content: [...] },
  budget: 1000.00,
  notes: null,
  sort_order: 0,
  department_id: 1,
  created_at: '2026-07-07T00:00:00Z',
  updated_at: '2026-07-07T00:00:00Z',
}
// Access: project.name, project.budget, project.status
```

**Every component must be updated** from `row[index]` access to named property access.

## 5.5 — Updating Components: Find-and-Replace Guide

| Old pattern | New pattern | Files affected |
|---|---|---|
| `project.row[0]` | `project.project_code` or `project.id` | KanbanBoard, ProjectCard |
| `project.row[1]` | `project.name` | Many |
| `project.row[2]` | `project.head` | ProjectDetailPage, TransactionModal |
| `project.row[3]` | `project.area_focus` | OverviewTab |
| `project.row[4]` | `project.implementation_date` | CalendarGrid |
| `project.row[5]` | `project.status` | ProjectCard, KanbanBoard |
| `project.row[6]` | `project.details` (already parsed) | ProjectDetailPage, TemplateManager |
| `project.row[7]` | `project.budget` | OverviewTab, ProjectCard |
| `t.row[6]` (debit) | `t.debit` | TransactionModal, MetricCards |
| `t.row[7]` (credit) | `t.credit` | TransactionModal, MetricCards, ChartsPanel |
| `t.row[10]` (project) | `t.project_code` | TransactionTable |
| `t.row[13]` (link) | `t.document_link` | TransactionTable |

## 5.6 — Removing Old Files

Once the new hook is working, delete these files:

```bash
rm src/data/csvParser.js
rm src/data/sources.js
```

And remove `papaparse` from `package.json`:

```bash
npm uninstall papaparse
```

---

## Next Step

Proceed to [`06-utilities.md`](06-utilities.md) to update the utility functions for the new data format.
