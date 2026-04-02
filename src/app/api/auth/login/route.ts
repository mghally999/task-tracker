import { NextResponse } from 'next/server';
import { USERS, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const user = USERS[username?.toLowerCase()];
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = signToken({ userId: user.id, role: user.role, name: user.name, color: user.color });
    const res = NextResponse.json({
      user: { id: user.id, name: user.name, role: user.role, color: user.color, initials: user.initials },
      token,
    });
    res.cookies.set('token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 12, path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
