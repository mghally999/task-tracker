'use client';
import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, User } from '@/types';
import { timeAgo } from '@/lib/utils';

interface Props {
  currentUser: User;
  dark: boolean;
  onClose: () => void;
  newMessages: ChatMessage[];
}

export function LiveChat({ currentUser, dark, onClose, newMessages }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText]   = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    fetch('/api/chat').then(r => r.json()).then(d => {
      setMessages(d.messages || []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  }, []);

  // New messages from WebSocket
  useEffect(() => {
    if (!newMessages.length) return;
    setMessages(prev => {
      const ids = new Set(prev.map(m => m.id));
      const fresh = newMessages.filter(m => !ids.has(m.id));
      return [...prev, ...fresh];
    });
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [newMessages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (res.ok) {
        const { message } = await res.json();
        setMessages(prev => [...prev, message]);
        setText('');
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
      }
    } finally { setSending(false); }
  };

  const surface = dark ? '#111827' : '#fff';
  const border  = dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        style={{ background: surface, border: `1px solid ${border}`, height: '480px' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: border, background: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
          <div className="flex items-center gap-2">
            <div className="online-dot" />
            <span className="font-semibold text-sm" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>Live Chat</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-lg"
            style={{ color: dark ? '#64748b' : '#94a3b8' }}>×</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>No messages yet. Say hello!</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.userId === currentUser.id;
            const color = msg.userRole === 'mohammed' ? '#3b82f6' : '#f59e0b';
            return (
              <div key={msg.id} className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: color }}>{msg.userName.charAt(0)}</div>
                <div className={`max-w-[200px] flex flex-col gap-0.5 ${isMine ? 'items-end' : ''}`}>
                  <span className="text-xs font-semibold" style={{ color: dark ? '#64748b' : '#94a3b8' }}>{msg.userName}</span>
                  <div className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: isMine ? (dark ? 'rgba(59,130,246,0.2)' : '#eff6ff') : (dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9'),
                      color: dark ? '#e2e8f0' : '#334155',
                      borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    }}>{msg.text}</div>
                  <span className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>{timeAgo(msg.createdAt)}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={send} className="p-3 border-t flex gap-2" style={{ borderColor: border }}>
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder="Type a message…" className="flex-1 text-sm rounded-xl px-3 py-2"
            style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f8fafc', color: dark ? '#f1f5f9' : '#0d1b2a', border: `1px solid ${border}`, outline: 'none' }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e as any); } }} />
          <button type="submit" disabled={sending || !text.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#163a63,#244f80)', flexShrink: 0 }}>
            {sending ? '…' : '↑'}
          </button>
        </form>
      </div>
    </>
  );
}
