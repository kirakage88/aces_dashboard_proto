import { useState, useMemo, lazy, Suspense } from 'react';
import CalendarGrid from '../components/Calendar/CalendarGrid';
import UnscheduledPanel from '../components/Calendar/UnscheduledPanel';
import { transformProjects } from '../utils/project';

const ProjectDetailModal = lazy(() => import('../components/Tracker/ProjectDetailModal'));

export default function CalendarTab({ project, spendMap }) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const projects = useMemo(() => transformProjects(project.data), [project.data]);

  const projectsWithDates = useMemo(() => {
    return projects.map((p) => {
      let parsedDate = null;
      if (p.date) {
        const str = String(p.date).trim();
        const parts = str.split('/');
        if (parts.length === 3) {
          const [m, d, y] = parts.map((v) => parseInt(v, 10));
          parsedDate = new Date(y, m - 1, d);
        } else {
          const d = new Date(str);
          if (!isNaN(d.getTime())) parsedDate = d;
        }
      }
      return { ...p, parsedDate };
    });
  }, [projects]);

  const unscheduledProjects = useMemo(() => {
    return projectsWithDates.filter((p) => !p.parsedDate);
  }, [projectsWithDates]);

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dayNum, month, year) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const selectedDate = `${year}-${formattedMonth}-${formattedDay}`;
    setEditingItem({ date: selectedDate });
    setIsModalOpen(true);
  };

  const handleProjectClick = (proj) => {
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
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <CalendarGrid
          calendarDate={calendarDate}
          projects={projects}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDayClick={handleDayClick}
          onProjectClick={handleProjectClick}
        />
        <UnscheduledPanel
          unscheduledProjects={unscheduledProjects}
          onProjectClick={handleProjectClick}
        />
      </div>
      {isModalOpen && (
        <Suspense fallback={null}>
          <ProjectDetailModal
            editingItem={editingItem}
            onSave={handleSave}
            onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
            projectData={project.data}
          />
        </Suspense>
      )}
    </div>
  );
}
