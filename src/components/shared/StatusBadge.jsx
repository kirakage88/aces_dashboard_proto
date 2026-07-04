import { getStatusStyle } from '../../utils/project';

export default function StatusBadge({ status }) {
  const style = getStatusStyle(status);
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {status}
    </div>
  );
}
