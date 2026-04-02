import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { store } from '@/lib/store';
import { broadcast } from '@/lib/broadcast';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const comments = store.getComments(params.id);
  return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { text } = await request.json();
    if (!text?.trim()) return NextResponse.json({ error: 'Comment text required' }, { status: 400 });

    const comment = store.addComment(params.id, {
      taskId: params.id,
      userId: auth.userId,
      userName: auth.name,
      userRole: auth.role,
      text: text.trim(),
    });
    if (!comment) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    broadcast({ type: 'comment_added', payload: { taskId: params.id, comment } }, auth.userId);

    return NextResponse.json({ comment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
