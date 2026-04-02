import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { store } from '@/lib/store';
import { broadcast } from '@/lib/broadcast';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const task = store.getTask(params.id);
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ task });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { action, ...updates } = body;

    let task;
    if (action === 'archive') task = store.archiveTask(params.id);
    else if (action === 'restore') task = store.restoreTask(params.id);
    else if (action === 'pin') task = store.pinTask(params.id, updates.pinned);
    else task = store.updateTask(params.id, updates);

    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    broadcast({ type: 'task_updated', payload: task }, auth.userId);

    return NextResponse.json({ task });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'assistant') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const deleted = store.deleteTask(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  broadcast({ type: 'task_deleted', payload: { id: params.id } }, auth.userId);

  return NextResponse.json({ ok: true });
}
