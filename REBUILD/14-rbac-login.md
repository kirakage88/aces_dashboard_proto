# Phase 14: RBAC — Role-Based Access Control

> **Goal:** Implement role-based tab visibility, the login screen, profile setup, and role-aware App.jsx wiring.

---

## 14.1 — Create `src/roles.js`

```js
import { 
  LayoutDashboard, Kanban as KanbanIcon, BarChart3, Calendar, DollarSign,
  PieChart, TrendingDown, CalendarCheck, 
} from 'lucide-react';

// Lazy-load department tab components
import { lazy } from 'react';
const FinanceBudgetTab = lazy(() => import('./tabs/FinanceBudgetTab'));
const FinanceDisbursementsTab = lazy(() => import('./tabs/FinanceDisbursementsTab'));
const EventsDashboardTab = lazy(() => import('./tabs/EventsDashboardTab'));

// Tab registry: maps tab IDs to their component and metadata
export const TAB_REGISTRY = {
  home: {
    label: 'Home',
    icon: LayoutDashboard,
    component: () => import('./tabs/HomeTab'),  // static import also fine
  },
  projects: {
    label: 'Projects',
    icon: KanbanIcon,
    component: () => import('./tabs/ProjectsTab'),
  },
  overview: {
    label: 'Overview',
    icon: BarChart3,
    component: () => import('./tabs/OverviewTab'),
  },
  calendar: {
    label: 'Calendar',
    icon: Calendar,
    component: () => import('./tabs/CalendarTab'),
  },
  ledger: {
    label: 'Ledger',
    icon: DollarSign,
    component: () => import('./tabs/LedgerTab'),
  },
  budget: {
    label: 'Budget',
    icon: PieChart,
    component: () => FinanceBudgetTab,
  },
  disbursements: {
    label: 'Disbursements',
    icon: TrendingDown,
    component: () => FinanceDisbursementsTab,
  },
  'events-dashboard': {
    label: 'Events Dashboard',
    icon: CalendarCheck,
    component: () => EventsDashboardTab,
  },
};

// Role definitions
export const ROLES = {
  op: {
    label: 'Office of the President',
    tabs: ['home', 'projects', 'overview', 'calendar', 'ledger'],
    filterDept: null, // null = sees everything
  },
  ovp: {
    label: 'Office of the Vice President',
    tabs: ['home', 'projects', 'overview', 'calendar', 'ledger'],
    filterDept: null,
  },
  oes: {
    label: 'Office of the Executive Secretary',
    tabs: ['home', 'projects', 'overview', 'calendar', 'ledger'],
    filterDept: null,
  },
  finance: {
    label: 'Finance & Treasury',
    tabs: ['home', 'ledger', 'budget', 'disbursements'],
    filterDept: 'Finance',
  },
  events: {
    label: 'Events Management',
    tabs: ['home', 'projects', 'calendar', 'events-dashboard'],
    filterDept: 'Events',
  },
  drca: {
    label: 'Research & Constituent Affairs',
    tabs: ['home', 'projects', 'calendar'],
    filterDept: 'DRCA',
  },
  standard: {
    label: 'Standard Access',
    tabs: ['home', 'projects', 'calendar'],
    filterDept: null, // sees own dept via RLS
  },
};

// Map role string to config
export function getRoleConfig(role) {
  return ROLES[role] || ROLES.standard;
}

// Map a role's filter department to a department_id
export function getDeptIds(roles, role, departments) {
  const config = getRoleConfig(role);
  if (!config.filterDept) return null; // executive — no filter
  const dept = departments.find(d => d.code === config.filterDept);
  return dept ? dept.id : null;
}
```

## 14.2 — LoginScreen (`src/components/LoginScreen.jsx`)

Already designed in Phase 4. Full-screen Google OAuth prompt.

**Extension for role selection:** After first Google login, show a role picker:

```jsx
// src/components/RoleSetupScreen.jsx
// Fetches departments from Supabase
// Lets user pick their department/role
// Creates a row in public.users table
// Then navigates to the main app
```

## 14.3 — Wire `App.jsx` with Roles

```jsx
import { useState, useMemo, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import useSupabaseData from './hooks/useSupabaseData';
import useDarkMode from './hooks/useDarkMode';
import { TAB_REGISTRY, getRoleConfig } from './roles';
import { computeSpendMap } from './utils/ledger';
import Layout from './components/Layout';
import LoginScreen from './components/LoginScreen';
import RoleSetupScreen from './components/RoleSetupScreen';

export default function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { isDark, toggle: toggleDark } = useDarkMode();

  // Data layer
  const { project, ledger, loading: dataLoading, error } = useSupabaseData(user, profile);

  // Role-based tab config
  const roleConfig = useMemo(() => {
    if (!profile) return null;
    return getRoleConfig(profile.role);
  }, [profile]);

  const availableTabs = useMemo(() => {
    if (!roleConfig) return [];
    return roleConfig.tabs.map(id => ({
      id,
      label: TAB_REGISTRY[id]?.label || id,
      icon: TAB_REGISTRY[id]?.icon,
    }));
  }, [roleConfig]);

  const [activeTab, setActiveTab] = useState('home');

  // Spend map from filtered data
  const spendMap = useMemo(() => computeSpendMap(ledger.data), [ledger.data]);

  // Auth gate
  if (authLoading) return <LoadingScreen />;
  if (!user) return <LoginScreen />;
  if (!profile) return <RoleSetupScreen userId={user.id} />;
  if (!roleConfig) return <LoadingScreen />;

  // Render active tab
  const renderTab = () => {
    if (dataLoading) return <LoadingScreen />;
    if (error) return <ErrorScreen message={error} />;

    if (activeTab === 'home') return <HomeTab />;

    switch (activeTab) {
      case 'projects':
        return <ProjectsTab project={project} spendMap={spendMap} />;
      case 'overview':
        return <OverviewTab project={project} spendMap={spendMap} />;
      case 'calendar':
        return <CalendarTab project={project} spendMap={spendMap} />;
      case 'ledger':
        return <LedgerTab ledger={ledger} project={project}
                projectCodes={project.data.map(p => p.project_code).filter(Boolean)}
                followLink={followLink} />;
      case 'budget':
        return <FinanceBudgetTab project={project} spendMap={spendMap} />;
      case 'disbursements':
        return <FinanceDisbursementsTab ledger={ledger} project={project} />;
      case 'events-dashboard':
        return <EventsDashboardTab project={project} />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}
            availableTabs={availableTabs}
            isDark={isDark} onToggleDark={toggleDark}
            user={user} onSignOut={signOut}>
      {renderTab()}
    </Layout>
  );
}
```

## 14.4 — FollowLink Utility

The clipboard-copy utility stays but moves to a shared location:

```jsx
// src/utils/clipboard.js
export function followLink(url, key, setCopiedKey) {
  // Same implementation as old followLink:
  // navigator.clipboard.writeText() with <textarea> fallback
  // Shows "COPIED" state for 2 seconds via setCopiedKey
}
```

## 14.5 — RBAC Flow Summary

```
1. User opens app → no session → LoginScreen
2. User clicks "Sign in with Google" → OAuth popup
3. Supabase creates auth.users row → redirect back to app
4. App checks public.users table:
   a. No row → RoleSetupScreen (pick department + role)
   b. Has row → App.jsx reads profile.role
5. profile.role → getRoleConfig(role) → availableTabs array
6. Header renders only those tabs
7. useSupabaseData fetches data with RLS filtering automatically
8. Components receive only the data their role is allowed to see
```

---

## Next Step

Proceed to [`15-dept-tabs.md`](15-dept-tabs.md) to build the department-specific tabs.
