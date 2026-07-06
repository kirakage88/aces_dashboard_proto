# Phase 10: Project Detail & Templates

> **Goal:** Build the full-page project editor with BlockNote WYSIWYG, property fields, and the template management system.

---

## 10.1 — ProjectDetailPage (`src/components/Tracker/ProjectDetailPage.jsx`)

This is a full-page (not modal) editor for a single project.

**Props:**
- `editingItem` — the project object (null for new projects)
- `onSave(id, payload)` — called on save
- `onClose()` — return to Kanban
- `projectData` — all projects (for code generation)
- `templates` — available templates

**BlockNote Integration:**

```jsx
import { useCreateBlockNote, BlockNoteViewRaw } from '@blocknote/react';
import '@blocknote/react/style.css';

// Inside component:
const editor = useCreateBlockNote({
  initialContent: editingItem?.details || defaultTemplate?.content || undefined,
  defaultStyles: false, // important: avoid style conflicts with Tailwind
});
```

**Property fields controlled by state:**
- `name`, `head`, `focus`, `date`, `status`, `budget`
- `project_code` (auto-generated or manual)

**Save handler:**

```jsx
const handleSave = async () => {
  const blocks = await editor.document;
  const payload = {
    project_code: code,
    name,
    head,
    area_focus: focus,
    implementation_date: date || null,
    status,
    details: blocks,     // BlockNote JSON
    budget: parseFloat(budget) || 0,
  };
  await onSave(editingItem?.id, payload);
  onClose();
};
```

**Key change from old version:** `editingItem?.details` is already a JavaScript object/array (from `JSONB`), no need for `JSON.parse()`. But BlockNote expects the same format, so pass it directly as `initialContent`.

## 10.2 — ProjectDetailModal (`src/components/Tracker/ProjectDetailModal.jsx`)

Same editor as ProjectDetailPage but rendered in a modal (used from Calendar tab). Lazy-loaded.

```jsx
// Same BlockNote editor, same property fields
// Wrapped in a full-screen modal overlay
// Accepts same props: editingItem, onSave, onClose
```

## 10.3 — TemplateManager (`src/components/Tracker/TemplateManager.jsx`)

Modal for managing BlockNote templates:

```jsx
import { useState, useEffect } from 'react';
import { getTemplates, deleteTemplate, setDefaultTemplate } from '../../utils/templates';

export default function TemplateManager({ onClose }) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  // Renders template list with:
  // - Template name
  // - "Set as Default" toggle
  // - Edit button → opens BlockNote editor inline
  // - Delete button
  // - "New Template" button → opens empty BlockNote editor
}
```

**Key change from old version:** Template functions are now async (they query Supabase). Components that call them must use `await` or `.then()`.

## 10.4 — StatusBadge (`src/components/shared/StatusBadge.jsx`)

```jsx
import { getStatusStyle } from '../../utils/project';

export default function StatusBadge({ status }) {
  const style = getStatusStyle(status);
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" 
          style={{ color: style.color, backgroundColor: style.bg }}>
      {status || 'Unknown'}
    </span>
  );
}
```

Unchanged from the old version — it only depends on the `getStatusStyle` utility.

---

## Next Step

Proceed to [`11-overview-charts.md`](11-overview-charts.md) to build the Overview tab with D3 charts.
