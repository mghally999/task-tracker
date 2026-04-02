import { NextResponse } from 'next/server';
import { checkConnection } from '@/lib/db';

export async function GET() {
  const dbOk = await checkConnection();
  const status = dbOk ? 200 : 503;
  return NextResponse.json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk ? 'connected' : 'error',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }, { status });
}
