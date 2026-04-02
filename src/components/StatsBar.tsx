'use client';

interface Props {
  stats: Record<string, number>;
  dark: boolean;
}

const STAT_DEFS = [
  { key: 'total', label: 'Total Tasks', icon: '📋', colorClass: '', accentColor: '#3b82f6' },
  { key: 'high', label: 'High Priority', icon: '🔴', colorClass: 'stat-high', accentColor: '#ef4444' },
  { key: 'done', label: 'Completed', icon: '✅', colorClass: 'stat-done', accentColor: '#22c55e' },
  { key: 'inProgress', label: 'In Progress', icon: '⚡', colorClass: 'stat-progress', accentColor: '#3b82f6' },
  { key: 'pendingOrWaiting', label: 'Pending / Waiting', icon: '⏳', colorClass: '', accentColor: '#f59e0b' },
  { key: 'confidential', label: 'Confidential', icon: '🔒', colorClass: '', accentColor: '#8b5cf6' },
  { key: 'overdue', label: 'Overdue', icon: '⚠️', colorClass: '', accentColor: '#f43f5e' },
];

export function StatsBar({ stats, dark }: Props) {
  return (
    <div className="grid grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
      {STAT_DEFS.map(({ key, label, icon, accentColor }) => (
        <div
          key={key}
          className="rounded-2xl p-4 relative overflow-hidden transition-all hover:scale-[1.02]"
          style={{
            background: dark ? 'rgba(17,24,39,0.8)' : '#fff',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
            boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(13,27,42,0.06)',
          }}
        >
          {/* Accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: accentColor }} />

          <div className="pl-1">
            <div className="text-lg mb-1">{icon}</div>
            <div
              className="text-2xl font-bold font-display mb-1"
              style={{ color: key === 'overdue' && (stats[key] || 0) > 0 ? '#f43f5e' : (dark ? '#f1f5f9' : '#0d1b2a') }}
            >
              {stats[key] ?? 0}
            </div>
            <div className="text-xs font-medium" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
