import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { generateProjectCode } from '../../utils/project';

const COLUMNS = ['Not Started', 'In Progress', 'Post-Docs', 'Done'];
const FOCUS_AREAS = [
  'Organizational Development',
  'Student Services and Formation',
  'Community Involvement',
];

export default function ProjectModal({ editingItem, onSave, onClose, projectData }) {
  const isEditing = editingItem?.index_ != null;

  const [selectedDate, setSelectedDate] = useState(editingItem?.date || '');

  const nextCode = useMemo(
    () => generateProjectCode(projectData, selectedDate),
    [projectData, selectedDate]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = [
      fd.get('id'), fd.get('name'), fd.get('head'), fd.get('focus'),
      fd.get('date'), fd.get('status'), undefined, fd.get('budget'), fd.get('notes'),
    ];
    onSave(editingItem?.index_, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#550000]/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center">
      <div className="bg-white dark:bg-dark-card rounded-t-[3rem] md:rounded-[3rem] shadow-2xl w-full max-w-xl max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom md:zoom-in duration-200 transition-colors">
        <div className="px-6 md:px-10 py-5 md:py-8 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-input/50 shrink-0 transition-colors">
          <h3 className="text-lg md:text-xl font-black text-[#550000] tracking-tight">
            {isEditing ? 'Edit Project' : 'New Audit Project'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-dark-hover rounded-full transition-all text-slate-400 dark:text-dark-muted">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 md:p-10 space-y-5 md:space-y-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-muted tracking-widest transition-colors">
                  Project Code
                </label>
                <input
                  name="id"
                  value={isEditing ? editingItem.id : nextCode}
                  readOnly
                  className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-200 dark:bg-dark-hover border border-slate-200 dark:border-dark-border-md rounded-2xl outline-none font-bold text-sm cursor-not-allowed text-slate-800 dark:text-dark-text transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-muted tracking-widest transition-colors">
                  Phase
                </label>
                <select
                  name="status"
                  defaultValue={editingItem?.status}
                  className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-100/50 dark:bg-dark-input/50 border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/5 focus:border-[#550000] outline-none font-bold text-sm text-slate-800 dark:text-dark-text transition-colors"
                >
                  {COLUMNS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-muted tracking-widest transition-colors">
                Project Name
              </label>
              <input
                name="name"
                defaultValue={editingItem?.name}
                required
                className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-100/50 dark:bg-dark-input/50 border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/5 focus:border-[#550000] outline-none font-bold text-sm text-slate-800 dark:text-dark-text transition-colors"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-muted tracking-widest transition-colors">
                  Project Head
                </label>
                <input
                  name="head"
                  defaultValue={editingItem?.head}
                  className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-100/50 dark:bg-dark-input/50 border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/5 focus:border-[#550000] outline-none font-bold text-sm text-slate-800 dark:text-dark-text transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-muted tracking-widest transition-colors">
                  Area Focus
                </label>
                <select
                  name="focus"
                  defaultValue={editingItem?.focus}
                  className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-100/50 dark:bg-dark-input/50 border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/5 focus:border-[#550000] outline-none font-bold text-sm text-slate-800 dark:text-dark-text transition-colors"
                >
                  <option value="">Select focus...</option>
                  {FOCUS_AREAS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-muted tracking-widest transition-colors">
                  Budget (₱)
                </label>
                <input
                  name="budget"
                  defaultValue={editingItem?.budget}
                  className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-100/50 dark:bg-dark-input/50 border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/5 focus:border-[#550000] outline-none font-bold text-sm text-slate-800 dark:text-dark-text transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-muted tracking-widest transition-colors">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={editingItem?.date}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-100/50 dark:bg-dark-input/50 border border-slate-200 dark:border-dark-border-md rounded-2xl focus:ring-4 focus:ring-[#550000]/5 focus:border-[#550000] outline-none font-bold text-sm text-slate-800 dark:text-dark-text transition-colors"
                />
              </div>
            </div>
          </div>
          <div className="px-6 md:px-10 py-5 md:py-6 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-input/50 flex gap-4 shrink-0 transition-colors">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 md:py-4 font-black text-slate-400 dark:text-dark-muted hover:text-slate-600 dark:hover:text-gray-300 text-sm transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-[2] bg-[#550000] text-[#efbf04] dark:text-[#fbcc0e] px-8 md:px-12 py-3.5 md:py-4 rounded-[2rem] font-black text-sm shadow-xl shadow-[#550000]/20"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
