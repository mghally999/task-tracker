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

const DEFAULT_FORM = {
  name: '', date: new Date().toISOString().slice(0, 10),
  category: 'Follow-up' as Category, priority: 'Medium' as Priority,
  status: 'pending' as TaskStatus, time: '', owner: '', notes: '',
};

export function TaskForm({ task, onSave, onClose, dark }: Props) {
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [saving, setSaving] = useState(false);
  const isEdit = !!task;

  useEffect(() => {
    if (task) {
      setForm({
        name: task.name, date: task.date, category: task.category,
        priority: task.priority, status: task.status, time: task.time,
        owner: task.owner, notes: task.notes,
      });
    } else {
      setForm({ ...DEFAULT_FORM, date: new Date().toISOString().slice(0, 10) });
    }
  }, [task]);

  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) return;
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  const labelStyle = { color: dark ? '#64748b' : '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: '6px' };
  const inputStyle = { background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc', color: dark ? '#f1f5f9' : '#0d1b2a', borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        style={{ background: dark ? '#111827' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#dde3ec'}` }}>

        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between"
          style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderColor: dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
              {isEdit ? '✏️ Edit Task' : '✨ New Task'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
              {isEdit ? 'Update task details' : 'Add a new action item or executive task'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all hover:opacity-70"
            style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Task name */}
            <div className="col-span-2">
              <label style={labelStyle}>Task / Action Item *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Prepare CEO briefing pack for investor meeting"
                required style={inputStyle} />
            </div>

            {/* Date */}
            <div>
              <label style={labelStyle}>Date *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required style={inputStyle} />
            </div>

            {/* Deadline */}
            <div>
              <label style={labelStyle}>Deadline / Time</label>
              <input value={form.time} onChange={e => set('time', e.target.value)}
                placeholder="e.g. 11:00 AM / Before 5 PM" style={inputStyle} />
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value as Priority)} style={inputStyle}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value as TaskStatus)} style={inputStyle}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Owner */}
            <div>
              <label style={labelStyle}>Delegated To / Contact</label>
              <input value={form.owner} onChange={e => set('owner', e.target.value)}
                placeholder="e.g. Finance Team / Ms. Malak" style={inputStyle} />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label style={labelStyle}>Notes / CEO Update</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Add update, next action, dependency, or item awaiting CEO decision"
                rows={3} style={{ ...inputStyle, minHeight: '80px' }} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t"
            style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
              style={{ color: dark ? '#94a3b8' : '#64748b', borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec', background: 'transparent' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.name.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>
              {saving ? 'Saving…' : (isEdit ? 'Save Changes' : '+ Add Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
