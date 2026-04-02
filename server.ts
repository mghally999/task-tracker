import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { store } from './src/lib/store';
import { JWT_SECRET } from './src/lib/auth';
import type { AuthPayload, WSMessage } from './src/types';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface ExtendedWS extends WebSocket {
  userId?: string;
  userName?: string;
  userRole?: string;
  userColor?: string;
  isAlive?: boolean;
}

// Global WSS accessible by API routes to broadcast changes
declare global {
  var __wss: WebSocketServer | undefined;
}

export function broadcast(msg: WSMessage, excludeUserId?: string): void {
  if (!global.__wss) return;
  const data = JSON.stringify(msg);
  global.__wss.clients.forEach((client) => {
    const ws = client as ExtendedWS;
    if (ws.readyState === WebSocket.OPEN) {
      if (excludeUserId && ws.userId === excludeUserId) return;
      ws.send(data);
    }
  });
}

export function broadcastToAll(msg: WSMessage): void {
  broadcast(msg);
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  global.__wss = wss;

  // Heartbeat interval
  const heartbeat = setInterval(() => {
    wss.clients.forEach((client) => {
      const ws = client as ExtendedWS;
      if (ws.isAlive === false) { ws.terminate(); return; }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(heartbeat));

  wss.on('connection', (rawWs) => {
    const ws = rawWs as ExtendedWS;
    ws.isAlive = true;
    let authenticated = false;
    let authTimeout: NodeJS.Timeout;

    ws.on('pong', () => { ws.isAlive = true; });

    authTimeout = setTimeout(() => {
      if (!authenticated) ws.terminate();
    }, 5000);

    ws.on('message', (data) => {
      try {
        const msg: WSMessage = JSON.parse(data.toString());

        // Authentication
        if (msg.type === 'auth') {
          try {
            const decoded = jwt.verify(msg.payload.token, JWT_SECRET) as AuthPayload;
            ws.userId = decoded.userId;
            ws.userName = decoded.name;
            ws.userRole = decoded.role;
            ws.userColor = decoded.color;
            authenticated = true;
            clearTimeout(authTimeout);

            // Send initial state
            const tasks = store.getActiveTasks();
            const archived = store.getArchivedTasks();
            const notes = store.getNotes();
            ws.send(JSON.stringify({
              type: 'initial_state',
              payload: { tasks, archived, notes },
            }));

            // Notify others
            const joinMsg: WSMessage = {
              type: 'user_joined',
              payload: {
                userId: ws.userId,
                userName: ws.userName,
                userRole: ws.userRole,
                color: ws.userColor,
                connectedAt: Date.now(),
              },
            };
            broadcast(joinMsg, ws.userId);

            // Send current online users to this client
            const onlineUsers: any[] = [];
            wss.clients.forEach((c) => {
              const other = c as ExtendedWS;
              if (other !== ws && other.userId && other.readyState === WebSocket.OPEN) {
                onlineUsers.push({
                  userId: other.userId,
                  userName: other.userName,
                  userRole: other.userRole,
                  color: other.userColor,
                });
              }
            });
            ws.send(JSON.stringify({ type: 'online_users', payload: onlineUsers }));
            return;
          } catch {
            ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid token' } }));
            ws.terminate();
            return;
          }
        }

        if (!authenticated) { ws.send(JSON.stringify({ type: 'error', payload: { message: 'Not authenticated' } })); return; }

        // Cursor movement — broadcast to others only
        if (msg.type === 'cursor_move') {
          broadcast({
            type: 'cursor_move',
            payload: {
              userId: ws.userId,
              userName: ws.userName,
              userRole: ws.userRole,
              color: ws.userColor,
              x: msg.payload.x,
              y: msg.payload.y,
              lastSeen: Date.now(),
            },
          }, ws.userId);
          return;
        }

        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        // Typing indicator
        if (msg.type === 'typing') {
          broadcast({
            type: 'typing',
            payload: { userId: ws.userId, userName: ws.userName, taskId: msg.payload?.taskId, isTyping: msg.payload?.isTyping },
          }, ws.userId);
          return;
        }
      } catch (err) {
        console.error('WS message error:', err);
      }
    });

    ws.on('close', () => {
      clearTimeout(authTimeout);
      if (ws.userId) {
        broadcast({ type: 'user_left', payload: { userId: ws.userId, userName: ws.userName } }, ws.userId);
      }
    });

    ws.on('error', (err) => console.error('WS error:', err));
  });

  httpServer.listen(port, () => {
    console.log(`\n🚀 CEO Executive Tracker ready on http://${hostname}:${port}`);
    console.log(`📡 WebSocket server on ws://${hostname}:${port}/ws`);
    console.log(`\n👔 CEO Login:       username: ceo       | password: ceo2026`);
    console.log(`💼 Assistant Login: username: darlene   | password: assist2026\n`);
  });
});
