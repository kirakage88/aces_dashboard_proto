import { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import ProjectCard from './ProjectCard';
import DroppableZone from './DroppableZone';
import { buildKanbanBoard, getStatusStyle } from '../../utils/project';

export default function KanbanBoard({ projects, updateItem, deleteItem, insertItem, moveItem, onEdit, spendMap }) {
  const [activeDragId, setActiveDragId] = useState(null);

  const { columns, board } = useMemo(() => buildKanbanBoard(projects), [projects]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    if (columns.includes(overId)) {
      const proj = projects.find((p) => p.index_ === activeId);
      if (proj && proj.status !== overId) {
        updateItem(activeId, [undefined, undefined, undefined, undefined, undefined, overId]);
      }
    } else {
      const overIndex = Number(overId);
      if (activeId !== overIndex) {
        moveItem(activeId, overIndex);
      }
    }
  };

  const activeProject = activeDragId
    ? projects.find((p) => p.index_ === Number(activeDragId))
    : null;

  return (
    <>
      <div className="flex items-start md:items-center justify-between mb-6 md:mb-8 max-w-[1400px] mx-auto w-full flex-col md:flex-row gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Active Pipeline</h2>
          <p className="text-slate-400 font-bold text-xs md:text-sm">Drag items to update operational status</p>
        </div>
        <button
          onClick={() => onEdit({})}
          className="w-full md:w-auto bg-[#550000] text-[#efbf04] px-6 md:px-8 py-3.5 md:py-4 rounded-3xl font-black text-xs md:text-sm flex items-center justify-center gap-3 shadow-2xl shadow-[#550000]/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={3} /> Initiate Project
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-8 custom-scrollbar">
        <div className="text-[10px] text-slate-400 font-bold text-center mb-2 lg:hidden">← Swipe to see more columns →</div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={(e) => setActiveDragId(e.active.id)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 md:gap-8 h-full min-w-max">
            {columns.map((col) => (
              <div
                key={col}
                className="w-[300px] md:w-[360px] flex flex-col bg-slate-100/50 rounded-[2.5rem] border border-slate-200/40"
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getStatusStyle(col).color }}
                    />
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">
                      {col}
                    </h3>
                  </div>
                  <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-slate-500 shadow-sm border border-slate-100">
                    {board[col].length}
                  </span>
                </div>
                <DroppableZone id={col}>
                  <SortableContext
                    items={board[col].map((p) => p.index_.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    {board[col].map((p) => (
                      <ProjectCard
                        key={p.index_}
                        project={p}
                        onEdit={(proj) => onEdit(proj)}
                        onDelete={deleteItem}
                        spendMap={spendMap}
                      />
                    ))}
                  </SortableContext>
                </DroppableZone>
              </div>
            ))}
          </div>
          {typeof document !== 'undefined' &&
            ReactDOM.createPortal(
              <DragOverlay>
                {activeProject ? (
                  <div className="bg-white p-5 rounded-3xl border-2 border-[#efbf04] shadow-2xl w-[320px] scale-105 rotate-3 opacity-90">
                    <h4 className="font-black text-slate-900">{activeProject.name}</h4>
                  </div>
                ) : null}
              </DragOverlay>,
              document.body,
            )}
        </DndContext>
      </div>
    </>
  );
}
