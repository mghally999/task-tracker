import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Priority, TaskStatus, Category } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-AE', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

export function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' });
  } catch { return ts; }
}

export function formatDateTime(ts: string): string {
  try {
    return new Date(ts).toLocaleString('en-AE', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return ts; }
}

export function timeAgo(ts: string): string {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function isOverdue(date: string, status: TaskStatus): boolean {
  return date < todayISO() && status !== 'done';
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string; darkBg: string; darkColor: string }> = {
  High: {
    label: 'High', color: '#b42318', bg: '#fff1f0', border: '#fca5a5',
    darkBg: 'rgba(180,35,24,0.15)', darkColor: '#fca5a5',
  },
  Medium: {
    label: 'Medium', color: '#92400e', bg: '#fffbeb', border: '#fde68a',
    darkBg: 'rgba(146,64,14,0.15)', darkColor: '#fde68a',
  },
  Low: {
    label: 'Low', color: '#166534', bg: '#f0fdf4', border: '#86efac',
    darkBg: 'rgba(22,101,52,0.15)', darkColor: '#86efac',
  },
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; darkBg: string; darkColor: string }> = {
  pending: { label: 'Pending', color: '#991b1b', bg: '#fff1f0', darkBg: 'rgba(153,27,27,0.2)', darkColor: '#fca5a5' },
  progress: { label: 'In Progress', color: '#1d4ed8', bg: '#eff6ff', darkBg: 'rgba(29,78,216,0.2)', darkColor: '#93c5fd' },
  done: { label: 'Completed', color: '#166534', bg: '#f0fdf4', darkBg: 'rgba(22,101,52,0.2)', darkColor: '#86efac' },
  hold: { label: 'Waiting', color: '#92400e', bg: '#fffbeb', darkBg: 'rgba(146,64,14,0.2)', darkColor: '#fde68a' },
};

export const CATEGORIES: Category[] = [
  'CEO Meeting', 'Follow-up', 'Approval', 'Travel',
  'Communication', 'Confidential', 'Personal Assistance', 'PRO & Compliance',
];

export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
export const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'progress', label: 'In Progress' },
  { value: 'done', label: 'Completed' },
  { value: 'hold', label: 'Waiting' },
];

export function getRowAccent(priority: Priority): { border: string; bg: string } {
  if (priority === 'High') return { border: '#ef4444', bg: 'rgba(239,68,68,0.04)' };
  if (priority === 'Medium') return { border: '#f59e0b', bg: 'rgba(245,158,11,0.04)' };
  return { border: '#22c55e', bg: 'rgba(34,197,94,0.04)' };
}
