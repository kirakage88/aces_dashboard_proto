import { useState, useMemo, useSyncExternalStore } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useCreateBlockNote, BlockNoteViewRaw } from '@blocknote/react';
import '@blocknote/react/style.css';
import { generateProjectCode } from '../../utils/project';
import { getDefaultTemplate } from '../../utils/templates';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Post-Docs', 'Done'];
const FOCUS_AREAS = [
  'Organizational Development',
  'Student Services and Formation',
  'Community Involvement',
];

function defaultContent() {
  return getDefaultTemplate().content;
}

function PropertyRow({ label, children }) {
  return (
    <div className="grid grid-cols-[120px_1fr] border-b border-slate-100 dark:border-dark-border last:border-b-0">
      <div className="px-4 py-2.5 text-[11px] font-bold text-slate-500 dark:text-dark-muted border-r border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-hover/30 flex items-center">
        {label}
      </div>
      <div className="px-4 py-2.5 flex items-center">
        {children}
      </div>
    </div>
  );
}

export default function ProjectDetailPage({ editingItem, onSave, onClose, projectData }) {
  const isEditing = editingItem?.index_ != null;
  const [propsOpen, setPropsOpen] = useState(true);

  const [name, setName] = useState(editingItem?.name || '');
  const [head, setHead] = useState(editingItem?.head || '');
  const [focus, setFocus] = useState(editingItem?.focus || '');
  const [date, setDate] = useState(editingItem?.date || '');
  const [status, setStatus] = useState(editingItem?.status || 'Not Started');
  const [budget, setBudget] = useState(editingItem?.budget ? String(editingItem.budget) : '');

  const nextCode = useMemo(
    () => generateProjectCode(projectData, date),
    [projectData, date]
  );

  const isDark = useSyncExternalStore(
    (cb) => {
      const observer = new MutationObserver(cb);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains('dark')
  );

  const editor = useCreateBlockNote({
    initialContent: isEditing && editingItem.details
      ? editingItem.details
      : defaultContent(),
    defaultStyles: false,
  });

  const handleSubmit = () => {
    const detailsJSON = JSON.stringify(editor.document);
    const payload = [
      isEditing ? editingItem.id : nextCode,
      name,
      head,
      focus,
      date,
      status,
      detailsJSON,
      budget,
      '',
    ];
    onSave(editingItem?.index_, payload);
    onClose();
  };

  const handleResetTemplate = () => {
    const ids = editor.document.map((b) => b.id);
    if (ids.length > 0) {
      editor.replaceBlocks(ids, defaultContent());
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-dark-bg">
      <div className="px-4 md:px-8 py-3 md:py-4 border-b border-slate-100 dark:border-dark-border bg-white dark:bg-dark-card flex items-center gap-4 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-dark-muted hover:text-[#550000] dark:hover:text-dark-accent transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="hidden md:inline">Back</span>
        </button>

        <div className="flex-1" />

        <button
          onClick={handleSubmit}
          className="bg-[#550000] text-[#efbf04] dark:text-[#fbcc0e] px-5 md:px-8 py-2 rounded-[2rem] font-black text-sm shadow-lg shadow-[#550000]/20 hover:opacity-90 transition-opacity"
        >
          Save Record
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="shrink-0 mb-4">
            <div className="flex items-center justify-between py-3">
              <button
                onClick={() => setPropsOpen((v) => !v)}
                className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 dark:text-dark-muted tracking-widest hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors rounded-xl px-2 py-1"
              >
                {propsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Properties
              </button>
              <button
                onClick={handleResetTemplate}
                className="text-[11px] font-bold text-slate-400 dark:text-dark-muted hover:text-[#550000] dark:hover:text-dark-accent transition-colors"
              >
                Reset template
              </button>
            </div>
            {propsOpen && (
              <div className="pb-4">
                <div className="border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden text-sm">
                  <PropertyRow label="Project Code">
                    <input
                      value={isEditing ? editingItem.id : nextCode}
                      readOnly
                      className="w-full bg-transparent p-0 font-bold text-slate-800 dark:text-dark-text outline-none cursor-not-allowed"
                    />
                  </PropertyRow>
                  <PropertyRow label="Status">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-transparent p-0 appearance-none font-bold text-slate-800 dark:text-dark-text outline-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </PropertyRow>
                  <PropertyRow label="Project Title">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter project title..."
                      className="w-full bg-transparent p-0 font-bold text-slate-800 dark:text-dark-text outline-none placeholder:text-slate-300 dark:placeholder:text-dark-muted"
                    />
                  </PropertyRow>
                  <PropertyRow label="Project Head">
                    <input
                      value={head}
                      onChange={(e) => setHead(e.target.value)}
                      placeholder="Name of project leader..."
                      className="w-full bg-transparent p-0 font-bold text-slate-800 dark:text-dark-text outline-none placeholder:text-slate-300 dark:placeholder:text-dark-muted"
                    />
                  </PropertyRow>
                  <PropertyRow label="Area Focus">
                    <select
                      value={focus}
                      onChange={(e) => setFocus(e.target.value)}
                      className="w-full bg-transparent p-0 appearance-none font-bold text-slate-800 dark:text-dark-text outline-none"
                    >
                      <option value="">Select focus...</option>
                      {FOCUS_AREAS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </PropertyRow>
                  <PropertyRow label="Budget">
                    <input
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="₱0.00"
                      className="w-full bg-transparent p-0 font-bold text-slate-800 dark:text-dark-text outline-none placeholder:text-slate-300 dark:placeholder:text-dark-muted"
                    />
                  </PropertyRow>
                  <PropertyRow label="Date">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-transparent p-0 font-bold text-slate-800 dark:text-dark-text outline-none"
                    />
                  </PropertyRow>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-dark-border pt-4 [&_.bn-editor]:outline-none">
            <BlockNoteViewRaw
              editor={editor}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
