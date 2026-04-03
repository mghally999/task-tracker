'use client';
import { useState, useRef, useCallback } from 'react';
import type { DashboardNotes } from '@/types';

interface Props {
  notes: DashboardNotes;
  onChange: (updates: Partial<DashboardNotes>) => void;
  dark: boolean;
  readOnly?: boolean;
}

export function NotesSection({ notes, onChange, dark, readOnly }: Props) {
  const [localSummary, setLocalSummary]   = useState(notes.summary);
  const [localTomorrow, setLocalTomorrow] = useState(notes.tomorrow);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const autoTimer = useRef<NodeJS.Timeout>();

  // Keep local state in sync when notes prop changes from WS
  const prevSummary  = useRef(notes.summary);
  const prevTomorrow = useRef(notes.tomorrow);
  if (notes.summary !== prevSummary.current && notes.summary !== localSummary) {
    setLocalSummary(notes.summary);
    prevSummary.current = notes.summary;
  }
  if (notes.tomorrow !== prevTomorrow.current && notes.tomorrow !== localTomorrow) {
    setLocalTomorrow(notes.tomorrow);
    prevTomorrow.current = notes.tomorrow;
  }

  const doSave = useCallback(async (summary: string, tomorrow: string) => {
    setSaving(true);
    setSaved(false);
    try {
      await onChange({ summary, tomorrow });
      setSaved(true);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }, [onChange]);

  const handleChange = (key: 'summary' | 'tomorrow', val: string) => {
    if (key === 'summary') setLocalSummary(val);
    else setLocalTomorrow(val);

    // Auto-save after 2 seconds of inactivity
    clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      doSave(
        key === 'summary' ? val : localSummary,
        key === 'tomorrow' ? val : localTomorrow,
      );
    }, 2000);
  };

  const handleManualSave = () => {
    clearTimeout(autoTimer.current);
    doSave(localSummary, localTomorrow);
  };

  const boxStyle = {
    background: dark ? 'rgba(17,24,39,0.8)' : '#fff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
    borderRadius: '16px', padding: '20px',
    boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 8px rgba(13,27,42,0.06)',
  };

  const textareaStyle = {
    background: 'transparent', border: 'none', padding: 0, resize: 'none' as const,
    color: dark ? '#cbd5e1' : '#334155', fontSize: '14px', lineHeight: '1.7',
    width: '100%', outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-base" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>
          📝 End-of-Day Notes
        </h2>
        {!readOnly && (
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8', fontFamily: 'monospace' }}>
                ✓ Saved at {lastSaved}
              </span>
            )}
            <button onClick={handleManualSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              style={{ background: saved ? 'linear-gradient(135deg,#166534,#15803d)' : 'linear-gradient(135deg,#163a63,#244f80)' }}>
              {saving ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : saved ? (
                <>✓ Saved!</>
              ) : (
                <>💾 Save Notes</>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Summary */}
        <div style={boxStyle}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">📋</span>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
              End-of-Day Summary
            </h3>
          </div>
          {readOnly ? (
            <p className="text-sm leading-relaxed min-h-[80px]" style={{ color: dark ? '#94a3b8' : '#64748b', whiteSpace: 'pre-wrap' }}>
              {notes.summary || <span className="italic opacity-50">No summary added yet</span>}
            </p>
          ) : (
            <textarea
              value={localSummary}
              onChange={e => handleChange('summary', e.target.value)}
              placeholder="Write a short end-of-day summary for the CEO or for your records…&#10;&#10;• What was accomplished today&#10;• Key decisions made&#10;• Blockers or issues"
              rows={8}
              style={textareaStyle}
              maxLength={1000}
            />
          )}
          {!readOnly && (
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>Auto-saves as you type</span>
              <span className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>{localSummary.length}/1000</span>
            </div>
          )}
        </div>

        {/* Tomorrow */}
        <div style={boxStyle}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🎯</span>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
              Tomorrow's Priorities
            </h3>
          </div>
          {readOnly ? (
            <p className="text-sm leading-relaxed min-h-[80px]" style={{ color: dark ? '#94a3b8' : '#64748b', whiteSpace: 'pre-wrap' }}>
              {notes.tomorrow || <span className="italic opacity-50">No priorities set yet</span>}
            </p>
          ) : (
            <textarea
              value={localTomorrow}
              onChange={e => handleChange('tomorrow', e.target.value)}
              placeholder="List key priorities for tomorrow…&#10;&#10;• Pending approvals needed&#10;• Urgent follow-ups&#10;• CEO meetings / decisions required"
              rows={8}
              style={textareaStyle}
              maxLength={1000}
            />
          )}
          {!readOnly && (
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>Auto-saves as you type</span>
              <span className="text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>{localTomorrow.length}/1000</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
