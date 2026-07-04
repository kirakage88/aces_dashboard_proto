import Header from './Header';

export default function Layout({ children, activeTab, onTabChange }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
