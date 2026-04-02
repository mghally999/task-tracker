import jwt from 'jsonwebtoken';
import type { AuthPayload, User } from '../types';

export const JWT_SECRET = process.env.JWT_SECRET || 'ceo-tracker-super-secret-key-2026';
export const JWT_EXPIRES = '12h';

// Hardcoded users — in production, use a database
export const USERS: Record<string, User & { password: string }> = {
  ceo: {
    id: 'user-ceo',
    name: 'Mr. Mohammad',
    role: 'ceo',
    color: '#3b82f6',
    initials: 'MM',
    password: 'ceo2026',
  },
  darlene: {
    id: 'user-darlene',
    name: 'Darlene',
    role: 'assistant',
    color: '#f59e0b',
    initials: 'DA',
    password: 'assist2026',
  },
};

export function signToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
}

export function authenticate(request: Request): AuthPayload | null {
  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromCookies(cookieHeader);
  if (!token) return null;
  return verifyToken(token);
}
