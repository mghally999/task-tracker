'use client';
import { useState } from 'react';
import type { Task, User, TaskStatus, DashboardNotes } from '@/types';
import { StatsBar } from './StatsBar';
import { TaskRow } from './TaskRow';
import { FilterPanel } from './FilterPanel';
import { NotesSection } from './NotesSection';
import type { TaskFilters } from '@/types';

interface Props {
  tasks: Task[];
  archivedTasks: Task[];
  stats: Record<string, number>;
  notes: DashboardNotes;
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
  onNotesChange: (updates: Partial<DashboardNotes>) => void;
}

export function AssistantDashboard({
  tasks, archivedTasks, stats, notes, currentUser, dark, filters,
  onFiltersChange, onStatusChange, onEdit, onArchive, onRestore, onDelete,
  onComment, onNewTask, onNotesChange,
}: Props) {
  const [showArchived, setShowArchived] = useState(false);
  const [activeSection, setActiveSection] = useState<'tasks' | 'priority' | 'archived'>('tasks');

  const activeTasks = tasks.filter(t => !t.archived);
  const prioritySorted = [...activeTasks].sort((a, b) => {
    const po = { High: 0, Medium: 1, Low: 2 };
    return po[a.priority] - po[b.priority] || new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const cardStyle = {
    background: dark ? 'rgba(17,24,39,0.8)' : '#fff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
    borderRadius: '20px',
    padding: '20px',
    boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(13,27,42,0.06)',
    marginBottom: '16px',
  };

  const tabStyle = (active: boolean) => ({
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600' as const,
    cursor: 'pointer' as const,
    border: 'none',
    background: active ? (dark ? '#1e3a5f' : '#163a63') : 'transparent',
    color: active ? '#fff' : (dark ? '#64748b' : '#94a3b8'),
    transition: 'all 0.2s',
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <StatsBar stats={stats} dark={dark} />

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onChange={onFiltersChange}
        dark={dark}
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived(!showArchived)}
        resultCount={activeTasks.length}
      />

      {/* Main task area */}
      <div style={cardStyle}>
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-display font-bold text-lg" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
              CEO Priority Dashboard
            </h2>
            <p className="text-xs mt-0.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
              Daily executive planning, approvals, follow-ups & confidential coordination
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Section tabs */}
            <div className="flex items-center gap-1 rounded-xl p-1"
              style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
              <button style={tabStyle(activeSection === 'tasks')} onClick={() => setActiveSection('tasks')}>All Tasks</button>
              <button style={tabStyle(activeSection === 'priority')} onClick={() => setActiveSection('priority')}>Priority Report</button>
              {showArchived && <button style={tabStyle(activeSection === 'archived')} onClick={() => setActiveSection('archived')}>Archive</button>}
            </div>
            <button onClick={onNewTask}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#163a63,#244f80)', boxShadow: '0 2px 8px rgba(22,58,99,0.3)' }}>
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
          <span className="ml-auto text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>
            Click a row to expand • Hover for actions
          </span>
        </div>

        {/* ALL TASKS view */}
        {activeSection === 'tasks' && (
          <div>
            {activeTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <p className="font-semibold mb-2" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>No tasks match your filters</p>
                <p className="text-sm" style={{ color: dark ? '#475569' : '#94a3b8' }}>Try clearing filters or add a new task</p>
              </div>
            ) : (
              activeTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  currentUser={currentUser}
                  canEdit={true}
                  dark={dark}
                  onStatusChange={onStatusChange}
                  onEdit={onEdit}
                  onArchive={onArchive}
                  onRestore={onRestore}
                  onDelete={onDelete}
                  onComment={onComment}
                />
              ))
            )}
          </div>
        )}

        {/* PRIORITY REPORT view */}
        {activeSection === 'priority' && (
          <div>
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: dark ? 'rgba(59,130,246,0.08)' : '#eff6ff', color: dark ? '#93c5fd' : '#1d4ed8', border: `1px solid ${dark ? 'rgba(59,130,246,0.2)' : '#bfdbfe'}` }}>
              📊 Tasks sorted High → Medium → Low priority for quick management overview
            </div>

            {/* Priority groups */}
            {(['High', 'Medium', 'Low'] as const).map(p => {
              const group = prioritySorted.filter(t => t.priority === p);
              if (!group.length) return null;
              const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
              return (
                <div key={p} className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: colors[p] }} />
                    <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors[p] }}>
                      {p} Priority — {group.length} task{group.length !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  {group.map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      currentUser={currentUser}
                      canEdit={true}
                      dark={dark}
                      onStatusChange={onStatusChange}
                      onEdit={onEdit}
                      onArchive={onArchive}
                      onRestore={onRestore}
                      onDelete={onDelete}
                      onComment={onComment}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ARCHIVE view */}
        {activeSection === 'archived' && showArchived && (
          <div>
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: dark ? 'rgba(148,163,184,0.08)' : '#f8fafc', color: dark ? '#94a3b8' : '#64748b', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}` }}>
              📦 Archived tasks — Restore any task to make it active again
            </div>
            {archivedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📦</div>
                <p style={{ color: dark ? '#475569' : '#94a3b8' }}>No archived tasks</p>
              </div>
            ) : (
              archivedTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  currentUser={currentUser}
                  canEdit={true}
                  dark={dark}
                  onStatusChange={onStatusChange}
                  onEdit={onEdit}
                  onArchive={onArchive}
                  onRestore={onRestore}
                  onDelete={onDelete}
                  onComment={onComment}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Notes section */}
      <NotesSection notes={notes} onChange={onNotesChange} dark={dark} />
    </div>
  );
}
