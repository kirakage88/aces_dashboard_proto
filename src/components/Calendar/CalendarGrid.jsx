import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getStatusStyle } from '../../utils/project';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({ calendarDate, projects, onPrevMonth, onNextMonth, onDayClick, onProjectClick }) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayOfMonth = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

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

  const getProjectsForDay = (dayNum) => {
    return projectsWithDates.filter((p) => {
      if (!p.parsedDate) return false;
      return p.parsedDate.getDate() === dayNum &&
             p.parsedDate.getMonth() === month &&
             p.parsedDate.getFullYear() === year;
    });
  };

  return (
    <div className="lg:col-span-8 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-[2rem] md:rounded-[3rem] shadow-xl p-4 md:p-8 transition-colors">
      <div className="flex items-center justify-between mb-6 md:mb-8 flex-col md:flex-row gap-3">
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-dark-text tracking-tight transition-colors">Operations Calendar</h2>
        <div className="flex items-center bg-white dark:bg-dark-input border border-slate-200 dark:border-dark-border-md shadow-sm rounded-2xl p-1.5 gap-2 transition-colors">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-xl transition-all text-slate-600 dark:text-dark-muted"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <span className="font-black text-xs md:text-sm uppercase tracking-wider text-slate-800 dark:text-dark-text px-2 md:px-4 min-w-[120px] md:min-w-[140px] text-center transition-colors">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-xl transition-all text-slate-600 dark:text-dark-muted"
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 text-center">
        {DAY_HEADERS.map((day, idx) => (
          <div
            key={day}
            className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest py-1 md:py-2 transition-colors ${
              idx === 0 || idx === 6 ? 'text-slate-400 dark:text-dark-muted' : 'text-slate-500 dark:text-dark-muted'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square bg-slate-50/40 dark:bg-dark-input/40 rounded-xl md:rounded-2xl border border-slate-100/50 dark:border-dark-border/50 transition-colors" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dayProjects = getProjectsForDay(dayNum);

          return (
            <div
              key={`day-${dayNum}`}
              onClick={() => onDayClick(dayNum, month, year)}
              className="min-h-[80px] md:min-h-[140px] bg-slate-50 dark:bg-dark-input/50 hover:bg-white dark:hover:bg-dark-hover hover:border-[#efbf04] dark:hover:border-[#fbcc0e] hover:shadow-lg hover:shadow-[#efbf04]/5 dark:hover:shadow-[#fbcc0e]/5 cursor-pointer border border-slate-100 dark:border-dark-border-md rounded-xl md:rounded-3xl p-1.5 md:p-3 flex flex-col transition-all group"
            >
              <div className="flex justify-between items-start mb-1 md:mb-2">
                <span className="text-[10px] md:text-xs font-black text-slate-600 dark:text-dark-muted group-hover:text-[#550000] dark:group-hover:text-dark-accent group-hover:scale-110 transition-all">
                  {dayNum}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-100 dark:hover:bg-dark-hover rounded text-slate-400 dark:text-dark-muted hover:text-[#550000] dark:hover:text-dark-accent transition-all hidden md:block">
                  <Plus size={12} strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-1 overflow-y-auto mt-1 max-h-[50px] md:max-h-[110px] pr-1 custom-scrollbar">
                {dayProjects.slice(0, 3).map((proj) => (
                  <div
                    key={proj.index_}
                    onClick={(e) => {
                      e.stopPropagation();
                      onProjectClick(proj);
                    }}
                    className="text-[8px] md:text-[10px] font-bold p-1 md:p-2 rounded-lg md:rounded-xl bg-white dark:bg-dark-input border border-slate-100 dark:border-dark-border-md shadow-sm flex flex-col gap-0.5 md:gap-1 hover:border-[#efbf04] dark:hover:border-[#fbcc0e] transition-all"
                    style={{ borderLeft: `3px solid ${getStatusStyle(proj.status).color}` }}
                  >
                    <span className="truncate text-slate-800 dark:text-dark-text leading-tight transition-colors">{proj.name}</span>
                    <div className="items-center justify-between hidden md:flex">
                      <span className="text-[8px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-tighter transition-colors">
                        {proj.status}
                      </span>
                      <span className="text-[8px] font-black text-[#efbf04] dark:text-[#fbcc0e]">
                        ₱{proj.budget > 0 ? (proj.budget / 1000).toFixed(1) + 'k' : '0'}
                      </span>
                    </div>
                  </div>
                ))}
                {dayProjects.length > 3 && (
                  <div className="text-[7px] md:text-[8px] font-black text-[#550000] text-center">
                    +{dayProjects.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
