import { useDroppable } from '@dnd-kit/core';

export default function DroppableZone({ id, children }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex-1 px-4 pb-6 overflow-y-auto scrollbar-hide">
      {children}
    </div>
  );
}
