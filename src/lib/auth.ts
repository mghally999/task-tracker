import jwt from 'jsonwebtoken';
import type { AuthPayload, User } from '../types';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-before-production';
export const JWT_EXPIRES = '12h';

function getUsers(): Record<string, User & { password: string }> {
  return {
    mohammed: {
      id: 'user-mohammed',
      name: 'Mr. Mohammed',
      role: 'mohammed',
      color: '#3b82f6',
      initials: 'MM',
      password: process.env.CEO_PASSWORD || 'ceo2026',
    },
    darlene: {
      id: 'user-darlene',
      name: 'Darlene',
      role: 'darlene',
      color: '#f59e0b',
      initials: 'DA',
      password: process.env.ASSISTANT_PASSWORD || 'assist2026',
    },
  };
}

export function validateUser(username: string, password: string): (User & { password: string }) | null {
  const users = getUsers();
  const user = users[username?.toLowerCase()?.trim()];
  if (!user || user.password !== password) return null;
  return user;
}

export function signToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): AuthPayload | null {
  try { return jwt.verify(token, JWT_SECRET) as AuthPayload; }
  catch { return null; }
}

export function authenticate(request: Request): AuthPayload | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  if (!match?.[1]) return null;
  return verifyToken(match[1]);
}

export const USERS = getUsers();
