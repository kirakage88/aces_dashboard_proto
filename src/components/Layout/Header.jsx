import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Kanban as KanbanIcon,
  BarChart3,
  Calendar,
  DollarSign,
  Menu,
  X,
} from 'lucide-react';
import { TABS } from '../../constants';

const TAB_ICONS = {
  home: LayoutDashboard,
  projects: KanbanIcon,
  overview: BarChart3,
  calendar: Calendar,
  ledger: DollarSign,
};

export default function Header({ activeTab, onTabChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-[60]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-5 flex items-center justify-between lg:grid lg:grid-cols-3">
        <div
          className="flex items-center gap-2 md:gap-4 group cursor-pointer"
          onClick={() => handleTabClick('home')}
        >
          <div className="bg-[#550000] p-2 md:p-3 rounded-[1.25rem] shadow-xl shadow-[#550000]/20 text-white transform group-hover:rotate-12 transition-all">
            <LayoutDashboard size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-[#550000] leading-none">
              ACES AUDIT
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Systems Node 26-27</span>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/40">
          {TABS.map((tab) => {
            const Icon = TAB_ICONS[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-[#550000] shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={14} strokeWidth={3} /> {tab.label}
              </button>
            );
          })}
        </nav>

        <button
          className="lg:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-600"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[80vw] bg-white shadow-2xl border-l border-slate-100 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {TABS.map((tab) => {
                const Icon = TAB_ICONS[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#550000] text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={18} strokeWidth={2.5} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
