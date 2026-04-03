'use client';
import { useState, useEffect } from 'react';
import type { Task, Priority, TaskStatus, Category } from '@/types';
import { CATEGORIES, PRIORITIES, STATUSES } from '@/lib/utils';

interface Props {
  task?: Task | null;
  onSave: (data: Partial<Task>) => Promise<void>;
  onClose: () => void;
  dark: boolean;
}

const DEFAULT: any = {
  name: '', date: '', category: 'Follow-up', priority: 'Medium',
  status: 'pending', time: '', owner: '', notes: '',
};

export function TaskForm({ task, onSave, onClose, dark }: Props) {
  const [form, setForm] = useState({ ...DEFAULT });
  const [saving, setSaving] = useState(false);
  const isEdit = !!task;

  useEffect(() => {
    if (task) setForm({ name: task.name, date: task.date, category: task.category, priority: task.priority, status: task.status, time: task.time, owner: task.owner, notes: task.notes });
    else setForm({ ...DEFAULT, date: new Date().toISOString().slice(0, 10) });
  }, [task]);

  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) return;
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  const surface = dark ? '#111827' : '#fff';
  const border  = dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
  const label   = { color: dark ? '#64748b' : '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: '6px' };
  const inp     = { background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc', color: dark ? '#f1f5f9' : '#0d1b2a', borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up max-h-[95vh] overflow-y-auto"
        style={{ background: surface, border: `1px solid ${border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
          style={{ background: dark ? 'rgba(17,24,39,0.98)' : '#f8fafc', borderColor: border }}>
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
              {isEdit ? '✏️ Edit Task' : '✨ New Task'}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
              {isEdit ? 'Update task details' : 'Add a new action item'}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label style={label}>Task / Action Item *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Prepare CEO briefing pack for investor meeting" required style={inp} />
            </div>
            <div>
              <label style={label}>Date *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required style={inp} />
            </div>
            <div>
              <label style={label}>Deadline / Time</label>
              <input value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. 11:00 AM / Before 5 PM" style={inp} />
            </div>
            <div>
              <label style={label}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value as Priority)} style={inp}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value as TaskStatus)} style={inp}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Delegated To / Contact</label>
              <input value={form.owner} onChange={e => set('owner', e.target.value)} placeholder="e.g. Finance Team / Ms. Malak" style={inp} />
            </div>
            <div className="sm:col-span-2">
              <label style={label}>Notes / CEO Update</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Add update, next action, dependency, or item awaiting CEO decision" rows={3} style={{ ...inp, minHeight: '80px' }} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t" style={{ borderColor: border }}>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
              style={{ color: dark ? '#94a3b8' : '#64748b', borderColor: border, background: 'transparent' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.name.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>
              {saving ? 'Saving…' : (isEdit ? 'Save Changes' : '+ Add Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
