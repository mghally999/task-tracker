import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { store } from '@/lib/store';
import { broadcast } from '@/lib/broadcast';

export async function GET(request: Request) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ notes: store.getNotes() });
}

export async function PUT(request: Request) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await request.json();
    const notes = store.updateNotes(body);
    broadcast({ type: 'notes_updated', payload: notes }, auth.userId);
    return NextResponse.json({ notes });
  } catch {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }
}
