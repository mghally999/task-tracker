import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { store } from '@/lib/store';
import { broadcast } from '@/lib/broadcast';

export async function GET(request: Request) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);
  const notes = await store.getNotes(date);
  return NextResponse.json({ notes });
}

export async function PUT(request: Request) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const { date, ...updates } = body;
    const d = date || new Date().toISOString().slice(0, 10);
    const notes = await store.updateNotes(d, updates);
    broadcast({ type: 'notes_updated', payload: notes }, auth.userId);
    return NextResponse.json({ notes });
  } catch {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }
}
