# Phase 9: Kanban Board & Projects Tab

> **Goal:** Build the Projects tab with drag-and-drop Kanban board, project cards, and status management.

---

## 9.1 — Projects Tab (`src/tabs/ProjectsTab.jsx`)

```jsx
import { useState, useMemo, lazy, Suspense } from 'react';
import { FileText } from 'lucide-react';
import KanbanBoard from '../components/Tracker/KanbanBoard';
import { buildKanbanBoard } from '../utils/project';

const TemplateManager = lazy(() => import('../components/Tracker/TemplateManager'));
const ProjectDetailPage = lazy(() => import('../components/Tracker/ProjectDetailPage'));

export default function ProjectsTab({ project, spendMap }) {
  const [detailProject, setDetailProject] = useState(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const board = useMemo(() => buildKanbanBoard(project.data), [project.data]);

  const handleEdit = (proj) => setDetailProject(proj);
  const handleClose = () => setDetailProject(null);

  const handleSave = async (id, payload) => {
    if (id != null) {
      await project.updateItem(id, payload);
    } else {
      await project.insertItem(payload);
    }
  };

  if (detailProject !== null) {
    return (
      <Suspense fallback={null}>
        <ProjectDetailPage
          editingItem={detailProject}
          onSave={handleSave}
          onClose={handleClose}
          projectData={project.data}
          templates={templates}
        />
      </Suspense>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-lg font-black text-[#550000] tracking-tight">Projects</h2>
        <button onClick={() => setTemplatesOpen(true)}
          className="flex items-center gap-2 text-[11px] font-black uppercase 
                     text-slate-400 dark:text-dark-muted tracking-widest 
                     hover:text-[#550000] dark:hover:text-dark-accent transition-colors">
          <FileText size={14} /> Templates
        </button>
      </div>
      <KanbanBoard
        board={board}
        updateItem={project.updateItem}
        deleteItem={project.deleteItem}
        insertItem={project.insertItem}
        moveItem={project.moveItem}
        onEdit={handleEdit}
        spendMap={spendMap}
      />
      {templatesOpen && (
        <Suspense fallback={null}>
          <TemplateManager onClose={() => setTemplatesOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
```

**Key change from old version:** `transformProjects()` is no longer called — `project.data` already contains typed objects.

## 9.2 — KanbanBoard (`src/components/Tracker/KanbanBoard.jsx`)

Uses `@dnd-kit` for drag-and-drop. The 4 columns map to project statuses.

```jsx
import { useState, useCallback } from 'react';
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DroppableZone from './DroppableZone';
import ProjectCard from './ProjectCard';

const COLUMN_META = {
  'Not Started': { label: 'Not Started', color: '#94a3b8' },
  'In Progress': { label: 'In Progress', color: '#efbf04' },
  'Post-Docs':  { label: 'Post-Docs', color: '#550000' },
  'Done':        { label: 'Done', color: '#10b981' },
};

export default function KanbanBoard({ board, updateItem, deleteItem, moveItem, onEdit, spendMap }) {
  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const id = active.id;
    // Find card across all columns
    for (const col of Object.keys(board.board)) {
      const card = board.board[col].find((p) => String(p.id) === id);
      if (card) { setActiveCard(card); break; }
    }
  }, [board]);

  const handleDragEnd = useCallback((event) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Determine source and destination columns
    let sourceCol, targetCol, card;
    for (const col of Object.keys(board.board)) {
      card = board.board[col].find((p) => String(p.id) === activeId);
      if (card) { sourceCol = col; break; }
    }

    // If dropped on another column zone
    if (Object.keys(COLUMN_META).includes(overId)) {
      targetCol = overId;
    } else {
      // Dropped on another card — find its column
      for (const col of Object.keys(board.board)) {
        if (board.board[col].find((p) => String(p.id) === overId)) {
          targetCol = col; break;
        }
      }
    }

    if (sourceCol && targetCol && sourceCol !== targetCol) {
      // Update status in Supabase
      updateItem(card.id, { status: targetCol });
    }
  }, [board, updateItem]);

  return (
    <div className="flex-1 flex gap-4 md:gap-6 overflow-x-auto pb-4">
      <DndContext sensors={sensors} collisionDetection={closestCorners}
                  onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {board.columns.map((col) => {
          const items = board.board[col] || [];
          const meta = COLUMN_META[col];
          return (
            <DroppableZone key={col} id={col} label={meta.label} color={meta.color} count={items.length}>
              <SortableContext items={items.map((p) => String(p.id))} strategy={verticalListSortingStrategy}>
                {items.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => onEdit(project)}
                    onDelete={() => deleteItem(project.id)}
                    spend={spendMap?.[project.project_code] || 0}
                  />
                ))}
              </SortableContext>
            </DroppableZone>
          );
        })}
        <DragOverlay>
          {activeCard ? <ProjectCard project={activeCard} spend={0} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
```

## 9.3 — DroppableZone (`src/components/Tracker/DroppableZone.jsx`)

```jsx
import { useDroppable } from '@dnd-kit/core';

export default function DroppableZone({ id, label, color, count, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className={`flex-1 min-w-[260px] md:min-w-[280px] max-w-[320px] 
      bg-slate-50/50 dark:bg-dark-card/50 rounded-[1.5rem] p-3 md:p-4 
      border border-slate-100 dark:border-dark-border transition-colors
      ${isOver ? 'ring-2 ring-[#550000]/30 dark:ring-dark-accent/30' : ''}`}>
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-black text-slate-500 dark:text-dark-muted uppercase tracking-widest">
          {label}
        </span>
        <span className="text-[10px] font-bold text-slate-400 dark:text-dark-muted ml-auto">{count}</span>
      </div>
      {children}
    </div>
  );
}
```

## 9.4 — ProjectCard (`src/components/Tracker/ProjectCard.jsx`)

```jsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import { getStatusStyle } from '../../utils/project';
import StatusBadge from '../shared/StatusBadge';

export default function ProjectCard({ project, onEdit, onDelete, spend, isDragOverlay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: String(project.id), disabled: isDragOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const pct = project.budget > 0 ? Math.min((spend / project.budget) * 100, 100) : 0;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="bg-white dark:bg-dark-card rounded-xl p-3 md:p-4 mb-2 
                 border border-slate-100 dark:border-dark-border 
                 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing
                 group relative"
      onClick={onEdit}>
      {/* Progress bar (spend vs budget) */}
      {project.budget > 0 && (
        <div className="h-1 bg-slate-100 dark:bg-dark-input rounded-full mb-2 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
               style={{ width: `${pct}%`, backgroundColor: pct > 100 ? '#ef4444' : '#550000' }} />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-[#550000] dark:text-dark-accent mb-0.5 truncate">
            {project.project_code}
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-dark-text truncate">
            {project.name}
          </p>
          {project.head && (
            <p className="text-[10px] text-slate-400 dark:text-dark-muted mt-0.5">{project.head}</p>
          )}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 
                     rounded-lg transition-all text-slate-400 hover:text-red-500">
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <StatusBadge status={project.status} />
        {project.budget > 0 && (
          <span className="text-[10px] font-bold text-slate-400 dark:text-dark-muted">
            ₱{(project.budget).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
```

**Key change from old version:** Uses `project.project_code`, `project.name`, `project.head` instead of `project.row[0]`, `project.row[1]`, etc.

---

## Next Step

Proceed to [`10-project-detail-templates.md`](10-project-detail-templates.md) to build the BlockNote editor and template system.
