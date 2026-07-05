import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, Calendar, Edit3, Trash2 } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import { parseCurrency } from '../../utils/project';

export default function ProjectCard({ project, onEdit, onDelete, spendMap }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: project.index_.toString() });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const budget = parseCurrency(project.budget);
  const spent = spendMap?.[project.id] || 0;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-dark-card p-5 rounded-[2rem] border border-slate-100 dark:border-dark-border shadow-sm mb-4 group hover:shadow-xl hover:shadow-[#550000]/5 dark:hover:shadow-black/30 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3" {...attributes} {...listeners}>
        <span className="text-[9px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-widest bg-slate-50 dark:bg-dark-input px-2 py-0.5 rounded-full transition-colors">
          {project.id || 'N/A'}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(project); }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-lg text-slate-400 dark:text-dark-muted hover:text-blue-600 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project.index_); }}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-slate-400 dark:text-dark-muted hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <h4 className="font-black text-slate-900 dark:text-dark-text leading-tight mb-3 text-sm pr-4 transition-colors">{project.name}</h4>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#550000]">
            <div className="p-1.5 bg-[#550000]/5 rounded-lg"><User size={12} /></div>
            <span className="truncate">{project.head || 'No Lead Assigned'}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-dark-muted transition-colors">
            <div className="p-1.5 bg-slate-50 dark:bg-dark-input rounded-lg"><Calendar size={12} /></div>
            <span>{project.date || 'Unscheduled'}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-dark-border">
          <div className="text-[10px] font-black text-[#efbf04] dark:text-[#fbcc0e]">
            ₱{budget.toLocaleString()}
          </div>
          <StatusBadge status={project.status} />
        </div>
        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-dark-border">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-dark-muted mb-1 transition-colors">
            <span>Spent: ₱{spent.toLocaleString()}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-dark-hover h-2 rounded-full overflow-hidden transition-colors">
            <div
              className="bg-[#efbf04] dark:bg-[#fbcc0e] h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
