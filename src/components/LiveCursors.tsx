'use client';
import type { CursorData } from '@/types';

interface Props {
  cursors: Map<string, CursorData>;
  currentUserId: string;
}

export function LiveCursors({ cursors, currentUserId }: Props) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {Array.from(cursors.values()).filter(c => c.userId !== currentUserId).map(cursor => (
        <div key={cursor.userId} className="live-cursor"
          style={{ left: cursor.x, top: cursor.y, transform: 'translate(-2px,-2px)' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
            <path d="M5.5 3.5L16.5 10L10.5 11.5L8 17.5L5.5 3.5Z"
              fill={cursor.color} stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <div className="absolute top-5 left-3 px-2 py-1 rounded-full text-white whitespace-nowrap shadow-lg"
            style={{ background: cursor.color, fontSize: '11px', fontWeight: '600' }}>
            {cursor.userName}{cursor.userRole === 'mohammed' ? ' 👔' : ' 💼'}
          </div>
        </div>
      ))}
    </div>
  );
}
