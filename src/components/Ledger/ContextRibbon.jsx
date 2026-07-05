import { Calendar, Clock, User, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ContextRibbon({ summary, onPrevMonth, onNextMonth }) {
  return (
    <div className="bg-[#550000] text-white px-3 md:px-8 py-2 text-[10px] flex flex-wrap items-center justify-between gap-3 border-b border-[#800000]">
      <div className="flex items-center gap-3 md:gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-[#efbf04] dark:text-[#fbcc0e]" />
          <span className="font-bold tracking-tight uppercase flex items-center gap-2 md:gap-3">
            <span className="hidden md:inline">Month</span>
            <div className="flex items-center gap-1 bg-[#800000]/50 px-2 py-0.5 rounded-lg border border-[#800000]/50 shadow-inner">
              <button onClick={onPrevMonth} className="hover:text-[#efbf04] dark:hover:text-[#fbcc0e] transition-colors p-0.5">
                <ChevronLeft size={14} />
              </button>
              <span className="min-w-[70px] text-center text-[#efbf04] dark:text-[#fbcc0e] font-black">{summary.month}</span>
              <button onClick={onNextMonth} className="hover:text-[#efbf04] dark:hover:text-[#fbcc0e] transition-colors p-0.5">
                <ChevronRight size={14} />
              </button>
            </div>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen size={12} className="text-[#efbf04] dark:text-[#fbcc0e]" />
          <span className="font-bold tracking-tight uppercase">
            <span className="hidden md:inline">Status: </span>
            <span
              className={`ml-0 md:ml-2 px-1.5 py-0.5 rounded ${
                summary.status === 'ACTIVE'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {summary.status}
            </span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-6 text-slate-300 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span className="hidden md:inline">Opened: {summary.openedOn}</span>
          <span className="md:hidden">{summary.openedOn}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User size={12} />
          <span className="hidden md:inline">By: {summary.openedBy}</span>
          <span className="md:hidden">{summary.openedBy}</span>
        </div>
      </div>
    </div>
  );
}
