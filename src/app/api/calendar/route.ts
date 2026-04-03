import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  const auth = authenticate(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const days = await store.getCalendarDays();
  return NextResponse.json({ days });
}
