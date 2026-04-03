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
  selectedDate: string;
  onOpenCalendar: () => void;
  onOpenChat: () => void;
  chatUnread: number;
}

export function Navbar({ user, onlineUsers, connected, dark, onToggleTheme, onLogout, view, onToggleView, selectedDate, onOpenCalendar, onOpenChat, chatUnread }: Props) {
  const [showMenu, setShowMenu]   = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const today   = new Date().toISOString().slice(0, 10);
  const isToday = selectedDate === today;
  const others  = onlineUsers.filter(u => u.userId !== user.id);

  const border = dark ? 'rgba(255,255,255,0.07)' : '#dde3ec';
  const bg     = dark ? 'rgba(7,12,20,0.94)' : 'rgba(240,244,248,0.94)';

  const IconBtn = ({ onClick, children, badge }: { onClick: () => void; children: React.ReactNode; badge?: number }) => (
    <button onClick={onClick}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-105 active:scale-95"
      style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#e8edf4', border: `1px solid ${border}` }}>
      {children}
      {badge! > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
          style={{ background: '#ef4444', fontSize: '9px' }}>{badge}</span>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-40"
      style={{ background: bg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${border}` }}>

      {/* Main nav row */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>ET</div>
          <div className="hidden sm:block">
            <div className="font-display font-bold text-base leading-tight" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>ExecTrack</div>
            <div className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>CEO Tracker</div>
          </div>
        </div>

        {/* Desktop center */}
        <div className="hidden md:flex items-center gap-2">
          {/* Date button */}
          <button onClick={onOpenCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: isToday ? (dark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : (dark ? 'rgba(245,158,11,0.15)' : '#fffbeb'), color: isToday ? '#3b82f6' : '#f59e0b', border: `1px solid ${isToday ? (dark ? 'rgba(59,130,246,0.3)' : '#bfdbfe') : (dark ? 'rgba(245,158,11,0.3)' : '#fde68a')}` }}>
            📅 <span className="hidden lg:inline">{isToday ? 'Today' : selectedDate}</span>
            <span className="lg:hidden">{isToday ? '📅' : selectedDate.slice(5)}</span>
          </button>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl p-1"
            style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#e8edf4', border: `1px solid ${border}` }}>
            <button onClick={() => view !== 'full' && onToggleView()}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: view === 'full' ? (dark ? '#1e3a5f' : '#163a63') : 'transparent', color: view === 'full' ? '#fff' : (dark ? '#64748b' : '#94a3b8') }}>
              💼 <span className="hidden lg:inline">Full View</span>
            </button>
            <button onClick={() => view !== 'ceo' && onToggleView()}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: view === 'ceo' ? (dark ? '#1e3a5f' : '#163a63') : 'transparent', color: view === 'ceo' ? '#fff' : (dark ? '#64748b' : '#94a3b8') }}>
              👔 <span className="hidden lg:inline">CEO View</span>
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${connected ? 'online-dot' : 'bg-red-500'}`} />
            <span className="text-xs font-medium hidden lg:block" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>

          {/* Online users - desktop only */}
          {others.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: dark ? 'rgba(34,197,94,0.1)' : '#f0fdf4', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }}>
              {others.map(u => (
                <span key={u.userId} className="inline-flex w-5 h-5 rounded-full items-center justify-center text-white font-bold"
                  style={{ background: u.color, fontSize: '9px' }}>{u.userName.charAt(0)}</span>
              ))}
              <span className="hidden lg:inline" style={{ color: dark ? '#4ade80' : '#16a34a' }}>online</span>
            </div>
          )}

          <IconBtn onClick={onOpenChat} badge={chatUnread}>💬</IconBtn>
          <IconBtn onClick={onToggleTheme}>{dark ? '☀️' : '🌙'}</IconBtn>

          {/* User avatar */}
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all hover:opacity-80"
              style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#e8edf4', border: `1px solid ${border}` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: user.color }}>{user.initials}</div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold leading-tight" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>{user.name}</div>
              </div>
              <span style={{ color: dark ? '#64748b' : '#94a3b8', fontSize: '10px' }}>▾</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-hidden shadow-xl z-50"
                style={{ background: dark ? '#1a2236' : '#fff', border: `1px solid ${border}` }}>
                {/* Mobile: show view toggle & calendar here */}
                <div className="md:hidden border-b px-4 py-3 space-y-2" style={{ borderColor: border }}>
                  <button onClick={() => { onOpenCalendar(); setShowMenu(false); }}
                    className="w-full text-left text-sm font-medium py-1" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
                    📅 {isToday ? 'Today' : selectedDate}
                  </button>
                  <button onClick={() => { onToggleView(); setShowMenu(false); }}
                    className="w-full text-left text-sm font-medium py-1" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
                    {view === 'full' ? '👔 Switch to CEO View' : '💼 Switch to Full View'}
                  </button>
                </div>
                <div className="px-4 py-3 border-b" style={{ borderColor: border }}>
                  <div className="text-sm font-semibold" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>{user.name}</div>
                </div>
                <button onClick={() => { setShowMenu(false); onLogout(); }}
                  className="w-full px-4 py-3 text-left text-sm font-medium" style={{ color: '#ef4444' }}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close menu on outside click */}
      {showMenu && <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />}
    </header>
  );
}
