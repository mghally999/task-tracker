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
    const saved = localStorage.getItem('theme');
    setDark(saved !== 'light');
    document.documentElement.classList.toggle('dark', saved !== 'light');
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const quickLogin = (u: string, p: string) => { setUsername(u); setPassword(p); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError('Invalid credentials. Try again.'); return; }
      router.push('/dashboard');
    } catch { setError('Connection error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen flex ${mounted ? '' : 'invisible'}`}
      style={{ background: dark ? 'linear-gradient(135deg,#070c14 0%,#0d1a2e 50%,#091524 100%)' : 'linear-gradient(135deg,#e8edf5 0%,#dce5f0 50%,#cdd8e9 100%)' }}>

      {/* Background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={dark ? 'white' : '#163a63'} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: '#3b82f6' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: '#c89b3c' }} />
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center border transition-all"
        style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)', color: dark ? '#94a3b8' : '#64748b' }}>
        {dark ? '☀️' : '🌙'}
      </button>

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: 'linear-gradient(135deg,#163a63,#244f80)' }}>ET</div>
            <span className="font-display font-700 text-lg" style={{ color: dark ? '#f1f5f9' : '#163a63' }}>ExecTrack</span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-tight mb-6"
            style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
            CEO Command<br />
            <span style={{ color: dark ? '#f59e0b' : '#c89b3c' }}>Centre.</span>
          </h1>
          <p className="text-lg leading-relaxed mb-10" style={{ color: dark ? '#94a3b8' : '#64748b' }}>
            Real-time executive task management with live collaboration between CEO and Executive Assistant.
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-4">
          {[
            { icon: '⚡', text: 'Live real-time sync — no page refresh' },
            { icon: '👁', text: 'See each other\'s cursor & activity' },
            { icon: '💬', text: 'Inline comments on every task' },
            { icon: '📊', text: 'Priority dashboard & CEO view' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-3">
              <span className="text-xl">{f.icon}</span>
              <span style={{ color: dark ? '#94a3b8' : '#475569' }}>{f.text}</span>
            </div>
          ))}
        </div>

        <p className="text-sm" style={{ color: dark ? '#475569' : '#94a3b8' }}>
          © 2026 CEO Executive Tracker. Confidential.
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl p-8 shadow-2xl"
            style={{ background: dark ? 'rgba(17,24,39,0.85)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>

            <h2 className="font-display text-2xl font-bold mb-1" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
              Welcome back
            </h2>
            <p className="text-sm mb-8" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Sign in to your executive workspace</p>

            {/* Quick access buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={() => quickLogin('ceo', 'ceo2026')}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: dark ? 'rgba(59,130,246,0.12)' : '#eff6ff', color: '#3b82f6', borderColor: dark ? 'rgba(59,130,246,0.3)' : '#bfdbfe' }}>
                👔 Login as CEO
              </button>
              <button onClick={() => quickLogin('darlene', 'assist2026')}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: dark ? 'rgba(245,158,11,0.12)' : '#fffbeb', color: '#f59e0b', borderColor: dark ? 'rgba(245,158,11,0.3)' : '#fde68a' }}>
                💼 Login as Assistant
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} />
              <span className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>or enter credentials</span>
              <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: dark ? '#64748b' : '#94a3b8' }}>Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="ceo or darlene" autoComplete="username"
                  style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc', color: dark ? '#f1f5f9' : '#0d1b2a', borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                  style={{ color: dark ? '#64748b' : '#94a3b8' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc', color: dark ? '#f1f5f9' : '#0d1b2a', borderColor: dark ? 'rgba(255,255,255,0.1)' : '#dde3ec' }} />
              </div>

              {error && (
                <div className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: dark ? 'rgba(239,68,68,0.12)' : '#fff1f0', color: dark ? '#fca5a5' : '#991b1b', border: `1px solid ${dark ? 'rgba(239,68,68,0.3)' : '#fecaca'}` }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !username || !password}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg,#163a63,#244f80)' }}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            <div className="mt-6 p-4 rounded-xl text-xs space-y-1"
              style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#f8fafc', color: dark ? '#475569' : '#94a3b8', border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}` }}>
              <p>👔 <strong>CEO:</strong> ceo / ceo2026</p>
              <p>💼 <strong>Assistant:</strong> darlene / assist2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
