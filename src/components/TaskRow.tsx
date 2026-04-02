'use client';
import { useState } from 'react';
import type { Task, TaskStatus, User } from '@/types';
import { PRIORITY_CONFIG, STATUS_CONFIG, formatDate, isOverdue } from '@/lib/utils';

interface Props {
  task: Task;
  currentUser: User;
  canEdit: boolean;
  dark: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onComment: (task: Task) => void;
}

export function TaskRow({ task, currentUser, canEdit, dark, onStatusChange, onEdit, onArchive, onRestore, onDelete, onComment }: Props) {
  const [expanded, setExpanded] = useState(false);
  const overdue = isOverdue(task.date, task.status);
  const pc = PRIORITY_CONFIG[task.priority];
  const sc = STATUS_CONFIG[task.status];
  const commentCount = task.comments?.length || 0;

  const accentColor = task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#22c55e';

  const rowBg = task.archived
    ? (dark ? 'rgba(148,163,184,0.05)' : 'rgba(148,163,184,0.05)')
    : overdue
    ? (dark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.03)')
    : dark ? 'rgba(255,255,255,0.015)' : '#fff';

  return (
    <div
      className="group relative rounded-xl overflow-hidden transition-all hover:shadow-md mb-2"
      style={{
        background: rowBg,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#e8edf4'}`,
        borderLeft: `4px solid ${task.archived ? '#94a3b8' : accentColor}`,
        opacity: task.archived ? 0.7 : 1,
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Priority dot + pin */}
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
        </div>

        {/* Task name + owner */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-sm leading-snug"
              style={{ color: dark ? '#f1f5f9' : '#0d1b2a', textDecoration: task.status === 'done' ? 'line-through' : 'none', opacity: task.status === 'done' ? 0.6 : 1 }}>
              {task.pinned && <span className="mr-1">📌</span>}
              {task.name}
            </span>
          </div>
          {task.owner && (
            <div className="mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}` }}>
                {task.owner}
              </span>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="hidden md:block flex-shrink-0 text-right min-w-[90px]">
          <div className="text-xs font-semibold" style={{ color: overdue ? '#f43f5e' : (dark ? '#94a3b8' : '#475569') }}>
            {overdue && '⚠️ '}{formatDate(task.date)}
          </div>
          {task.time && (
            <div className="text-xs mt-0.5" style={{ color: dark ? '#475569' : '#94a3b8' }}>{task.time}</div>
          )}
        </div>

        {/* Category */}
        <div className="hidden lg:block flex-shrink-0">
          <span className="text-xs px-2 py-1 rounded-lg font-medium"
            style={{ background: dark ? 'rgba(59,130,246,0.1)' : '#eff6ff', color: dark ? '#93c5fd' : '#1d4ed8', border: `1px solid ${dark ? 'rgba(59,130,246,0.2)' : '#bfdbfe'}` }}>
            {task.category}
          </span>
        </div>

        {/* Priority badge */}
        <div className="flex-shrink-0">
          <span className={`badge-${task.priority.toLowerCase()} text-xs px-2 py-1 rounded-lg font-semibold`}>
            {task.priority}
          </span>
        </div>

        {/* Status selector */}
        <div className="flex-shrink-0">
          {canEdit ? (
            <select
              value={task.status}
              onChange={e => onStatusChange(task.id, e.target.value as TaskStatus)}
              onClick={e => e.stopPropagation()}
              className={`badge-${task.status} text-xs px-2 py-1 rounded-lg font-semibold cursor-pointer border-0 outline-none`}
              style={{ background: 'inherit', minWidth: '90px' }}>
              <option value="pending">Pending</option>
              <option value="progress">In Progress</option>
              <option value="done">Completed</option>
              <option value="hold">Waiting</option>
            </select>
          ) : (
            <span className={`badge-${task.status} text-xs px-2 py-1 rounded-lg font-semibold`}>
              {STATUS_CONFIG[task.status].label}
            </span>
          )}
        </div>

        {/* Comment button */}
        <button onClick={e => { e.stopPropagation(); onComment(task); }}
          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-70"
          style={{ background: commentCount > 0 ? (dark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : (dark ? 'rgba(255,255,255,0.05)' : '#f8fafc'), color: commentCount > 0 ? '#3b82f6' : (dark ? '#64748b' : '#94a3b8') }}>
          💬 {commentCount > 0 ? commentCount : ''}
        </button>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && !task.archived && (
            <button onClick={e => { e.stopPropagation(); onEdit(task); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-70"
              style={{ background: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: '#3b82f6' }}>
              ✏️
            </button>
          )}
          {!task.archived ? (
            <button onClick={e => { e.stopPropagation(); onArchive(task.id); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-70"
              style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b' }}
              title="Archive">
              📦
            </button>
          ) : (
            <button onClick={e => { e.stopPropagation(); onRestore(task.id); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-70"
              style={{ background: dark ? 'rgba(34,197,94,0.1)' : '#f0fdf4', color: '#22c55e' }}
              title="Restore">
              ↩️
            </button>
          )}
          {canEdit && (
            <button onClick={e => { e.stopPropagation(); onDelete(task.id); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-70"
              style={{ background: dark ? 'rgba(239,68,68,0.1)' : '#fff1f0', color: '#ef4444' }}
              title="Delete">
              🗑
            </button>
          )}
        </div>
      </div>

      {/* Expanded notes */}
      {expanded && task.notes && (
        <div className="px-5 pb-3 pt-0">
          <div className="text-xs leading-relaxed ml-5 pl-3 border-l-2"
            style={{ color: dark ? '#94a3b8' : '#64748b', borderColor: accentColor + '40' }}>
            {task.notes}
          </div>
          {task.updatedAt && (
            <div className="text-xs mt-1.5 ml-5" style={{ color: dark ? '#475569' : '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              Updated: {new Date(task.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
