'use client';
import { useRef, useCallback } from 'react';
import type { DashboardNotes } from '@/types';

interface Props {
  notes: DashboardNotes;
  onChange: (updates: Partial<DashboardNotes>) => void;
  dark: boolean;
  readOnly?: boolean;
}

export function NotesSection({ notes, onChange, dark, readOnly }: Props) {
  const saveTimer = useRef<NodeJS.Timeout>();

  const handleChange = useCallback((key: keyof DashboardNotes, val: string) => {
    onChange({ [key]: val });
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => onChange({ [key]: val }), 800);
  }, [onChange]);

  const boxStyle = {
    background: dark ? 'rgba(17,24,39,0.7)' : '#fff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'}`,
    borderRadius: '16px',
    padding: '16px',
  };

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {/* End-of-day summary */}
      <div style={boxStyle}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📝</span>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
            End-of-Day Summary
          </h3>
        </div>
        {readOnly ? (
          <div className="text-sm leading-relaxed min-h-[60px]" style={{ color: dark ? '#94a3b8' : '#64748b' }}>
            {notes.summary || <span className="italic opacity-50">No summary added</span>}
          </div>
        ) : (
          <textarea
            value={notes.summary}
            onChange={e => handleChange('summary', e.target.value)}
            placeholder="Write a short end-of-day summary for the CEO…"
            maxLength={400}
            rows={4}
            style={{ background: 'transparent', border: 'none', padding: 0, resize: 'none', color: dark ? '#cbd5e1' : '#334155', fontSize: '13px' }}
          />
        )}
      </div>

      {/* Tomorrow priorities */}
      <div style={boxStyle}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎯</span>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: dark ? '#64748b' : '#94a3b8' }}>
            Tomorrow's Priorities
          </h3>
        </div>
        {readOnly ? (
          <div className="text-sm leading-relaxed min-h-[60px]" style={{ color: dark ? '#94a3b8' : '#64748b' }}>
            {notes.tomorrow || <span className="italic opacity-50">No priorities set</span>}
          </div>
        ) : (
          <textarea
            value={notes.tomorrow}
            onChange={e => handleChange('tomorrow', e.target.value)}
            placeholder="• Key priorities&#10;• Pending approvals&#10;• Urgent items for tomorrow"
            maxLength={500}
            rows={4}
            style={{ background: 'transparent', border: 'none', padding: 0, resize: 'none', color: dark ? '#cbd5e1' : '#334155', fontSize: '13px' }}
          />
        )}
      </div>
    </div>
  );
}
