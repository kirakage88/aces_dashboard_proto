# Phase 7: Core UI — Layout, Header, Dark Mode

> **Goal:** Build the app shell — Layout wrapper, Header with role-based navigation, dark mode toggle, theme constants.

---

## 7.1 — Theme Constants (`src/constants.js`)

```js
export const THEME = {
  primary: '#550000',
  accent: '#efbf04',
  text: '#1a1a1a',
  bg: '#f8fafc',
  dark: {
    bg: '#101010',
    card: '#090d10',
    text: '#d6def0',
    muted: '#8895b5',
    border: '#1c2330',
    'border-md': '#283040',
    input: '#111a24',
    hover: '#1a2230',
    accent: '#fbcc0e',
  },
};

export const CHART_COLORS = [
  '#550000', '#efbf04', '#800000', '#D4AF37', '#600000',
  '#B8860B', '#a52a2a', '#DAA520', '#4A0000', '#FFD700',
];

export const EXTERNAL_RESOURCES = {
  LEDGER: 'https://docs.google.com/spreadsheets/d/...',
  DRIVE: 'https://drive.google.com/drive/folders/...',
  FILES: 'https://docs.google.com/spreadsheets/d/...',
};
```

**Note:** Unlike the old version, `TABS` is no longer defined here — it's now role-based and lives in `src/roles.js` (built in Phase 14).

## 7.2 — Dark Mode Hook (`src/hooks/useDarkMode.js`)

```js
import { useState, useEffect } from 'react';

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('aces_dark') === 'true'
      || (!('aces_dark' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('aces_dark', String(isDark));
  }, [isDark]);

  const toggle = () => setIsDark((prev) => !prev);

  return { isDark, toggle };
}
```

## 7.3 — Layout Wrapper (`src/components/Layout/index.jsx`)

```jsx
import Header from './Header';

export default function Layout({ children, activeTab, onTabChange, isDark, onToggleDark }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-dark-bg flex flex-col transition-colors">
      <Header {...{ activeTab, onTabChange, isDark, onToggleDark }} />
      {children}
    </div>
  );
}
```

The Layout component is minimal — it provides the header and a flex container for content.

## 7.4 — Header (`src/components/Layout/Header.jsx`)

The Header renders navigation tabs dynamically based on the current role. The tab list is passed as a prop from `App.jsx`.

```jsx
import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, LayoutDashboard } from 'lucide-react';

export default function Header({ activeTab, onTabChange, availableTabs, isDark, onToggleDark, user, onSignOut }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const TAB_ICONS = {
    home: LayoutDashboard,
    projects: require('lucide-react').Kanban,
    overview: require('lucide-react').BarChart3,
    calendar: require('lucide-react').Calendar,
    ledger: require('lucide-react').DollarSign,
    budget: require('lucide-react').PieChart,
    disbursements: require('lucide-react').TrendingDown,
    'events-dashboard': require('lucide-react').CalendarCheck,
  };

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <header className="bg-white dark:bg-dark-card border-b border-slate-100 dark:border-dark-border 
                       sticky top-0 z-[60] transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-5 
                      grid grid-cols-2 lg:grid-cols-3 items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-4 cursor-pointer"
             onClick={() => onTabChange('home')}>
          <div className="bg-[#550000] p-2 md:p-3 rounded-[1.25rem] text-white">
            <LayoutDashboard size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black tracking-tight text-[#550000] leading-none">
              ACES AUDIT
            </h1>
          </div>
        </div>

        {/* Desktop Nav: render only tabs for this role */}
        <nav className="hidden lg:flex items-center bg-slate-100/50 dark:bg-dark-input/50 
                        p-1 rounded-2xl gap-1 justify-self-center">
          {availableTabs.map((tab) => {
            const Icon = TAB_ICONS[tab.id] || LayoutDashboard;
            return (
              <button key={tab.id} onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-dark-bg text-[#550000] dark:text-dark-accent shadow-md'
                    : 'text-slate-500 dark:text-dark-muted hover:text-slate-800'
                }`}>
                <Icon size={14} strokeWidth={3} /> {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right side: dark mode, user, mobile menu */}
        <div className="flex items-center gap-2 justify-self-end">
          <button onClick={onToggleDark}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-xl transition-all 
                       text-slate-500 dark:text-dark-muted">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="lg:hidden p-2.5 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-xl"
                  onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer: same dynamic tab list */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
               onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[80vw] 
                          bg-white dark:bg-dark-card shadow-2xl border-l border-slate-100 dark:border-dark-border">
            <div className="flex items-center justify-between p-5 border-b">
              <span className="text-sm font-black text-slate-500 dark:text-dark-muted uppercase tracking-widest">
                Navigation
              </span>
              <button onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-dark-hover rounded-xl">
                <X size={20} />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {availableTabs.map((tab) => {
                const Icon = TAB_ICONS[tab.id] || LayoutDashboard;
                return (
                  <button key={tab.id}
                    onClick={() => { onTabChange(tab.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#550000] text-white shadow-lg'
                        : 'text-slate-600 dark:text-dark-muted hover:bg-slate-50 dark:hover:bg-dark-hover'
                    }`}>
                    <Icon size={18} strokeWidth={2.5} /> {tab.label}
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
```

**Key difference from old Header:** The `availableTabs` prop replaces the old `TABS` constant. This is how role-based navigation works — each role only sees their allowed tabs.

---

## Next Step

Proceed to [`08-home-screen.md`](08-home-screen.md) to build the Home screen hero and loading/error states.
