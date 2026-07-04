import { useState } from 'react';
import {
  LayoutDashboard,
  Kanban as KanbanIcon,
  BarChart3,
  Calendar,
  ExternalLink,
  FolderOpen,
  FileText,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { TABS, EXTERNAL_RESOURCES } from '../../constants';

const TAB_ICONS = {
  home: LayoutDashboard,
  projects: KanbanIcon,
  overview: BarChart3,
  calendar: Calendar,
  ledger: DollarSign,
};

const RESOURCE_ICONS = {
  LEDGER: ExternalLink,
  DRIVE: FolderOpen,
  FILES: FileText,
};

export default function Header({ activeTab, onTabChange, followLink }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (url, key) => {
    followLink(url, key, setCopiedKey);
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[60]">
      <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
        <div
          className="flex items-center gap-4 group cursor-pointer"
          onClick={() => onTabChange('home')}
        >
          <div className="bg-[#550000] p-3 rounded-[1.25rem] shadow-xl shadow-[#550000]/20 text-white transform group-hover:rotate-12 transition-all">
            <LayoutDashboard size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#550000] leading-none">
              ACES AUDIT
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Systems Node 26-27
            </div>
          </div>
        </div>

        <nav className="flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/40">
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

        <div className="flex items-center gap-2">
          {Object.entries(EXTERNAL_RESOURCES).map(([key, url]) => {
            const Icon = RESOURCE_ICONS[key];
            return (
              <button
                key={key}
                onClick={() => handleCopy(url, key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                  copiedKey === key
                    ? 'bg-green-50 border-green-200 text-green-600'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-[#550000] hover:text-[#550000]'
                }`}
              >
                {copiedKey === key ? <CheckCircle2 size={12} /> : <Icon size={12} />}
                {copiedKey === key ? 'COPIED' : key}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
