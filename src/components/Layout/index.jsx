import Header from './Header';
import useDarkMode from '../../hooks/useDarkMode';

export default function Layout({ children, activeTab, onTabChange }) {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col font-sans text-slate-900 dark:text-dark-text transition-colors">
      <Header activeTab={activeTab} onTabChange={onTabChange} isDark={isDark} onToggleDark={toggle} />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
