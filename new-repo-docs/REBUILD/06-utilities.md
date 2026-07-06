# Phase 6: Utility Functions

> **Goal:** Update the utility functions from the old CSV format to work with typed Supabase data.

---

## 6.1 — `src/utils/ledger.js`

**Keep:** `parsePHP`, `formatPHP`, `computeSpendMap`
**Remove:** `getColIndex`, `getSummaryValue`, `transformTransactions`

```js
// ── Keep these unchanged ──

export function parsePHP(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/[₱,]/g, '')) || 0;
}

export function formatPHP(val) {
  if (val == null || isNaN(val)) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(val);
}

// ── Updated: now takes typed transaction objects ──

export function computeSpendMap(transactions) {
  const map = {};
  (transactions || []).forEach((t) => {
    const code = t.project_code || t.project;
    if (!code) return;
    const amount = t.credit || 0;
    map[code] = (map[code] || 0) + amount;
  });
  return map;
}
```

**Note:** With Supabase data, `t.credit` and `t.debit` are already numbers (`NUMERIC` type), so `parsePHP` is only needed for old CSV data. You can keep it for backward compatibility or remove it entirely.

## 6.2 — `src/utils/project.js`

**Keep:** `parseCurrency`, `getStatusStyle`, `generateProjectCode`, `buildKanbanBoard`
**Remove:** `transformProjects` (data arrives already shaped from Supabase)

```js
export function parseCurrency(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/[^\d.-]/g, '')) || 0;
}

export function getStatusStyle(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('not started')) return { color: '#94a3b8', bg: '#f1f5f9' };
  if (s.includes('in progress')) return { color: '#efbf04', bg: '#fefce8' };
  if (s.includes('completed') || s.includes('done')) return { color: '#10b981', bg: '#ecfdf5' };
  if (s.includes('review') || s.includes('audit') || s.includes('post-docs'))
    return { color: '#550000', bg: '#fff1f2' };
  return { color: '#64748b', bg: '#f8fafc' };
}

// Updated: takes Supabase projects directly (no transform needed)
export function generateProjectCode(allProjects, dateStr) {
  let month;
  if (dateStr) {
    const d = new Date(dateStr);
    month = String(d.getMonth() + 1).padStart(2, '0');
  } else {
    month = String(new Date().getMonth() + 1).padStart(2, '0');
  }
  const existing = (allProjects || [])
    .filter((p) => p.project_code && p.project_code.startsWith(month + '-'))
    .map((p) => parseInt(p.project_code.split('-')[1], 10))
    .filter((n) => !isNaN(n));
  const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${month}-${String(nextNum).padStart(3, '0')}`;
}

export function buildKanbanBoard(projects) {
  const columns = ['Not Started', 'In Progress', 'Post-Docs', 'Done'];
  const board = {};
  columns.forEach((c) => { board[c] = []; });
  (projects || []).forEach((p) => {
    const status = columns.includes(p.status) ? p.status : 'Not Started';
    board[status].push(p);
  });
  return { columns, board };
}
```

## 6.3 — `src/utils/templates.js`

Rewrite from `localStorage` to Supabase queries:

```js
import { supabase } from '../lib/supabase';

export async function getTemplates() {
  const { data } = await supabase
    .from('templates')
    .select('*')
    .order('name');
  return data || [];
}

export async function getDefaultTemplate() {
  const { data } = await supabase
    .from('templates')
    .select('*')
    .eq('is_default', true)
    .single();
  return data || null;
}

export async function saveTemplate(template) {
  if (template.id) {
    const { data } = await supabase
      .from('templates')
      .update(template)
      .eq('id', template.id)
      .select()
      .single();
    return data;
  } else {
    const { data } = await supabase
      .from('templates')
      .insert(template)
      .select()
      .single();
    return data;
  }
}

export async function deleteTemplate(id) {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);
  return !error;
}

export async function setDefaultTemplate(id) {
  // Unset current default, then set new default
  await supabase
    .from('templates')
    .update({ is_default: false })
    .eq('is_default', true);

  await supabase
    .from('templates')
    .update({ is_default: true })
    .eq('id', id);
}
```

**Fallback for offline/development:** The old `localStorage` functions can be kept as a fallback, but the primary API should use Supabase.

## 6.4 — How Components Use Utilities Now

**Old way:**
```js
const projects = transformProjects(csvData);  // row → object
const board = buildKanbanBoard(projects);
```

**New way:**
```js
// Data from useSupabaseData is already typed
const board = buildKanbanBoard(project.data);
```

No transformation step needed. The `data` array from `useSupabaseData` contains fully-typed objects.

---

## Next Step

Proceed to [`07-core-ui.md`](07-core-ui.md) to build the Layout, Header, and core UI shell.
