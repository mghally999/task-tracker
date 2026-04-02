'use client';
import { useState } from 'react';
import type { User, OnlineUser } from '@/types';

interface Props {
  user: User;
  onlineUsers: OnlineUser[];
  connected: boolean;
  dark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
  view: 'full' | 'ceo';
  onToggleView: () => void;
}

export function Navbar({ user, onlineUsers, connected, dark, onToggleTheme, onLogout, view, onToggleView }: Props) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const others = onlineUsers.filter(u => u.userId !== user.id);

  return (
    <header className="sticky top-0 z-40 px-6 py-3 flex items-center justify-between"
      style={{
        background: dark ? 'rgba(7,12,20,0.92)' : 'rgba(240,244,248,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#dde3ec'}`,
      }}>

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>ET</div>
        <div>
          <div className="font-display font-bold text-sm" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
            ExecTrack
          </div>
          <div className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>
            CEO Executive Tracker
          </div>
        </div>
      </div>

      {/* Center — view toggle */}
      <div className="flex items-center gap-2 rounded-xl p-1"
        style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#e8edf4', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#dde3ec'}` }}>
        <button onClick={() => view !== 'full' && onToggleView()}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: view === 'full' ? (dark ? '#1e3a5f' : '#163a63') : 'transparent',
            color: view === 'full' ? '#fff' : (dark ? '#64748b' : '#94a3b8'),
          }}>
          💼 Full View
        </button>
        <button onClick={() => view !== 'ceo' && onToggleView()}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: view === 'ceo' ? (dark ? '#1e3a5f' : '#163a63') : 'transparent',
            color: view === 'ceo' ? '#fff' : (dark ? '#64748b' : '#94a3b8'),
          }}>
          👔 CEO View
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
            style={connected ? { boxShadow: '0 0 0 3px rgba(34,197,94,0.2)', animation: 'pulse 2s infinite' } : {}} />
          <span className="text-xs font-medium" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Online users */}
        {others.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: dark ? 'rgba(34,197,94,0.1)' : '#f0fdf4', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}>
            {others.map(u => (
              <span key={u.userId} className="flex items-center gap-1">
                <span className="inline-flex w-5 h-5 rounded-full items-center justify-center text-white text-xs font-bold"
                  style={{ background: u.color, fontSize: '9px' }}>
                  {u.userName.charAt(0)}
                </span>
                <span style={{ color: dark ? '#86efac' : '#166534' }}>{u.userName}</span>
              </span>
            ))}
            <span style={{ color: dark ? '#4ade80' : '#16a34a' }}>● online</span>
          </div>
        )}

        {/* Theme toggle */}
        <button onClick={onToggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
          style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#e8edf4', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#dde3ec'}` }}>
          <span className="text-base">{dark ? '☀️' : '🌙'}</span>
        </button>

        {/* User avatar */}
        <div className="relative">
          <button onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
            style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#e8edf4', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#dde3ec'}` }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: user.color }}>
              {user.initials}
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>{user.name}</div>
              <div className="text-xs capitalize" style={{ color: dark ? '#64748b' : '#94a3b8' }}>{user.role}</div>
            </div>
            <span style={{ color: dark ? '#64748b' : '#94a3b8', fontSize: '10px' }}>▾</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 rounded-xl overflow-hidden shadow-xl z-50"
              style={{ background: dark ? '#1a2236' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#dde3ec'}` }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9' }}>
                <div className="text-xs font-semibold" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>{user.name}</div>
                <div className="text-xs capitalize" style={{ color: dark ? '#64748b' : '#94a3b8' }}>{user.role}</div>
              </div>
              <button onClick={() => { setShowUserMenu(false); onLogout(); }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium transition-all hover:opacity-80"
                style={{ color: '#ef4444' }}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
