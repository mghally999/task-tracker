'use client';
import { CATEGORIES, PRIORITIES, STATUSES } from '@/lib/utils';
import type { TaskFilters } from '@/types';

interface Props {
  filters: TaskFilters;
  onChange: (f: TaskFilters) => void;
  dark: boolean;
  showArchived: boolean;
  onToggleArchived: () => void;
  resultCount: number;
}

export function FilterPanel({ filters, onChange, dark, showArchived, onToggleArchived, resultCount }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const thisWeekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().slice(0, 10);
  })();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

  const sel = (overrides: Partial<TaskFilters>) => onChange({ ...filters, ...overrides });

  const inputStyle = {
    background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    color: dark ? '#f1f5f9' : '#0d1b2a',
    borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec',
    fontSize: '13px',
    padding: '7px 10px',
  };

  const quickRanges = [
    { label: 'Today', action: () => sel({ dateFrom: today, dateTo: today }) },
    { label: 'This Week', action: () => sel({ dateFrom: thisWeekStart, dateTo: today }) },
    { label: 'This Month', action: () => sel({ dateFrom: monthStart, dateTo: today }) },
    { label: 'Overdue', action: () => sel({ dateFrom: '', dateTo: new Date(Date.now() - 86400000).toISOString().slice(0, 10), status: 'pending' as any }) },
    { label: 'Clear', action: () => onChange({ search: '', priority: '', status: '', category: '', dateFrom: '', dateTo: '' }) },
  ];

  return (
    <div className="rounded-2xl p-4 mb-4"
      style={{ background: dark ? 'rgba(17,24,39,0.7)' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`, boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 8px rgba(13,27,42,0.06)' }}>
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Search</label>
          <input value={filters.search || ''} onChange={e => sel({ search: e.target.value })}
            placeholder="Tasks, owners, notes…" style={inputStyle} />
        </div>

        {/* Priority */}
        <div className="min-w-36">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Priority</label>
          <select value={filters.priority || ''} onChange={e => sel({ priority: e.target.value as any })} style={inputStyle}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Status */}
        <div className="min-w-36">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Status</label>
          <select value={filters.status || ''} onChange={e => sel({ status: e.target.value as any })} style={inputStyle}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Category */}
        <div className="min-w-44">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Category</label>
          <select value={filters.category || ''} onChange={e => sel({ category: e.target.value as any })} style={inputStyle}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Date range */}
        <div className="min-w-32">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>From</label>
          <input type="date" value={filters.dateFrom || ''} onChange={e => sel({ dateFrom: e.target.value })} style={inputStyle} />
        </div>
        <div className="min-w-32">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>To</label>
          <input type="date" value={filters.dateTo || ''} onChange={e => sel({ dateTo: e.target.value })} style={inputStyle} />
        </div>

        {/* Archive toggle */}
        <button onClick={onToggleArchived}
          className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
          style={{
            background: showArchived ? (dark ? 'rgba(148,163,184,0.15)' : '#f1f5f9') : 'transparent',
            color: dark ? '#94a3b8' : '#64748b',
            borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec',
          }}>
          {showArchived ? '📂 Hide Archive' : '📦 Show Archive'}
        </button>
      </div>

      {/* Quick ranges */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-xs font-semibold" style={{ color: dark ? '#475569' : '#94a3b8' }}>Quick:</span>
        {quickRanges.map(r => (
          <button key={r.label} onClick={r.action}
            className="px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105"
            style={{ background: 'transparent', color: dark ? '#94a3b8' : '#64748b', borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec' }}>
            {r.label}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>
          Showing <strong style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>{resultCount}</strong> tasks
        </span>
      </div>
    </div>
  );
}
