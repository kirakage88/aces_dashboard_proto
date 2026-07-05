import { useState, useMemo, lazy, Suspense } from 'react';
import { FileText } from 'lucide-react';
import KanbanBoard from '../components/Tracker/KanbanBoard';
import { transformProjects } from '../utils/project';

const TemplateManager = lazy(() => import('../components/Tracker/TemplateManager'));
const ProjectDetailPage = lazy(() => import('../components/Tracker/ProjectDetailPage'));

export default function ProjectsTab({ project, spendMap }) {
  const [detailProject, setDetailProject] = useState(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const projects = useMemo(() => transformProjects(project.data), [project.data]);

  const handleEdit = (proj) => {
    setDetailProject(proj);
  };

  const handleClose = () => {
    setDetailProject(null);
  };

  const handleSave = (index_, payload) => {
    if (index_ != null) {
      project.updateItem(index_, payload);
    } else {
      project.insertItem(index_, payload);
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
        />
      </Suspense>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h2 className="text-lg font-black text-[#550000] tracking-tight">Projects</h2>
        <button
          onClick={() => setTemplatesOpen(true)}
          className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400 dark:text-dark-muted tracking-widest hover:text-[#550000] dark:hover:text-dark-accent transition-colors"
        >
          <FileText size={14} />
          Templates
        </button>
      </div>
      <KanbanBoard
        projects={projects}
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
