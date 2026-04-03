'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Task, TaskStatus, TaskFilters, DashboardNotes } from '@/types';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTasks } from '@/hooks/useTasks';
import { Navbar } from '@/components/Navbar';
import { TaskForm } from '@/components/TaskForm';
import { CommentPanel } from '@/components/CommentPanel';
import { LiveCursors } from '@/components/LiveCursors';
import { CEODashboard } from '@/components/CEODashboard';
import { AssistantDashboard } from '@/components/AssistantDashboard';
import { PDFButton } from '@/components/PDFExport';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]     = useState<User | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [dark, setDark]     = useState(true);
  const [mounted, setMounted] = useState(false);
  const [view, setView]     = useState<'full' | 'ceo'>('full');

  const [showForm, setShowForm]     = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [commentTask, setCommentTask] = useState<Task | null>(null);
  const [filters, setFilters]       = useState<TaskFilters>({});

  const tasksMgr = useTasks();
  const ws       = useWebSocket(token);

  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'success' | 'error' }[]>([]);
  const toast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme !== 'light';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    setMounted(true);

    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json();
        setUser(data.user);
        setToken(data.token || document.cookie.match(/token=([^;]+)/)?.[1] || null);
        // CEO defaults to CEO view, assistant to full view
        setView(data.user.role === 'ceo' ? 'ceo' : 'full');
      } catch { router.push('/login'); }
    })();
  }, [router]);

  useEffect(() => { if (user) tasksMgr.fetchTasks(filters); }, [user]);
  useEffect(() => { if (user) tasksMgr.fetchTasks(filters); }, [filters]);

  // WS events
  useEffect(() => {
    const unsubs = [
      ws.on('initial_state', (payload) => {
        if (payload?.tasks) tasksMgr.setTasks(payload.tasks.filter((t: Task) => !t.archived));
        if (payload?.tasks) tasksMgr.setArchivedTasks(payload.tasks.filter((t: Task) => t.archived));
      }),
      ws.on('task_created', (payload) => { tasksMgr.applyWSEvent('task_created', payload); toast(`New task: ${payload?.name}`); }),
      ws.on('task_updated', (payload) => { tasksMgr.applyWSEvent('task_updated', payload); }),
      ws.on('task_deleted', (payload) => { tasksMgr.applyWSEvent('task_deleted', payload); }),
      ws.on('comment_added', (payload) => {
        tasksMgr.applyWSEvent('comment_added', payload);
        if (commentTask?.id === payload?.taskId) {
          setCommentTask(prev => prev ? { ...prev, comments: [...(prev.comments || []), payload.comment] } : null);
        }
      }),
      ws.on('notes_updated', (payload) => { tasksMgr.applyWSEvent('notes_updated', payload); }),
    ];
    return () => unsubs.forEach(fn => fn && fn());
  }, [ws.on, commentTask]);

  useEffect(() => {
    if (commentTask) {
      const live = [...tasksMgr.tasks, ...tasksMgr.archivedTasks].find(t => t.id === commentTask.id);
      if (live && live.comments?.length !== commentTask.comments?.length) setCommentTask(live);
    }
  }, [tasksMgr.tasks, tasksMgr.archivedTasks]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    ws.sendCursor(e.clientX, e.clientY);
  }, [ws.sendCursor]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // ── Task handlers ──────────────────────────────────────────────────────────
  const handleSaveTask = async (data: Partial<Task>) => {
    try {
      if (editingTask) {
        await tasksMgr.updateTask(editingTask.id, data);
        toast('Task updated ✓');
      } else {
        await tasksMgr.createTask(data);
        toast('Task created ✓');
      }
      setEditingTask(null); setShowForm(false);
    } catch { toast('Failed to save task', 'error'); }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try { await tasksMgr.updateTask(id, { status }); }
    catch { toast('Failed to update status', 'error'); }
  };

  const handleArchive = async (id: string) => {
    try { await tasksMgr.archiveTask(id); toast('Task archived'); }
    catch { toast('Failed to archive', 'error'); }
  };

  const handleRestore = async (id: string) => {
    try { await tasksMgr.restoreTask(id); toast('Task restored ✓'); }
    catch { toast('Failed to restore', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this task?')) return;
    try { await tasksMgr.deleteTask(id); toast('Task deleted'); }
    catch { toast('Failed to delete', 'error'); }
  };

  const handleAddComment = async (taskId: string, text: string) => {
    await tasksMgr.addComment(taskId, text);
  };

  const handleNotesChange = async (updates: Partial<DashboardNotes>) => {
    await tasksMgr.updateNotes(updates);
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: dark ? '#070c14' : '#f0f4f8' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
            style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>ET</div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Shared edit props passed to both CEO and Assistant dashboards
  const editProps = {
    onStatusChange: handleStatusChange,
    onEdit: (task: Task) => { setEditingTask(task); setShowForm(true); },
    onArchive: handleArchive,
    onRestore: handleRestore,
    onDelete: handleDelete,
    onComment: (task: Task) => setCommentTask(task),
    onNewTask: () => { setEditingTask(null); setShowForm(true); },
    onNotesChange: handleNotesChange,
  };

  return (
    <div className="min-h-screen" style={{ background: dark ? '#070c14' : '#f0f4f8' }} onMouseMove={handleMouseMove}>

      {/* Navbar with PDF button */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Navbar
            user={user} onlineUsers={ws.onlineUsers} connected={ws.connected}
            dark={dark} onToggleTheme={toggleTheme} onLogout={handleLogout}
            view={view} onToggleView={() => setView(v => v === 'full' ? 'ceo' : 'full')}
          />
        </div>
      </div>

      {/* PDF button — floats top right below navbar */}
      <div className="fixed top-16 right-6 z-30">
        <PDFButton
          tasks={tasksMgr.tasks}
          archivedTasks={tasksMgr.archivedTasks}
          notes={tasksMgr.notes}
          userName={user.name}
          dark={dark}
        />
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-6 pt-8">
        {view === 'ceo' && (
          <CEODashboard
            tasks={tasksMgr.tasks}
            archivedTasks={tasksMgr.archivedTasks}
            stats={tasksMgr.stats}
            notes={tasksMgr.notes}
            currentUser={user}
            onlineUsers={ws.onlineUsers}
            dark={dark}
            {...editProps}
          />
        )}
        {view === 'full' && (
          <AssistantDashboard
            tasks={tasksMgr.tasks}
            archivedTasks={tasksMgr.archivedTasks}
            stats={tasksMgr.stats}
            notes={tasksMgr.notes}
            currentUser={user}
            dark={dark}
            filters={filters}
            onFiltersChange={setFilters}
            {...editProps}
          />
        )}
      </main>

      {showForm && (
        <TaskForm task={editingTask} onSave={handleSaveTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }} dark={dark} />
      )}

      <CommentPanel task={commentTask} currentUser={user}
        onClose={() => setCommentTask(null)} onAddComment={handleAddComment} dark={dark} />

      <LiveCursors cursors={ws.cursors} currentUserId={user.id} />

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl animate-slide-up"
            style={{
              background: t.type === 'success' ? (dark ? 'rgba(22,101,52,0.95)' : '#166534') : (dark ? 'rgba(153,27,27,0.95)' : '#991b1b'),
              color: '#fff', backdropFilter: 'blur(12px)',
            }}>
            {t.type === 'success' ? '✓ ' : '✕ '}{t.msg}
          </div>
        ))}
      </div>

      {!ws.connected && (
        <div className="fixed top-16 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <div className="px-4 py-2 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}>
            ⚠️ Reconnecting…
          </div>
        </div>
      )}
    </div>
  );
}
