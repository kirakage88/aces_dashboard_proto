import { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { PieChart as PieChartIcon, TrendingDown } from 'lucide-react';
import D3Donut from '../components/Overview/D3Donut';
import AreaFocusDetail from '../components/Overview/AreaFocusDetail';
import BudgetAllocationList from '../components/Overview/BudgetAllocationList';
import { transformProjects } from '../utils/project';

export default function OverviewTab({ project, spendMap }) {
  const [view, setView] = useState('allocation');

  const projects = useMemo(() => transformProjects(project.data), [project.data]);

  const stats = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      if (p.focus && String(p.focus).toLowerCase() !== 'uncategorized') {
        if (!map[p.focus]) map[p.focus] = { focus: p.focus, count: 0, budget: 0, spent: 0 };
        map[p.focus].count++;
        map[p.focus].budget += p.budget;
        map[p.focus].spent += spendMap?.[p.id] || 0;
      }
    });
    return Object.values(map).sort((a, b) => b.budget - a.budget);
  }, [projects, spendMap]);

  const activeStats = useMemo(() => {
    if (view === 'actual') {
      return stats.map((s) => ({ ...s, budget: s.spent }));
    }
    return stats;
  }, [stats, view]);

  const totalBudget = d3.sum(stats, (d) => d.budget);
  const totalSpent = d3.sum(stats, (d) => d.spent);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/40">
          <button
            onClick={() => setView('allocation')}
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all flex items-center gap-2 ${
              view === 'allocation'
                ? 'bg-white text-[#550000] shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <PieChartIcon size={14} strokeWidth={3} /> Allocation
          </button>
          <button
            onClick={() => setView('actual')}
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all flex items-center gap-2 ${
              view === 'actual'
                ? 'bg-white text-[#550000] shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingDown size={14} strokeWidth={3} /> Actual Spent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="bg-[#550000]/5 p-1.5 md:p-2 rounded-xl text-[#550000]">
                <PieChartIcon size={16} />
              </div>
              <h3 className="font-black text-slate-900 tracking-tight text-sm md:text-base">
                {view === 'allocation' ? 'Focus Allocation' : 'Actual Spend'}
              </h3>
            </div>
            <D3Donut data={activeStats} />
            <div className="grid grid-cols-1 gap-4 mt-6 md:mt-8">
              <div className="bg-[#550000]/5 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-[#550000]/10 flex justify-between items-center">
                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {view === 'allocation' ? 'Global Budget' : 'Total Spent'}
                </span>
                <span className="text-xl md:text-2xl font-black text-[#550000]">
                  ₱{(view === 'allocation' ? totalBudget : totalSpent).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <AreaFocusDetail stats={stats} view={view} />
        </div>

        <div className="lg:col-span-7">
          <BudgetAllocationList projects={projects} spendMap={spendMap} view={view} />
        </div>
      </div>
    </div>
  );
}
