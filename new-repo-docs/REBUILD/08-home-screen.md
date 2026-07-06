# Phase 8: Home Screen

> **Goal:** Build the hero landing screen, loading state, and error state.

---

## 8.1 — Home Screen (`src/tabs/HomeTab.jsx`)

The home screen is the landing page after login. It's a dramatic hero with the ACES branding.

```jsx
export default function HomeTab() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#1a0000]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#550000_0%,_#1a0000_100%)]" />
      {/* Glow effect */}
      <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] 
                      bg-[#efbf04]/5 dark:bg-[#fbcc0e]/5 rounded-full blur-[120px] animate-pulse" />
      {/* Content */}
      <div className="z-10 text-center px-6 md:px-10 max-w-6xl">
        <h1 className="text-[4rem] sm:text-[7rem] md:text-[10rem] lg:text-[14rem] 
                       font-black text-[#efbf04] dark:text-[#fbcc0e] tracking-tighter leading-none 
                       drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] mb-6 select-none">
          ACES AUDIT
        </h1>
        <p className="text-[#efbf04]/50 dark:text-[#fbcc0e]/50 font-black uppercase 
                      tracking-[0.5em] md:tracking-[1em] text-[10px] md:text-sm ml-4">
          Audit Management & Systems Control
        </p>
      </div>
    </div>
  );
}
```

## 8.2 — Loading State

When data is being fetched, show a centered loading indicator:

```jsx
function LoadingScreen() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm font-black text-slate-400 dark:text-dark-muted 
                    uppercase tracking-widest transition-colors">
        Loading...
      </p>
    </div>
  );
}
```

## 8.3 — Error State

When data fetching fails, show the error:

```jsx
function ErrorScreen({ message }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm font-black text-red-500">Error: {message}</p>
    </div>
  );
}
```

## 8.4 — Wiring in App.jsx

These three screens are rendered conditionally in `App.jsx`:

```jsx
function renderContent() {
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  switch (activeTab) {
    case 'home': return <HomeTab />;
    case 'projects': return <ProjectsTab project={project} spendMap={spendMap} />;
    // ... other tabs
  }
}
```

Each tab is rendered inside the Layout component, which provides the Header.

---

## Next Step

Proceed to [`09-kanban-projects.md`](09-kanban-projects.md) to build the Kanban board with drag-and-drop.
