'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Task, TaskStatus, TaskFilters, DailyNotes, ChatMessage } from '@/types';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTasks } from '@/hooks/useTasks';
import { Navbar } from '@/components/Navbar';
import { TaskForm } from '@/components/TaskForm';
import { CommentPanel } from '@/components/CommentPanel';
import { LiveCursors } from '@/components/LiveCursors';
import { CEODashboard } from '@/components/CEODashboard';
import { AssistantDashboard } from '@/components/AssistantDashboard';
import { PDFButton } from '@/components/PDFExport';
import { CalendarPanel } from '@/components/CalendarPanel';
import { LiveChat } from '@/components/LiveChat';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]     = useState<User | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [dark, setDark]     = useState(true);
  const [mounted, setMounted] = useState(false);
  const [view, setView]     = useState<'full' | 'ceo'>('full');

  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [notes, setNotes]   = useState<DailyNotes>({ date: today, summary: '', tomorrow: '' });

  const [showForm, setShowForm]     = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [commentTask, setCommentTask] = useState<Task | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showChat, setShowChat]     = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatUnread, setChatUnread]   = useState(0);
  const [filters, setFilters]       = useState<TaskFilters>({});

  const tasksMgr = useTasks();
  const ws = useWebSocket(token);

  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'success' | 'error' }[]>([]);
  const toast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Load notes for selected date
  const loadNotes = useCallback(async (date: string) => {
    const res = await fetch(`/api/notes?date=${date}`);
    if (res.ok) { const d = await res.json(); setNotes(d.notes); }
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
        setView(data.user.role === 'mohammed' ? 'ceo' : 'full');
      } catch { router.push('/login'); }
    })();
  }, [router]);

  useEffect(() => { if (user) tasksMgr.fetchTasks(filters); }, [user]);
  useEffect(() => { if (user) tasksMgr.fetchTasks(filters); }, [filters]);
  useEffect(() => { if (user) loadNotes(selectedDate); }, [selectedDate, user]);

  // Handle date change — filter tasks by selected date if not today
  const effectiveFilters: TaskFilters = selectedDate !== today
    ? { ...filters, dateFrom: selectedDate, dateTo: selectedDate }
    : filters;

  // WS events
  useEffect(() => {
    const unsubs = [
      ws.on('initial_state', (payload) => {
        if (payload?.tasks) tasksMgr.setTasks(payload.tasks.filter((t: Task) => !t.archived));
        if (payload?.tasks) tasksMgr.setArchivedTasks(payload.tasks.filter((t: Task) => t.archived));
        if (payload?.notes) setNotes(payload.notes);
      }),
      ws.on('task_created', (p) => { tasksMgr.applyWSEvent('task_created', p); toast(`New task: ${p?.name}`); }),
      ws.on('task_updated', (p) => tasksMgr.applyWSEvent('task_updated', p)),
      ws.on('task_deleted', (p) => tasksMgr.applyWSEvent('task_deleted', p)),
      ws.on('comment_added', (p) => {
        tasksMgr.applyWSEvent('comment_added', p);
        if (commentTask?.id === p?.taskId) {
          setCommentTask(prev => prev ? { ...prev, comments: [...(prev.comments || []), p.comment] } : null);
        }
      }),
      ws.on('notes_updated', (p) => { if (p?.date === selectedDate) setNotes(p); }),
      ws.on('chat_message', (p) => {
        setChatMessages(prev => [...prev, p]);
        if (!showChat) setChatUnread(n => n + 1);
      }),
    ];
    return () => unsubs.forEach(fn => fn && fn());
  }, [ws.on, commentTask, selectedDate, showChat]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    ws.sendCursor(e.clientX, e.clientY);
  }, [ws.sendCursor]);

  const toggleTheme = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSaveTask = async (data: Partial<Task>) => {
    try {
      if (editingTask) { await tasksMgr.updateTask(editingTask.id, data); toast('Task updated ✓'); }
      else { await tasksMgr.createTask({ ...data, date: selectedDate }); toast('Task created ✓'); }
      setEditingTask(null); setShowForm(false);
    } catch { toast('Failed to save task', 'error'); }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try { await tasksMgr.updateTask(id, { status }); }
    catch { toast('Failed to update status', 'error'); }
  };

  const handleNotesChange = async (date: string, updates: Partial<DailyNotes>) => {
    const res = await fetch('/api/notes', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, ...updates }),
    });
    if (res.ok) { const d = await res.json(); setNotes(d.notes); }
  };

  // Filtered tasks for the selected date view
  const filteredTasks = selectedDate !== today
    ? tasksMgr.tasks.filter(t => t.date === selectedDate)
    : tasksMgr.tasks;
  const filteredArchived = selectedDate !== today
    ? tasksMgr.archivedTasks.filter(t => t.date === selectedDate)
    : tasksMgr.archivedTasks;

  const editProps = {
    selectedDate,
    onStatusChange: handleStatusChange,
    onEdit: (task: Task) => { setEditingTask(task); setShowForm(true); },
    onArchive: async (id: string) => { try { await tasksMgr.archiveTask(id); toast('Archived'); } catch { toast('Failed', 'error'); } },
    onRestore: async (id: string) => { try { await tasksMgr.restoreTask(id); toast('Restored ✓'); } catch { toast('Failed', 'error'); } },
    onDelete: async (id: string) => {
      if (!confirm('Permanently delete this task?')) return;
      try { await tasksMgr.deleteTask(id); toast('Deleted'); } catch { toast('Failed', 'error'); }
    },
    onComment: (task: Task) => setCommentTask(task),
    onNewTask: () => { setEditingTask(null); setShowForm(true); },
    onNotesChange: handleNotesChange,
  };

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: dark ? '#070c14' : '#f0f4f8' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
            style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>ET</div>
          <div className="flex gap-1">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: dark ? '#070c14' : '#f0f4f8' }} onMouseMove={handleMouseMove}>

      <Navbar user={user} onlineUsers={ws.onlineUsers} connected={ws.connected}
        dark={dark} onToggleTheme={toggleTheme} onLogout={handleLogout}
        view={view} onToggleView={() => setView(v => v === 'full' ? 'ceo' : 'full')}
        selectedDate={selectedDate} onOpenCalendar={() => setShowCalendar(true)}
        onOpenChat={() => { setShowChat(true); setChatUnread(0); }}
        chatUnread={chatUnread} />

      {/* PDF button */}
      <div className="fixed top-16 right-6 z-30 mt-2">
        <PDFButton tasks={tasksMgr.tasks} archivedTasks={tasksMgr.archivedTasks}
          notes={notes} userName={user.name} dark={dark} />
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-6 pt-8">
        {/* Date banner for past days */}
        {selectedDate !== today && (
          <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{ background: dark ? 'rgba(245,158,11,0.08)' : '#fffbeb', border: `1px solid ${dark ? 'rgba(245,158,11,0.2)' : '#fde68a'}` }}>
            <span>📅</span>
            <span className="text-sm font-semibold" style={{ color: dark ? '#fbbf24' : '#92400e' }}>
              Viewing {selectedDate} — showing tasks from this date
            </span>
            <button onClick={() => setSelectedDate(today)}
              className="ml-auto text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: dark ? 'rgba(245,158,11,0.2)' : '#fef3c7', color: '#92400e' }}>
              ← Back to Today
            </button>
          </div>
        )}

        {view === 'ceo' && (
          <CEODashboard tasks={filteredTasks} archivedTasks={filteredArchived}
            stats={tasksMgr.stats} notes={notes} currentUser={user}
            onlineUsers={ws.onlineUsers} dark={dark} {...editProps} />
        )}
        {view === 'full' && (
          <AssistantDashboard tasks={filteredTasks} archivedTasks={filteredArchived}
            stats={tasksMgr.stats} notes={notes} currentUser={user} dark={dark}
            filters={filters} onFiltersChange={setFilters} {...editProps} />
        )}
      </main>

      {showForm && (
        <TaskForm task={editingTask} onSave={handleSaveTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }} dark={dark} />
      )}

      <CommentPanel task={commentTask} currentUser={user}
        onClose={() => setCommentTask(null)}
        onAddComment={async (id, text) => { await tasksMgr.addComment(id, text); }} dark={dark} />

      <LiveCursors cursors={ws.cursors} currentUserId={user.id} />

      {showCalendar && (
        <CalendarPanel dark={dark} selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)} onClose={() => setShowCalendar(false)} />
      )}

      {showChat && (
        <LiveChat currentUser={user} dark={dark}
          onClose={() => { setShowChat(false); setChatUnread(0); }}
          newMessages={chatMessages} />
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl animate-slide-up"
            style={{ background: t.type === 'success' ? (dark ? 'rgba(22,101,52,0.95)' : '#166534') : (dark ? 'rgba(153,27,27,0.95)' : '#991b1b'), color: '#fff', backdropFilter: 'blur(12px)' }}>
            {t.type === 'success' ? '✓ ' : '✕ '}{t.msg}
          </div>
        ))}
      </div>

      {!ws.connected && (
        <div className="fixed top-16 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <div className="px-4 py-2 rounded-full text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}>
            ⚠️ Reconnecting…
          </div>
        </div>
      )}
    </div>
  );
}
