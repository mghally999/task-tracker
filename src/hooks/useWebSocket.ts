'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import type { WSMessage, CursorData, OnlineUser } from '@/types';

type EventHandler = (payload: any) => void;

export function useWebSocket(token: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [cursors, setCursors] = useState<Map<string, CursorData>>(new Map());
  const handlersRef = useRef<Map<string, EventHandler[]>>(new Map());
  const reconnectRef = useRef<NodeJS.Timeout>();
  const cursorTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const throttleRef = useRef(0);

  const on = useCallback((event: string, handler: EventHandler) => {
    const m = handlersRef.current;
    if (!m.has(event)) m.set(event, []);
    m.get(event)!.push(handler);
    return () => {
      const arr = m.get(event) || [];
      m.set(event, arr.filter(h => h !== handler));
    };
  }, []);

  const emit = useCallback((msg: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const sendCursor = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - throttleRef.current < 50) return;
    throttleRef.current = now;
    emit({ type: 'cursor_move', payload: { x, y } });
  }, [emit]);

  const connect = useCallback(() => {
    if (!token) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'auth', payload: { token } }));
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };

    ws.onmessage = (e) => {
      try {
        const msg: WSMessage = JSON.parse(e.data);
        const handlers = handlersRef.current.get(msg.type) || [];
        handlers.forEach(h => h(msg.payload));

        switch (msg.type) {
          case 'cursor_move': {
            const data = msg.payload as CursorData;
            setCursors(prev => new Map(prev).set(data.userId, { ...data, lastSeen: Date.now() }));
            // Auto-remove after 5 seconds of inactivity
            const existing = cursorTimers.current.get(data.userId);
            if (existing) clearTimeout(existing);
            cursorTimers.current.set(data.userId, setTimeout(() => {
              setCursors(prev => { const next = new Map(prev); next.delete(data.userId); return next; });
            }, 5000));
            break;
          }
          case 'online_users':
            setOnlineUsers(msg.payload || []);
            break;
          case 'user_joined':
            setOnlineUsers(prev => [...prev.filter(u => u.userId !== msg.payload?.userId), msg.payload].filter(Boolean));
            break;
          case 'user_left':
            setOnlineUsers(prev => prev.filter(u => u.userId !== msg.payload?.userId));
            setCursors(prev => { const next = new Map(prev); next.delete(msg.payload?.userId); return next; });
            break;
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconnect after 3 seconds
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // Ping to keep alive
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        emit({ type: 'ping' });
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [emit]);

  return { connected, onlineUsers, cursors, on, emit, sendCursor };
}
