'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = localStorage.getItem('theme');
    setDark(s !== 'light');
    document.documentElement.classList.toggle('dark', s !== 'light');
  }, []);

  const toggleTheme = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError('Invalid credentials. Please try again.'); return; }
      router.push('/dashboard');
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${mounted ? '' : 'invisible'}`}
      style={{ background: dark ? 'linear-gradient(135deg,#070c14 0%,#0d1a2e 60%,#091524 100%)' : 'linear-gradient(135deg,#e8edf5 0%,#dce5f0 100%)' }}>

      {/* Background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke={dark ? 'white' : '#163a63'} strokeWidth="0.5" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl opacity-10" style={{ background: '#3b82f6' }} />
        <div className="absolute bottom-1/4 right-1/4 w-56 sm:w-80 h-56 sm:h-80 rounded-full blur-3xl opacity-10" style={{ background: '#c89b3c' }} />
      </div>

      <button onClick={toggleTheme} className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center border transition-all"
        style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}>
        {dark ? '☀️' : '🌙'}
      </button>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>ET</div>
          <div>
            <div className="font-display font-bold text-xl" style={{ color: dark ? '#f1f5f9' : '#163a63' }}>ExecTrack</div>
            <div className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>CEO Executive Tracker</div>
          </div>
        </div>

        <div className="rounded-2xl p-6 sm:p-8 shadow-2xl"
          style={{ background: dark ? 'rgba(17,24,39,0.88)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>

          <h2 className="font-display text-2xl font-bold mb-1" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Sign in to your executive workspace</p>

          {/* Quick access */}
          <div className="flex gap-3 mb-5">
            <button onClick={() => { setUsername('mohammed'); setPassword('ceo2026'); }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: dark ? 'rgba(59,130,246,0.12)' : '#eff6ff', color: '#3b82f6', borderColor: dark ? 'rgba(59,130,246,0.3)' : '#bfdbfe' }}>
              👔 Mr. Mohammed
            </button>
            <button onClick={() => { setUsername('darlene'); setPassword('assist2026'); }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: dark ? 'rgba(245,158,11,0.12)' : '#fffbeb', color: '#f59e0b', borderColor: dark ? 'rgba(245,158,11,0.3)' : '#fde68a' }}>
              💼 Darlene
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} />
            <span className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>or enter manually</span>
            <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="mohammed or darlene" autoComplete="username"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f8fafc', color: dark ? '#f1f5f9' : '#0d1b2a', borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec', fontSize: '16px' }} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f8fafc', color: dark ? '#f1f5f9' : '#0d1b2a', borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec', fontSize: '16px' }} />
            </div>
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-medium"
                style={{ background: dark ? 'rgba(239,68,68,0.12)' : '#fff1f0', color: dark ? '#fca5a5' : '#991b1b', border: `1px solid ${dark ? 'rgba(239,68,68,0.3)' : '#fecaca'}` }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading || !username || !password}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-1"
              style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
