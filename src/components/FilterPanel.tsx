'use client';
import { useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const sel = (o: Partial<TaskFilters>) => onChange({ ...filters, ...o });
  const clear = () => onChange({ search: '', priority: '', status: '', category: '', dateFrom: '', dateTo: '' });
  const hasFilters = !!(filters.search || filters.priority || filters.status || filters.category || filters.dateFrom || filters.dateTo);

  const inp = {
    background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    color: dark ? '#f1f5f9' : '#0d1b2a',
    borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec',
    fontSize: '14px', padding: '8px 11px',
  };

  const card = {
    background: dark ? 'rgba(17,24,39,0.8)' : '#fff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
    borderRadius: '16px', padding: '14px 16px',
    boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 8px rgba(13,27,42,0.06)',
    marginBottom: '14px',
  };

  return (
    <div style={card}>
      {/* Search + toggle row */}
      <div className="flex gap-2 items-center">
        <input value={filters.search || ''} onChange={e => sel({ search: e.target.value })}
          placeholder="🔍 Search tasks, owners, notes…"
          className="flex-1" style={inp} />
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all hover:opacity-80"
          style={{ background: (open || hasFilters) ? (dark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : (dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9'), color: (open || hasFilters) ? '#3b82f6' : (dark ? '#94a3b8' : '#64748b'), border: `1px solid ${(open || hasFilters) ? 'rgba(59,130,246,0.3)' : (dark ? 'rgba(255,255,255,0.1)' : '#dde3ec')}` }}>
          {open ? '▲' : '▼'} Filters {hasFilters && '●'}
        </button>
        <button onClick={onToggleArchived}
          className="px-3 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all hover:opacity-80"
          style={{ background: showArchived ? (dark ? 'rgba(148,163,184,0.15)' : '#f1f5f9') : 'transparent', color: dark ? '#94a3b8' : '#64748b', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#dde3ec'}` }}>
          📦
        </button>
      </div>

      {/* Expanded filters */}
      {open && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Priority</label>
            <select value={filters.priority || ''} onChange={e => sel({ priority: e.target.value as any })} style={inp}>
              <option value="">All</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Status</label>
            <select value={filters.status || ''} onChange={e => sel({ status: e.target.value as any })} style={inp}>
              <option value="">All</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Category</label>
            <select value={filters.category || ''} onChange={e => sel({ category: e.target.value as any })} style={inp}>
              <option value="">All</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: dark ? '#64748b' : '#94a3b8' }}>From</label>
            <input type="date" value={filters.dateFrom || ''} onChange={e => sel({ dateFrom: e.target.value })} style={inp} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1" style={{ color: dark ? '#64748b' : '#94a3b8' }}>To</label>
            <input type="date" value={filters.dateTo || ''} onChange={e => sel({ dateTo: e.target.value })} style={inp} />
          </div>
        </div>
      )}

      {/* Quick ranges + result count */}
      <div className="flex items-center gap-2 flex-wrap mt-2.5">
        {[
          { label: 'Today', action: () => sel({ dateFrom: today, dateTo: today }) },
          { label: 'This Week', action: () => { const d = new Date(); d.setDate(d.getDate()-d.getDay()+1); sel({ dateFrom: d.toISOString().slice(0,10), dateTo: today }); } },
          { label: 'This Month', action: () => { const d = new Date(); sel({ dateFrom: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`, dateTo: today }); } },
          { label: 'Clear', action: clear },
        ].map(r => (
          <button key={r.label} onClick={r.action}
            className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105"
            style={{ background: 'transparent', color: dark ? '#94a3b8' : '#64748b', borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec' }}>
            {r.label}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>
          <strong style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>{resultCount}</strong> tasks
        </span>
      </div>
    </div>
  );
}
