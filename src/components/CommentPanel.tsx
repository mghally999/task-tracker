'use client';
import { useState, useRef, useEffect } from 'react';
import type { Task, User, Comment } from '@/types';
import { timeAgo, formatDateTime } from '@/lib/utils';

interface Props {
  task: Task | null;
  currentUser: User;
  onClose: () => void;
  onAddComment: (taskId: string, text: string) => Promise<void>;
  dark: boolean;
}

export function CommentPanel({ task, currentUser, onClose, onAddComment, dark }: Props) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isOpen = !!task;

  useEffect(() => {
    if (task) {
      setText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [task?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [task?.comments?.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !text.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment(task.id, text.trim());
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`slide-panel ${isOpen ? 'open' : ''} flex flex-col`}
        style={{
          background: dark ? '#111827' : '#fff',
          borderLeftColor: dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-start justify-between"
          style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider mb-1"
              style={{ color: dark ? '#64748b' : '#94a3b8' }}>Comments</div>
            <h3 className="font-semibold text-sm leading-snug truncate"
              style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
              {task?.name || ''}
            </h3>
          </div>
          <button onClick={onClose}
            className="ml-3 w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all hover:opacity-70"
            style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b' }}>
            ×
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!task?.comments?.length && (
            <div className="text-center py-12">
              <div className="text-3xl mb-3">💬</div>
              <p className="text-sm" style={{ color: dark ? '#475569' : '#94a3b8' }}>
                No comments yet.<br />Be the first to leave a note.
              </p>
            </div>
          )}
          {(task?.comments || []).map((comment: Comment) => {
            const isMine = comment.userId === currentUser.id;
            const isCEO = comment.userRole === 'ceo';
            const color = isCEO ? '#3b82f6' : '#f59e0b';

            return (
              <div key={comment.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: color }}>
                  {comment.userName.charAt(0)}
                </div>

                {/* Bubble */}
                <div className={`max-w-[240px] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: dark ? '#94a3b8' : '#64748b' }}>
                      {comment.userName}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: isCEO ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', color: isCEO ? '#60a5fa' : '#fbbf24', fontSize: '10px' }}>
                      {isCEO ? '👔 CEO' : '💼 EA'}
                    </span>
                  </div>
                  <div className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: isMine
                        ? (dark ? 'rgba(59,130,246,0.2)' : '#eff6ff')
                        : (dark ? 'rgba(255,255,255,0.06)' : '#f8fafc'),
                      color: dark ? '#e2e8f0' : '#334155',
                      border: `1px solid ${isMine ? (dark ? 'rgba(59,130,246,0.3)' : '#bfdbfe') : (dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0')}`,
                      borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    }}>
                    {comment.text}
                  </div>
                  <span className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ background: currentUser.color }}>
              {currentUser.initials}
            </div>
            <div className="flex-1 flex gap-2">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
                placeholder="Add a comment… (Enter to send)"
                rows={2}
                className="flex-1 text-sm resize-none"
                style={{
                  background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  color: dark ? '#f1f5f9' : '#0d1b2a',
                  borderColor: dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                  minHeight: '52px',
                }}
              />
              <button type="submit" disabled={submitting || !text.trim()}
                className="w-9 h-9 self-end rounded-xl flex items-center justify-center text-white transition-all hover:opacity-80 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#163a63,#244f80)', flexShrink: 0 }}>
                {submitting ? '…' : '↑'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
