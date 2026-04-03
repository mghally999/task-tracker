import { NextResponse } from 'next/server';
import { authenticate, USERS } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = Object.values(USERS).find(u => u.id === auth.userId);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
  return NextResponse.json({
    user: { id: user.id, name: user.name, role: user.role, color: user.color, initials: user.initials },
    token,
  });
}
