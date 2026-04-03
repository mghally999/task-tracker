'use client';
import { useState, useCallback } from 'react';
import type { Task, TaskFilters, DailyNotes } from '@/types';

export function useTasks() {
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [stats, setStats]               = useState<Record<string, number>>({});
  const [loading, setLoading]           = useState(false);

  const fetchTasks = useCallback(async (filters: TaskFilters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search)   params.set('search',   filters.search);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.status)   params.set('status',   filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo)   params.set('dateTo',   filters.dateTo);

      const [activeRes, archivedRes] = await Promise.all([
        fetch(`/api/tasks?${params}`),
        fetch('/api/tasks?archived=true'),
      ]);
      if (activeRes.ok)   { const d = await activeRes.json();   setTasks(d.tasks || []);         setStats(d.stats || {}); }
      if (archivedRes.ok) { const d = await archivedRes.json(); setArchivedTasks(d.tasks || []); }
    } finally { setLoading(false); }
  }, []);

  const createTask = useCallback(async (data: Partial<Task>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create task');
    const { task } = await res.json();
    setTasks(prev => [task, ...prev]);
    return task as Task;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task> & { action?: string }) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setArchivedTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
    });
    if (!res.ok) { await fetchTasks(); throw new Error('Failed to update'); }
    const { task } = await res.json();
    setTasks(prev => prev.map(t => t.id === id ? task : t));
    return task as Task;
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) { await fetchTasks(); throw new Error('Failed to delete'); }
  }, [fetchTasks]);

  const archiveTask = useCallback(async (id: string) => {
    const task = await updateTask(id, { action: 'archive' } as any);
    setTasks(prev => prev.filter(t => t.id !== id));
    setArchivedTasks(prev => [task, ...prev]);
    return task;
  }, [updateTask]);

  const restoreTask = useCallback(async (id: string) => {
    const task = await updateTask(id, { action: 'restore' } as any);
    setArchivedTasks(prev => prev.filter(t => t.id !== id));
    setTasks(prev => [task, ...prev]);
    return task;
  }, [updateTask]);

  const addComment = useCallback(async (taskId: string, text: string) => {
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    const { comment } = await res.json();
    const upd = (list: Task[]) => list.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t);
    setTasks(upd); setArchivedTasks(upd);
    return comment;
  }, []);

  const applyWSEvent = useCallback((type: string, payload: any) => {
    switch (type) {
      case 'task_created':
        setTasks(prev => prev.find(t => t.id === payload.id) ? prev : [payload, ...prev]);
        break;
      case 'task_updated':
        if (payload.archived) {
          setTasks(prev => prev.filter(t => t.id !== payload.id));
          setArchivedTasks(prev => {
            const exists = prev.find(t => t.id === payload.id);
            return exists ? prev.map(t => t.id === payload.id ? payload : t) : [payload, ...prev];
          });
        } else {
          setTasks(prev => {
            const exists = prev.find(t => t.id === payload.id);
            return exists ? prev.map(t => t.id === payload.id ? payload : t) : [payload, ...prev];
          });
          setArchivedTasks(prev => prev.filter(t => t.id !== payload.id));
        }
        break;
      case 'task_deleted':
        setTasks(prev => prev.filter(t => t.id !== payload.id));
        setArchivedTasks(prev => prev.filter(t => t.id !== payload.id));
        break;
      case 'comment_added': {
        const upd = (list: Task[]) => list.map(t => t.id === payload.taskId
          ? { ...t, comments: [...(t.comments || []), payload.comment] } : t);
        setTasks(upd); setArchivedTasks(upd);
        break;
      }
    }
  }, []);

  return {
    tasks, archivedTasks, stats, loading,
    fetchTasks, createTask, updateTask, deleteTask,
    archiveTask, restoreTask, addComment, applyWSEvent,
    setTasks, setArchivedTasks,
  };
}
