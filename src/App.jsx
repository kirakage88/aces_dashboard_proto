import { useState } from 'react';
import Layout from './components/Layout';
import useSheetData from './hooks/useSheetData';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { project, ledger, loading, error, followLink } = useSheetData();

  const renderTab = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm font-black text-red-500">Error: {error}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#1a0000]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#550000_0%,_#1a0000_100%)]" />
            <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-[#efbf04]/5 rounded-full blur-[120px] animate-pulse" />
            <div className="z-10 text-center px-10 max-w-6xl">
              <h1 className="text-[10rem] md:text-[14rem] font-black text-[#efbf04] tracking-tighter leading-none drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] mb-6 select-none">
                ACES AUDIT
              </h1>
              <p className="text-[#efbf04]/50 font-black uppercase tracking-[1em] text-sm ml-4">
                Audit Management & Systems Control
              </p>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Projects — coming soon
            </p>
          </div>
        );

      case 'overview':
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Overview — coming soon
            </p>
          </div>
        );

      case 'calendar':
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Calendar — coming soon
            </p>
          </div>
        );

      case 'ledger':
        return (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Ledger — coming soon
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} followLink={followLink}>
      {renderTab()}
    </Layout>
  );
}
