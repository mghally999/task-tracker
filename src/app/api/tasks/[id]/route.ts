import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { store } from '@/lib/store';
import { broadcast } from '@/lib/broadcast';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const task = await store.getTask(params.id);
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
    if (action === 'archive')      task = await store.archiveTask(params.id);
    else if (action === 'restore') task = await store.restoreTask(params.id);
    else if (action === 'pin')     task = await store.pinTask(params.id, updates.pinned);
    else                           task = await store.updateTask(params.id, updates);
    if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    broadcast({ type: 'task_updated', payload: task }, auth.userId);
    return NextResponse.json({ task });
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Both Mr. Mohammed and Darlene can delete
  const deleted = await store.deleteTask(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  broadcast({ type: 'task_deleted', payload: { id: params.id } }, auth.userId);
  return NextResponse.json({ ok: true });
}
