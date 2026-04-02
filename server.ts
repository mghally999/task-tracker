import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { runMigrations } from './src/lib/migrate';
import { store } from './src/lib/store';
import { getPoolInstance } from './src/lib/db';
import { JWT_SECRET } from './src/lib/auth';
import type { AuthPayload, WSMessage } from './src/types';

const dev  = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0'; // Required for Railway — binds to all interfaces

interface ExtWS extends WebSocket {
  userId?:   string;
  userName?: string;
  userRole?: string;
  userColor?: string;
  isAlive?:  boolean;
}

// ─── Global WS accessor (used by broadcast.ts in API routes) ─────────────────
declare global {
  var __wss: WebSocketServer | undefined;
}

export function broadcast(msg: WSMessage, excludeUserId?: string): void {
  if (!global.__wss) return;
  const data = JSON.stringify(msg);
  global.__wss.clients.forEach((c) => {
    const ws = c as ExtWS;
    if (ws.readyState === WebSocket.OPEN) {
      if (excludeUserId && ws.userId === excludeUserId) return;
      ws.send(data);
    }
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Run DB migrations (creates tables, seeds if empty)
  console.log('\n[Boot] Running database migrations…');
  await runMigrations();

  // 2. Load all data into in-memory cache
  console.log('[Boot] Initializing task store…');
  await store.initialize();

  // 3. Boot Next.js
  console.log('[Boot] Starting Next.js…');
  const app    = next({ dev, hostname: host, port });
  const handle = app.getRequestHandler();
  await app.prepare();

  // 4. Create HTTP server
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // 5. Attach WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  global.__wss = wss;

  // Heartbeat — detect dead connections
  const heartbeat = setInterval(() => {
    wss.clients.forEach((c) => {
      const ws = c as ExtWS;
      if (ws.isAlive === false) { ws.terminate(); return; }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30_000);
  wss.on('close', () => clearInterval(heartbeat));

  wss.on('connection', (rawWs) => {
    const ws = rawWs as ExtWS;
    ws.isAlive = true;
    let authenticated = false;

    // Kill unauthenticated connections after 5 s
    const authTimeout = setTimeout(() => {
      if (!authenticated) ws.terminate();
    }, 5_000);

    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (data) => {
      try {
        const msg: WSMessage = JSON.parse(data.toString());

        // ── Authentication ──────────────────────────────────────────────────
        if (msg.type === 'auth') {
          try {
            const decoded = jwt.verify(msg.payload?.token, JWT_SECRET) as AuthPayload;
            ws.userId    = decoded.userId;
            ws.userName  = decoded.name;
            ws.userRole  = decoded.role;
            ws.userColor = decoded.color;
            authenticated = true;
            clearTimeout(authTimeout);

            // Send full initial state
            const tasks    = store.getActiveTasks();
            const archived = store.getArchivedTasks();
            const notes    = await store.getNotes();
            ws.send(JSON.stringify({ type: 'initial_state', payload: { tasks, archived, notes } }));

            // Tell others this user joined
            broadcast({
              type: 'user_joined',
              payload: { userId: ws.userId, userName: ws.userName, userRole: ws.userRole, color: ws.userColor, connectedAt: Date.now() },
            }, ws.userId);

            // Send current online users to the new client
            const onlineUsers: any[] = [];
            wss.clients.forEach((c) => {
              const other = c as ExtWS;
              if (other !== ws && other.userId && other.readyState === WebSocket.OPEN) {
                onlineUsers.push({ userId: other.userId, userName: other.userName, userRole: other.userRole, color: other.userColor });
              }
            });
            ws.send(JSON.stringify({ type: 'online_users', payload: onlineUsers }));
          } catch {
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid token' } }));
            ws.terminate();
          }
          return;
        }

        if (!authenticated) return;

        // ── Cursor movement ─────────────────────────────────────────────────
        if (msg.type === 'cursor_move') {
          broadcast({
            type: 'cursor_move',
            payload: { userId: ws.userId, userName: ws.userName, userRole: ws.userRole, color: ws.userColor, x: msg.payload?.x, y: msg.payload?.y, lastSeen: Date.now() },
          }, ws.userId);
          return;
        }

        // ── Typing indicator ────────────────────────────────────────────────
        if (msg.type === 'typing') {
          broadcast({ type: 'typing', payload: { userId: ws.userId, userName: ws.userName, ...msg.payload } }, ws.userId);
          return;
        }

        // ── Keepalive ───────────────────────────────────────────────────────
        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }
      } catch (err) {
        console.error('[WS] Message error:', err);
      }
    });

    ws.on('close', () => {
      clearTimeout(authTimeout);
      if (ws.userId) {
        broadcast({ type: 'user_left', payload: { userId: ws.userId, userName: ws.userName } }, ws.userId);
      }
    });

    ws.on('error', (err) => console.error('[WS] Socket error:', err.message));
  });

  // 6. Start listening
  httpServer.listen(port, host, () => {
    console.log(`\n✅ CEO Executive Tracker running`);
    console.log(`   Local:    http://localhost:${port}`);
    console.log(`   Network:  http://${host}:${port}`);
    console.log(`   WS:       ws://localhost:${port}/ws`);
    console.log(`\n   👔 CEO:       ceo  / ${process.env.CEO_PASSWORD || 'ceo2026'}`);
    console.log(`   💼 Assistant: darlene / ${process.env.ASSISTANT_PASSWORD || 'assist2026'}\n`);
  });

  // 7. Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Shutdown] SIGTERM received — closing gracefully…');
    wss.close();
    clearInterval(heartbeat);
    await getPoolInstance().end();
    process.exit(0);
  });
  process.on('SIGINT', async () => {
    console.log('[Shutdown] SIGINT received — closing gracefully…');
    wss.close();
    clearInterval(heartbeat);
    await getPoolInstance().end();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[Boot] Fatal error:', err);
  process.exit(1);
});
