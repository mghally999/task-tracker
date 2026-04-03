'use client';
import { useState } from 'react';
import type { Task, TaskStatus, User } from '@/types';
import { STATUS_CONFIG, formatDate, isOverdue } from '@/lib/utils';

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
  const [showActions, setShowActions] = useState(false);
  const overdue = isOverdue(task.date, task.status);
  const commentCount = task.comments?.length || 0;
  const accent = task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#22c55e';

  const rowBg = task.archived
    ? (dark ? 'rgba(148,163,184,0.05)' : 'rgba(148,163,184,0.05)')
    : overdue
    ? (dark ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.03)')
    : (dark ? 'rgba(255,255,255,0.02)' : '#fff');

  return (
    <div className="relative rounded-xl mb-2 overflow-hidden transition-all hover:shadow-md"
      style={{
        background: rowBg,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e8edf4'}`,
        borderLeft: `4px solid ${task.archived ? '#94a3b8' : accent}`,
        opacity: task.archived ? 0.75 : 1,
      }}>

      {/* Main row — always visible */}
      <div className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-3">
        {/* Priority dot */}
        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: accent }} />

        {/* Title + owner — clickable to expand */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="font-semibold text-base leading-snug"
            style={{ color: dark ? '#f1f5f9' : '#0d1b2a', textDecoration: task.status === 'done' ? 'line-through' : 'none', opacity: task.status === 'done' ? 0.6 : 1 }}>
            {task.pinned && '📌 '}{task.name}
          </div>
          {task.owner && (
            <div className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}` }}>
              {task.owner}
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {/* Date — hidden on mobile */}
          <div className="hidden sm:block text-right">
            <div className="text-xs font-semibold" style={{ color: overdue ? '#f43f5e' : (dark ? '#94a3b8' : '#475569') }}>
              {overdue && '⚠️ '}{formatDate(task.date)}
            </div>
            {task.time && <div className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>{task.time}</div>}
          </div>

          {/* Category — hidden on small screens */}
          <span className="hidden lg:inline text-xs px-2 py-1 rounded-lg font-medium"
            style={{ background: dark ? 'rgba(59,130,246,0.1)' : '#eff6ff', color: dark ? '#93c5fd' : '#1d4ed8', border: `1px solid ${dark ? 'rgba(59,130,246,0.2)' : '#bfdbfe'}` }}>
            {task.category}
          </span>

          {/* Priority */}
          <span className={`badge-${task.priority} text-xs px-2 py-1 rounded-lg font-bold`}>
            {task.priority}
          </span>

          {/* Status */}
          {canEdit ? (
            <select value={task.status} onChange={e => onStatusChange(task.id, e.target.value as TaskStatus)}
              onClick={e => e.stopPropagation()}
              className={`badge-${task.status} text-xs px-2 py-1 rounded-lg font-bold cursor-pointer border-0 outline-none`}
              style={{ background: 'inherit', minWidth: '88px', fontSize: '12px' }}>
              <option value="pending">Pending</option>
              <option value="progress">In Progress</option>
              <option value="done">Completed</option>
              <option value="hold">Waiting</option>
            </select>
          ) : (
            <span className={`badge-${task.status} text-xs px-2 py-1 rounded-lg font-bold`}>
              {STATUS_CONFIG[task.status]?.label}
            </span>
          )}

          {/* Comment button */}
          <button onClick={e => { e.stopPropagation(); onComment(task); }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-75"
            style={{ background: commentCount > 0 ? (dark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : (dark ? 'rgba(255,255,255,0.06)' : '#f8fafc'), color: commentCount > 0 ? '#3b82f6' : (dark ? '#64748b' : '#94a3b8') }}>
            💬{commentCount > 0 ? ` ${commentCount}` : ''}
          </button>

          {/* Actions button (mobile-first) */}
          <div className="relative">
            <button onClick={e => { e.stopPropagation(); setShowActions(!showActions); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:opacity-75"
              style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b' }}>
              ⋯
            </button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden shadow-xl z-40 min-w-[140px]"
                  style={{ background: dark ? '#1a2236' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}` }}>
                  {canEdit && !task.archived && (
                    <button onClick={e => { e.stopPropagation(); setShowActions(false); onEdit(task); }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 hover:opacity-75"
                      style={{ color: '#3b82f6' }}>✏️ Edit</button>
                  )}
                  {!task.archived ? (
                    <button onClick={e => { e.stopPropagation(); setShowActions(false); onArchive(task.id); }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 hover:opacity-75"
                      style={{ color: dark ? '#94a3b8' : '#64748b' }}>📦 Archive</button>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); setShowActions(false); onRestore(task.id); }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 hover:opacity-75"
                      style={{ color: '#22c55e' }}>↩️ Restore</button>
                  )}
                  {canEdit && (
                    <button onClick={e => { e.stopPropagation(); setShowActions(false); onDelete(task.id); }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 hover:opacity-75"
                      style={{ color: '#ef4444' }}>🗑 Delete</button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Expanded notes */}
      {expanded && (
        <div className="px-4 pb-3 pt-0">
          {/* Mobile date */}
          <div className="sm:hidden text-xs mb-2 font-semibold" style={{ color: overdue ? '#f43f5e' : (dark ? '#94a3b8' : '#475569') }}>
            {overdue && '⚠️ '}{formatDate(task.date)}{task.time && ` · ${task.time}`}
          </div>
          {/* Mobile category */}
          <div className="lg:hidden mb-2">
            <span className="text-xs px-2 py-1 rounded-lg font-medium"
              style={{ background: dark ? 'rgba(59,130,246,0.1)' : '#eff6ff', color: dark ? '#93c5fd' : '#1d4ed8' }}>
              {task.category}
            </span>
          </div>
          {task.notes && (
            <div className="text-sm leading-relaxed ml-4 pl-3 border-l-2"
              style={{ color: dark ? '#94a3b8' : '#64748b', borderColor: accent + '50' }}>
              {task.notes}
            </div>
          )}
          {task.updatedAt && (
            <div className="text-xs mt-1.5 ml-4" style={{ color: dark ? '#475569' : '#94a3b8', fontFamily: 'monospace' }}>
              Updated: {new Date(task.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
