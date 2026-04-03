import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { store } from '@/lib/store';
import { broadcast } from '@/lib/broadcast';

export async function GET(request: Request) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const messages = await store.getChatMessages(50);
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { text } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: 'Text required' }, { status: 400 });
    const message = await store.addChatMessage({
      userId: auth.userId, userName: auth.name, userRole: auth.role, text: text.trim(),
    });
    broadcast({ type: 'chat_message', payload: message }, auth.userId);
    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }
}
