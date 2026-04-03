'use client';
import { useState } from 'react';
import type { Task, User, OnlineUser, DashboardNotes, TaskStatus } from '@/types';
import { StatsBar } from './StatsBar';
import { TaskRow } from './TaskRow';
import { NotesSection } from './NotesSection';
import { STATUS_CONFIG } from '@/lib/utils';

interface Props {
  tasks: Task[];
  archivedTasks: Task[];
  stats: Record<string, number>;
  notes: DashboardNotes;
  currentUser: User;
  onlineUsers: OnlineUser[];
  dark: boolean;
  onComment: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onNewTask: () => void;
  onNotesChange: (updates: Partial<DashboardNotes>) => void;
}

export function CEODashboard({
  tasks, archivedTasks, stats, notes, currentUser, onlineUsers, dark,
  onComment, onStatusChange, onEdit, onArchive, onRestore, onDelete, onNewTask, onNotesChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'priority' | 'archived'>('all');

  const active = tasks.filter(t => !t.archived);
  const high   = active.filter(t => t.priority === 'High');
  const medium = active.filter(t => t.priority === 'Medium');
  const low    = active.filter(t => t.priority === 'Low');

  const byStatus = (list: Task[]) => ({
    pending: list.filter(t => t.status === 'pending').length,
    progress: list.filter(t => t.status === 'progress').length,
    done: list.filter(t => t.status === 'done').length,
    hold: list.filter(t => t.status === 'hold').length,
  });

  const card = {
    background: dark ? 'rgba(17,24,39,0.8)' : '#fff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
    borderRadius: '20px', padding: '20px',
    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(13,27,42,0.06)',
  };

  const tabStyle = (on: boolean) => ({
    padding: '8px 16px', borderRadius: '10px', fontSize: '13px',
    fontWeight: '600' as const, cursor: 'pointer' as const, border: 'none',
    background: on ? (dark ? '#1e3a5f' : '#163a63') : 'transparent',
    color: on ? '#fff' : (dark ? '#64748b' : '#94a3b8'), transition: 'all 0.2s',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Online banner */}
      {onlineUsers.filter(u => u.userId !== currentUser.id).length > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl"
          style={{ background: dark ? 'rgba(34,197,94,0.08)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(34,197,94,0.2)' : '#86efac'}` }}>
          <div className="online-dot" />
          <span className="text-sm font-medium" style={{ color: dark ? '#86efac' : '#166534' }}>
            {onlineUsers.filter(u => u.userId !== currentUser.id).map(u => u.userName).join(', ')} is active — changes appear live
          </span>
        </div>
      )}

      <StatsBar stats={stats} dark={dark} />

      {/* Priority summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'High Priority', list: high, color: '#ef4444', icon: '🔴' },
          { label: 'Medium Priority', list: medium, color: '#f59e0b', icon: '🟡' },
          { label: 'Low Priority', list: low, color: '#22c55e', icon: '🟢' },
        ].map(({ label, list, color, icon }) => {
          const counts = byStatus(list);
          return (
            <div key={label} style={card}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{icon}</span>
                <h3 className="font-semibold text-sm" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>{label}</h3>
                <span className="ml-auto font-bold text-2xl" style={{ color }}>{list.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(Object.entries(counts) as [keyof typeof STATUS_CONFIG, number][]).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                    style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                    <span style={{ color: dark ? '#64748b' : '#94a3b8' }}>{STATUS_CONFIG[status]?.label}</span>
                    <span className="font-bold" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main panel */}
      <div style={card}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>CEO Priority Dashboard</h2>
            <p className="text-xs mt-0.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Full control — edit, update, archive, delete & comment on any task</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
              <button style={tabStyle(activeTab === 'all')} onClick={() => setActiveTab('all')}>All Tasks</button>
              <button style={tabStyle(activeTab === 'priority')} onClick={() => setActiveTab('priority')}>By Priority</button>
              <button style={tabStyle(activeTab === 'archived')} onClick={() => setActiveTab('archived')}>Archive</button>
            </div>
            <button onClick={onNewTask} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>
              ✨ New Task
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          {[{ color: '#ef4444', label: 'High' }, { color: '#f59e0b', label: 'Medium' }, { color: '#22c55e', label: 'Low' }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span style={{ color: dark ? '#64748b' : '#94a3b8' }}>{label}</span>
            </div>
          ))}
          <span className="ml-auto text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>Hover a row for edit/delete actions</span>
        </div>

        {/* ALL TASKS */}
        {activeTab === 'all' && (
          active.length === 0
            ? <div className="text-center py-16"><div className="text-5xl mb-4">📋</div><p style={{ color: dark ? '#475569' : '#94a3b8' }}>No active tasks</p></div>
            : active.map(task => (
                <TaskRow key={task.id} task={task} currentUser={currentUser} canEdit={true} dark={dark}
                  onStatusChange={onStatusChange} onEdit={onEdit} onArchive={onArchive}
                  onRestore={onRestore} onDelete={onDelete} onComment={onComment} />
              ))
        )}

        {/* PRIORITY GROUPS */}
        {activeTab === 'priority' && (['High', 'Medium', 'Low'] as const).map(p => {
          const group = active.filter(t => t.priority === p);
          if (!group.length) return null;
          const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
          return (
            <div key={p} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ background: colors[p] }} />
                <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors[p] }}>
                  {p} — {group.length} task{group.length !== 1 ? 's' : ''}
                </h3>
              </div>
              {group.map(task => (
                <TaskRow key={task.id} task={task} currentUser={currentUser} canEdit={true} dark={dark}
                  onStatusChange={onStatusChange} onEdit={onEdit} onArchive={onArchive}
                  onRestore={onRestore} onDelete={onDelete} onComment={onComment} />
              ))}
            </div>
          );
        })}

        {/* ARCHIVE */}
        {activeTab === 'archived' && (
          <div>
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: dark ? 'rgba(148,163,184,0.08)' : '#f8fafc', color: dark ? '#94a3b8' : '#64748b', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}` }}>
              📦 Archived tasks — restore any task to make it active again
            </div>
            {archivedTasks.length === 0
              ? <div className="text-center py-12"><div className="text-4xl mb-3">📦</div><p style={{ color: dark ? '#475569' : '#94a3b8' }}>No archived tasks</p></div>
              : archivedTasks.map(task => (
                  <TaskRow key={task.id} task={task} currentUser={currentUser} canEdit={true} dark={dark}
                    onStatusChange={onStatusChange} onEdit={onEdit} onArchive={onArchive}
                    onRestore={onRestore} onDelete={onDelete} onComment={onComment} />
                ))
            }
          </div>
        )}
      </div>

      {/* Notes */}
      <NotesSection notes={notes} onChange={onNotesChange} dark={dark} />
    </div>
  );
}
