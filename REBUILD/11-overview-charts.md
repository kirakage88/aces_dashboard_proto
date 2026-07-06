# Phase 11: Overview Tab — D3 Charts

> **Goal:** Build the Overview tab with D3 donut chart, area focus breakdown, and budget allocation list.

---

## 11.1 — OverviewTab (`src/tabs/OverviewTab.jsx`)

```jsx
import { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { PieChart as PieChartIcon, TrendingDown } from 'lucide-react';
import D3Donut from '../components/Overview/D3Donut';
import AreaFocusDetail from '../components/Overview/AreaFocusDetail';
import BudgetAllocationList from '../components/Overview/BudgetAllocationList';

export default function OverviewTab({ project, spendMap }) {
  const [view, setView] = useState('allocation');

  // Compute stats from typed project data
  const stats = useMemo(() => {
    const map = {};
    (project.data || []).forEach((p) => {
      if (p.area_focus && String(p.area_focus).toLowerCase() !== 'uncategorized') {
        if (!map[p.area_focus]) {
          map[p.area_focus] = { focus: p.area_focus, count: 0, budget: 0, spent: 0 };
        }
        map[p.area_focus].count++;
        map[p.area_focus].budget += p.budget || 0;
        map[p.area_focus].spent += spendMap?.[p.project_code] || 0;
      }
    });
    return Object.values(map).sort((a, b) => b.budget - a.budget);
  }, [project.data, spendMap]);

  const activeStats = useMemo(() => {
    if (view === 'actual') return stats.map((s) => ({ ...s, budget: s.spent }));
    return stats;
  }, [stats, view]);

  const totalBudget = d3.sum(stats, (d) => d.budget);
  const totalSpent = d3.sum(stats, (d) => d.spent);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
      {/* View toggle */}
      <div className="flex bg-slate-100/50 dark:bg-dark-input/50 p-1 rounded-2xl border ...">
        <button onClick={() => setView('allocation')}>...</button>
        <button onClick={() => setView('actual')}>...</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <D3Donut data={activeStats} />
          <AreaFocusDetail stats={stats} view={view} />
        </div>
        <div className="lg:col-span-7">
          <BudgetAllocationList projects={project.data} spendMap={spendMap} view={view} />
        </div>
      </div>
    </div>
  );
}
```

**Key change from old version:** Uses `p.area_focus` and `p.project_code` instead of `p.focus` and `p.id` (old CSV transform renamed fields). Rename these to match your Supabase column names.

## 11.2 — D3Donut (`src/components/Overview/D3Donut.jsx`)

Creates a D3 donut chart with hover interaction:

```jsx
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { CHART_COLORS } from '../../constants';

export default function D3Donut({ data }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const isDark = document.documentElement.classList.contains('dark');
    const width = 280, height = 280, radius = Math.min(width, height) / 2;
    const arc = d3.arc().innerRadius(65).outerRadius(radius - 20);
    const pie = d3.pie().sort(null).value((d) => d.budget);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    g.selectAll('path')
      .data(pie(data))
      .enter().append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => CHART_COLORS[i % CHART_COLORS.length])
      .attr('stroke', isDark ? '#101010' : '#f8fafc')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('opacity', 0.8);
        // Show tooltip
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 1);
      });

    // Center text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '24px')
      .attr('font-weight', '900')
      .attr('fill', isDark ? '#d6def0' : '#1a1a1a')
      .text(d3.sum(data, (d) => d.budget) > 1000
        ? '₱' + (d3.sum(data, (d) => d.budget) / 1000).toFixed(1) + 'k'
        : '₱' + d3.sum(data, (d) => d.budget));
  }, [data]);

  return <svg ref={svgRef} width={280} height={280} className="mx-auto" />;
}
```

**Dark mode detection:** D3 doesn't reactively read Tailwind classes. The `isDark` check at render time uses `document.documentElement.classList.contains('dark')`. The chart only re-renders when `data` changes.

## 11.3 — AreaFocusDetail (`src/components/Overview/AreaFocusDetail.jsx`)

Renders a breakdown list of area focus items with budget bars. Same as old version but reads from typed `stats` objects.

## 11.4 — BudgetAllocationList (`src/components/Overview/BudgetAllocationList.jsx`)

Renders a sorted list of projects with budget vs. spend bars. Uses `project.name`, `project.budget`, `project.project_code` instead of old CSV row indexing.

---

## Next Step

Proceed to [`12-calendar.md`](12-calendar.md) to build the Calendar tab.
