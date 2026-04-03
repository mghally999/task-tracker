'use client';
import { useState, useEffect } from 'react';

interface DayData { date: string; taskCount: number; }

interface Props {
  dark: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

export function CalendarPanel({ dark, selectedDate, onSelectDate, onClose }: Props) {
  const [calDays, setCalDays] = useState<DayData[]>([]);
  const [viewYear, setViewYear]   = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  useEffect(() => {
    fetch('/api/calendar').then(r => r.json()).then(d => setCalDays(d.days || []));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const taskMap = new Map(calDays.map(d => [d.date, d.taskCount]));

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const surface = dark ? '#111827' : '#fff';
  const border  = dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up"
        style={{ background: surface, border: `1px solid ${border}` }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:opacity-70"
            style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b' }}>‹</button>
          <h3 className="font-display font-bold text-base" style={{ color: dark ? '#f1f5f9' : '#0d1b2a' }}>{monthName}</h3>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:opacity-70"
            style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b' }}>›</button>
          <button onClick={onClose} className="ml-2 w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: dark ? 'rgba(255,255,255,0.07)' : '#f1f5f9', color: dark ? '#94a3b8' : '#64748b' }}>×</button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 px-4 pt-3 pb-1">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="text-center text-xs font-bold" style={{ color: dark ? '#475569' : '#94a3b8' }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 px-4 pb-5">
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday    = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const taskCount  = taskMap.get(dateStr) || 0;
            const isFuture   = dateStr > today;

            return (
              <button key={dateStr} onClick={() => { onSelectDate(dateStr); onClose(); }}
                disabled={isFuture}
                className="relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: isSelected ? '#163a63' : isToday ? (dark ? 'rgba(59,130,246,0.2)' : '#eff6ff') : (dark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
                  color: isSelected ? '#fff' : isToday ? '#3b82f6' : (dark ? '#f1f5f9' : '#0f172a'),
                  border: `1px solid ${isSelected ? '#1e4d82' : isToday ? '#93c5fd' : (dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0')}`,
                }}>
                {day}
                {taskCount > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full" style={{ background: isSelected ? '#93c5fd' : '#ef4444' }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-5 pb-4 flex items-center gap-4 text-xs" style={{ color: dark ? '#475569' : '#94a3b8' }}>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"/><span>Has tasks</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/><span>Today</span></div>
          <button onClick={() => { onSelectDate(today); onClose(); }}
            className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: '#3b82f6' }}>
            Go to Today
          </button>
        </div>
      </div>
    </div>
  );
}
