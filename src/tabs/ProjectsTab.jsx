import { useState, useMemo } from 'react';
import KanbanBoard from '../components/Tracker/KanbanBoard';
import ProjectModal from '../components/Tracker/ProjectModal';
import { transformProjects } from '../utils/project';

export default function ProjectsTab({ project, spendMap }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const projects = useMemo(() => transformProjects(project.data), [project.data]);

  const handleEdit = (proj) => {
    setEditingItem(proj);
    setIsModalOpen(true);
  };

  const handleSave = (index_, payload) => {
    if (index_ != null) {
      project.updateItem(index_, payload);
    } else {
      project.insertItem(index_, payload);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col">
      <KanbanBoard
        projects={projects}
        updateItem={project.updateItem}
        deleteItem={project.deleteItem}
        insertItem={project.insertItem}
        moveItem={project.moveItem}
        onEdit={handleEdit}
        spendMap={spendMap}
      />
      {isModalOpen && (
        <ProjectModal
          editingItem={editingItem}
          onSave={handleSave}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          projectData={project.data}
        />
      )}
    </div>
  );
}
