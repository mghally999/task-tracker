'use client';
import { useState, useRef, useEffect } from 'react';
import type { DailyNotes } from '@/types';

interface Props {
  notes: DailyNotes;
  date: string;
  onChange: (date: string, updates: Partial<DailyNotes>) => void;
  dark: boolean;
  readOnly?: boolean;
}

export function NotesSection({ notes, date, onChange, dark, readOnly }: Props) {
  const [summary,  setSummary]  = useState(notes.summary  || '');
  const [tomorrow, setTomorrow] = useState(notes.tomorrow || '');
  const [saving,   setSaving]   = useState(false);
  const [savedAt,  setSavedAt]  = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const autoTimer = useRef<NodeJS.Timeout>();

  useEffect(() => { setSummary(notes.summary   || ''); }, [notes.summary]);
  useEffect(() => { setTomorrow(notes.tomorrow  || ''); }, [notes.tomorrow]);

  const doSave = async (s: string, t: string) => {
    setSaving(true);
    try {
      await onChange(date, { summary: s, tomorrow: t });
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 4000);
    } finally { setSaving(false); }
  };

  const handleChange = (key: 'summary' | 'tomorrow', val: string) => {
    if (key === 'summary') setSummary(val); else setTomorrow(val);
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      doSave(key === 'summary' ? val : summary, key === 'tomorrow' ? val : tomorrow);
    }, 2500);
  };

  const box = {
    background: dark ? 'rgba(17,24,39,0.8)' : '#fff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
    borderRadius: '16px', padding: '18px 20px',
    boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 8px rgba(13,27,42,0.06)',
  };

  const ta = {
    background: 'transparent', border: 'none', padding: 0,
    resize: 'none' as const, outline: 'none', fontFamily: 'inherit',
    color: dark ? '#cbd5e1' : '#334155', fontSize: '15px', lineHeight: '1.7', width: '100%',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-display font-bold text-lg" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
          📝 Daily Notes
        </h2>
        {!readOnly && (
          <div className="flex items-center gap-3">
            {showSaved && (
              <span className="text-sm font-semibold" style={{ color: '#22c55e', fontFamily: 'monospace' }}>✓ Saved {savedAt}</span>
            )}
            <button onClick={() => { clearTimeout(autoTimer.current); doSave(summary, tomorrow); }}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 hover:scale-[1.02] transition-all"
              style={{ background: showSaved ? 'linear-gradient(135deg,#166534,#15803d)' : 'linear-gradient(135deg,#163a63,#244f80)' }}>
              {saving ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Saving…</>
                : showSaved ? '✓ Saved!' : '💾 Save Notes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div style={box}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📋</span>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dark ? '#64748b' : '#94a3b8' }}>End-of-Day Summary</h3>
          </div>
          {readOnly
            ? <p className="text-sm leading-relaxed min-h-[80px]" style={{ color: dark ? '#94a3b8' : '#64748b', whiteSpace: 'pre-wrap' }}>
                {notes.summary || <em className="opacity-50">No summary added</em>}
              </p>
            : <>
                <textarea value={summary} onChange={e => handleChange('summary', e.target.value)}
                  placeholder="What was accomplished today?&#10;Key decisions made&#10;Any blockers?" rows={7} style={ta} maxLength={1000} />
                <div className="flex justify-between mt-2 text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>
                  <span>Auto-saves as you type</span><span>{summary.length}/1000</span>
                </div>
              </>
          }
        </div>
        <div style={box}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎯</span>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dark ? '#64748b' : '#94a3b8' }}>Tomorrow's Priorities</h3>
          </div>
          {readOnly
            ? <p className="text-sm leading-relaxed min-h-[80px]" style={{ color: dark ? '#94a3b8' : '#64748b', whiteSpace: 'pre-wrap' }}>
                {notes.tomorrow || <em className="opacity-50">No priorities set</em>}
              </p>
            : <>
                <textarea value={tomorrow} onChange={e => handleChange('tomorrow', e.target.value)}
                  placeholder="• Pending approvals needed&#10;• Urgent follow-ups&#10;• Key meetings" rows={7} style={ta} maxLength={1000} />
                <div className="flex justify-between mt-2 text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>
                  <span>Auto-saves as you type</span><span>{tomorrow.length}/1000</span>
                </div>
              </>
          }
        </div>
      </div>
    </div>
  );
}
