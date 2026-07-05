import { THEME } from '../constants';

export function parseCurrency(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/[^\d.-]/g, '')) || 0;
}

export function getStatusStyle(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('not started')) return { color: '#94a3b8', bg: '#f1f5f9' };
  if (s.includes('in progress')) return { color: THEME.accent, bg: '#fefce8' };
  if (s.includes('completed') || s.includes('done')) return { color: '#10b981', bg: '#ecfdf5' };
  if (s.includes('review') || s.includes('audit') || s.includes('post-docs'))
    return { color: THEME.primary, bg: '#fff1f2' };
  return { color: '#64748b', bg: '#f8fafc' };
}

export function transformProjects(data) {
  if (!data || data.length <= 1) return [];
  return data.slice(1)
    .filter((row) => row.row[1] || row.row[3])
    .map((row) => {
      let details = null;
      try {
        const raw = row.row[6];
        if (raw) details = JSON.parse(raw);
      } catch {}
      return {
        index_: row.index_,
        id: row.row[0],
        name: row.row[1] || 'Untitled Project',
        head: row.row[2],
        focus: row.row[3],
        date: row.row[4],
        status: row.row[5] || 'Not Started',
        details,
        budget: parseCurrency(row.row[7]),
        notes: row.row[8],
      };
    });
}

export function generateProjectCode(data, dateStr) {
  let month;
  if (dateStr) {
    const d = new Date(dateStr);
    month = String(d.getMonth() + 1).padStart(2, '0');
  } else {
    month = String(new Date().getMonth() + 1).padStart(2, '0');
  }
  const existing = (data || [])
    .slice(1)
    .map((r) => r.row[0])
    .filter((c) => c && c.startsWith(month + '-'))
    .map((c) => parseInt(c.split('-')[1], 10))
    .filter((n) => !isNaN(n));
  const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${month}-${String(nextNum).padStart(3, '0')}`;
}

export function buildKanbanBoard(projects) {
  const columns = ['Not Started', 'In Progress', 'Post-Docs', 'Done'];
  const board = {};
  columns.forEach((c) => { board[c] = []; });
  projects.forEach((p) => {
    const status = columns.includes(p.status) ? p.status : 'Not Started';
    board[status].push(p);
  });
  return { columns, board };
}
