import type { WSMessage } from '@/types';

const WS_OPEN = 1; // WebSocket.OPEN

/**
 * Broadcast a WebSocket message to all connected clients.
 * Uses the global __wss singleton set by server.ts.
 * Safe to call from any Next.js API route.
 */
export function broadcast(msg: WSMessage, excludeUserId?: string): void {
  const wss = (global as any).__wss;
  if (!wss) return;
  const data = JSON.stringify(msg);
  wss.clients.forEach((ws: any) => {
    if (ws.readyState === WS_OPEN) {
      if (excludeUserId && ws.userId === excludeUserId) return;
      ws.send(data);
    }
  });
}
