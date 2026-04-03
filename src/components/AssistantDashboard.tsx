'use client';
import { useState } from 'react';
import type { Task, User, TaskStatus, DailyNotes, TaskFilters } from '@/types';
import { StatsBar } from './StatsBar';
import { TaskRow } from './TaskRow';
import { FilterPanel } from './FilterPanel';
import { NotesSection } from './NotesSection';

interface Props {
  tasks: Task[];
  archivedTasks: Task[];
  stats: Record<string, number>;
  notes: DailyNotes;
  selectedDate: string;
  currentUser: User;
  dark: boolean;
  filters: TaskFilters;
  onFiltersChange: (f: TaskFilters) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onComment: (task: Task) => void;
  onNewTask: () => void;
  onNotesChange: (date: string, updates: Partial<DailyNotes>) => void;
}

export function AssistantDashboard({
  tasks, archivedTasks, stats, notes, selectedDate, currentUser, dark, filters,
  onFiltersChange, onStatusChange, onEdit, onArchive, onRestore, onDelete,
  onComment, onNewTask, onNotesChange,
}: Props) {
  const [showArchived, setShowArchived] = useState(false);
  const [activeSection, setActiveSection] = useState<'tasks' | 'priority'>('tasks');
  const today   = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === today;

  const activeTasks = tasks.filter(t => !t.archived);
  const prioritySorted = [...activeTasks].sort((a, b) => {
    const po = { High: 0, Medium: 1, Low: 2 };
    return po[a.priority] - po[b.priority] || new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const card = {
    background: dark ? 'rgba(17,24,39,0.8)' : '#fff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
    borderRadius: '20px', padding: '16px 18px',
    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(13,27,42,0.06)',
    marginBottom: '14px',
  };

  const tabStyle = (active: boolean) => ({
    padding: '7px 14px', borderRadius: '10px', fontSize: '13px',
    fontWeight: '600' as const, cursor: 'pointer' as const, border: 'none',
    background: active ? (dark ? '#1e3a5f' : '#163a63') : 'transparent',
    color: active ? '#fff' : (dark ? '#64748b' : '#94a3b8'), transition: 'all 0.2s',
  });

  return (
    <div className="space-y-3 sm:space-y-4 animate-fade-in">
      <StatsBar stats={stats} dark={dark} />
      <FilterPanel filters={filters} onChange={onFiltersChange} dark={dark}
        showArchived={showArchived} onToggleArchived={() => setShowArchived(!showArchived)}
        resultCount={activeTasks.length} />

      <div style={card}>
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-bold text-xl" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
              {isToday ? "Today's Dashboard" : `Tasks for ${selectedDate}`}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
              Daily planning, approvals, follow-ups & coordination
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
              <button style={tabStyle(activeSection === 'tasks')} onClick={() => setActiveSection('tasks')}>All Tasks</button>
              <button style={tabStyle(activeSection === 'priority')} onClick={() => setActiveSection('priority')}>Priority</button>
            </div>
            <button onClick={onNewTask}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>
              ✨ New Task
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3 text-sm">
          {[{ color: '#ef4444', label: 'High' }, { color: '#f59e0b', label: 'Medium' }, { color: '#22c55e', label: 'Low' }].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span style={{ color: dark ? '#64748b' : '#94a3b8' }}>{label}</span>
            </div>
          ))}
          <span className="ml-auto text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>Tap ⋯ for actions</span>
        </div>

        {activeSection === 'tasks' && (
          activeTasks.length === 0
            ? <div className="text-center py-16"><div className="text-5xl mb-4">📋</div><p className="text-base" style={{ color: dark ? '#475569' : '#94a3b8' }}>No active tasks</p></div>
            : activeTasks.map(task => <TaskRow key={task.id} task={task} currentUser={currentUser} canEdit={true} dark={dark} onStatusChange={onStatusChange} onEdit={onEdit} onArchive={onArchive} onRestore={onRestore} onDelete={onDelete} onComment={onComment} />)
        )}

        {activeSection === 'priority' && (['High', 'Medium', 'Low'] as const).map(p => {
          const group = prioritySorted.filter(t => t.priority === p);
          if (!group.length) return null;
          const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
          return (
            <div key={p} className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: colors[p] }} />
                <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors[p] }}>
                  {p} — {group.length} task{group.length !== 1 ? 's' : ''}
                </h3>
              </div>
              {group.map(task => <TaskRow key={task.id} task={task} currentUser={currentUser} canEdit={true} dark={dark} onStatusChange={onStatusChange} onEdit={onEdit} onArchive={onArchive} onRestore={onRestore} onDelete={onDelete} onComment={onComment} />)}
            </div>
          );
        })}
      </div>

      {showArchived && (
        <div style={{ ...card, marginBottom: 0 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base" style={{ color: dark ? '#94a3b8' : '#64748b' }}>📦 Archived Tasks</h3>
            <button onClick={() => setShowArchived(false)} className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>Hide</button>
          </div>
          {archivedTasks.length === 0
            ? <p className="text-center py-6 text-sm" style={{ color: dark ? '#475569' : '#94a3b8' }}>No archived tasks</p>
            : archivedTasks.map(task => <TaskRow key={task.id} task={task} currentUser={currentUser} canEdit={true} dark={dark} onStatusChange={onStatusChange} onEdit={onEdit} onArchive={onArchive} onRestore={onRestore} onDelete={onDelete} onComment={onComment} />)
          }
        </div>
      )}

      <NotesSection notes={notes} date={selectedDate} onChange={onNotesChange} dark={dark} />
    </div>
  );
}
