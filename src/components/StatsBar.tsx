'use client';

interface Props {
  stats: Record<string, number>;
  dark: boolean;
}

const STATS = [
  { key: 'total',            label: 'Total',       icon: '📋', accent: '#3b82f6' },
  { key: 'high',             label: 'High',         icon: '🔴', accent: '#ef4444' },
  { key: 'done',             label: 'Done',         icon: '✅', accent: '#22c55e' },
  { key: 'inProgress',       label: 'In Progress',  icon: '⚡', accent: '#3b82f6' },
  { key: 'pendingOrWaiting', label: 'Pending',      icon: '⏳', accent: '#f59e0b' },
  { key: 'confidential',     label: 'Private',      icon: '🔒', accent: '#8b5cf6' },
  { key: 'overdue',          label: 'Overdue',      icon: '⚠️', accent: '#f43f5e' },
];

export function StatsBar({ stats, dark }: Props) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 mb-4 sm:mb-6">
      {STATS.map(({ key, label, icon, accent }) => {
        const val = stats[key] ?? 0;
        const isOverdue = key === 'overdue' && val > 0;
        return (
          <div key={key}
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 relative overflow-hidden transition-all hover:scale-[1.02]"
            style={{
              background: dark ? 'rgba(17,24,39,0.8)' : '#fff',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
              boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 10px rgba(13,27,42,0.06)',
            }}>
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ background: accent }} />
            <div className="pl-1.5">
              <div className="text-base sm:text-lg mb-0.5">{icon}</div>
              <div className="text-xl sm:text-2xl font-bold leading-none mb-1"
                style={{ color: isOverdue ? '#f43f5e' : (dark ? '#f1f5f9' : '#0d1b2a') }}>
                {val}
              </div>
              <div className="text-xs font-semibold leading-tight" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
                {label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
