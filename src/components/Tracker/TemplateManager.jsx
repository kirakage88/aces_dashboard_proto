import { useState } from 'react';
import { X, Plus, Pencil, Trash2, Star, ArrowLeft } from 'lucide-react';
import { useCreateBlockNote, BlockNoteViewRaw } from '@blocknote/react';
import '@blocknote/react/style.css';
import { getTemplates, saveTemplate, deleteTemplate, setDefaultTemplate } from '../../utils/templates';

function TemplateEditor({ template, onSaved, onBack, onClose }) {
  const [name, setName] = useState(template.name);
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const editor = useCreateBlockNote({
    initialContent: template.content || [],
    defaultStyles: false,
  });

  const handleSave = () => {
    const content = editor.document;
    saveTemplate({ ...template, name, content });
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-[#550000]/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center">
      <div className="bg-white dark:bg-dark-card rounded-t-[3rem] md:rounded-[3rem] shadow-2xl w-[95vw] md:w-[90vw] max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 md:px-10 py-4 md:py-5 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-input/50 shrink-0">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-dark-muted hover:text-[#550000] dark:hover:text-dark-accent transition-colors">
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="bg-[#550000] text-[#efbf04] dark:text-[#fbcc0e] px-5 md:px-8 py-2 rounded-[2rem] font-black text-sm shadow-lg shadow-[#550000]/20 hover:opacity-90 transition-opacity"
            >
              Save Template
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-dark-hover rounded-full transition-all text-slate-400 dark:text-dark-muted">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="px-6 md:px-10 py-4 border-b border-slate-100 dark:border-dark-border">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name..."
            className="w-full bg-transparent p-0 font-black text-lg text-slate-800 dark:text-dark-text outline-none placeholder:text-slate-300 dark:placeholder:text-dark-muted"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-4 min-h-[300px] [&_.bn-editor]:outline-none">
          <BlockNoteViewRaw editor={editor} theme={isDark ? 'dark' : 'light'} />
        </div>
      </div>
    </div>
  );
}

export default function TemplateManager({ onClose }) {
  const [templates, setTemplatesList] = useState(() => getTemplates());
  const [editing, setEditing] = useState(null);
  const defaultId = localStorage.getItem('aces_default_template_id');

  const refresh = () => setTemplatesList(getTemplates());

  const handleCreate = () => {
    setEditing({ id: null, name: 'New Template', content: [] });
  };

  const handleEdit = (tmpl) => {
    setEditing(tmpl);
  };

  const handleDelete = (id) => {
    deleteTemplate(id);
    refresh();
  };

  const handleSetDefault = (id) => {
    setDefaultTemplate(id);
    refresh();
  };

  if (editing) {
    return (
      <TemplateEditor
        template={editing}
        onSaved={() => { refresh(); setEditing(null); }}
        onBack={() => setEditing(null)}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#550000]/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center">
      <div className="bg-white dark:bg-dark-card rounded-t-[3rem] md:rounded-[3rem] shadow-2xl w-[95vw] md:w-[90vw] max-w-[700px] max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-6 md:px-10 py-5 md:py-6 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-input/50 shrink-0">
          <h3 className="text-lg md:text-xl font-black text-[#550000] tracking-tight">Template Manager</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-dark-hover rounded-full transition-all text-slate-400 dark:text-dark-muted">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-3">
          {templates.length === 0 && (
            <p className="text-sm font-bold text-slate-400 dark:text-dark-muted text-center py-10">No templates yet. Create one below.</p>
          )}
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-hover/30 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 dark:text-dark-text truncate">{tmpl.name}</p>
                {defaultId === tmpl.id && (
                  <span className="text-[10px] font-black uppercase text-[#efbf04] dark:text-[#fbcc0e] tracking-widest">Default</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleSetDefault(tmpl.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-xl text-slate-400 dark:text-dark-muted hover:text-[#efbf04] transition-colors" title="Set as default">
                  <Star size={16} />
                </button>
                <button onClick={() => handleEdit(tmpl)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-xl text-slate-400 dark:text-dark-muted hover:text-blue-600 transition-colors" title="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(tmpl.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-slate-400 dark:text-dark-muted hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 md:px-10 py-5 md:py-6 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-input/50 shrink-0">
          <button
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 py-3.5 font-black text-sm text-[#550000] dark:text-dark-accent border-2 border-dashed border-slate-300 dark:border-dark-border-md rounded-[2rem] hover:bg-slate-100 dark:hover:bg-dark-hover transition-colors"
          >
            <Plus size={16} />
            New Template
          </button>
        </div>
      </div>
    </div>
  );
}
