import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { store } from '@/lib/store';
import { broadcast } from '@/lib/broadcast';
import type { TaskFilters } from '@/types';

export async function GET(request: Request) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filters: TaskFilters = {
    search: searchParams.get('search') || '',
    priority: (searchParams.get('priority') as any) || '',
    status: (searchParams.get('status') as any) || '',
    category: (searchParams.get('category') as any) || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    archived: searchParams.get('archived') === 'true',
  };

  const tasks = store.filterTasks(filters);
  const stats = store.getStats();
  const notes = store.getNotes();
  return NextResponse.json({ tasks, stats, notes });
}

export async function POST(request: Request) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'assistant' && auth.role !== 'ceo') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, date, category, priority, status, time, owner, notes, archived } = body;
    if (!name || !date) return NextResponse.json({ error: 'Name and date required' }, { status: 400 });

    const task = store.createTask({ name, date, category, priority, status, time, owner, notes, archived: archived || false });

    broadcast({ type: 'task_created', payload: task }, auth.userId);

    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
