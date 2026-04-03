'use client';
import type { Task, DashboardNotes } from '@/types';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/utils';

export function generatePDF(tasks: Task[], archivedTasks: Task[], notes: DashboardNotes, userName: string): void {
  const today = new Date().toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const active = tasks.filter(t => !t.archived);
  const high   = active.filter(t => t.priority === 'High');
  const medium = active.filter(t => t.priority === 'Medium');
  const low    = active.filter(t => t.priority === 'Low');
  const done   = active.filter(t => t.status === 'done');
  const inProg = active.filter(t => t.status === 'progress');
  const pending = active.filter(t => t.status === 'pending' || t.status === 'hold');
  const overdue = active.filter(t => t.date < new Date().toISOString().slice(0, 10) && t.status !== 'done');

  const prioritySorted = [...active].sort((a, b) => {
    const o = { High: 0, Medium: 1, Low: 2 };
    return o[a.priority] - o[b.priority] || new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      done:     'background:#dcfce7;color:#166534',
      progress: 'background:#dbeafe;color:#1e40af',
      pending:  'background:#fee2e2;color:#991b1b',
      hold:     'background:#fef9c3;color:#854d0e',
    };
    const labels: Record<string, string> = { done: 'Completed', progress: 'In Progress', pending: 'Pending', hold: 'Waiting' };
    return `<span style="padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;${colors[status] || ''}">${labels[status] || status}</span>`;
  };

  const priorityBadge = (p: string) => {
    const colors: Record<string, string> = {
      High: 'background:#fee2e2;color:#991b1b',
      Medium: 'background:#fef9c3;color:#854d0e',
      Low: 'background:#dcfce7;color:#166534',
    };
    return `<span style="padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;${colors[p] || ''}">${p}</span>`;
  };

  const taskRows = (list: Task[]) => list.map(t => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 8px;font-weight:600;font-size:13px;color:#0f172a;max-width:220px;">${t.name}${t.pinned ? ' 📌' : ''}
        ${t.owner ? `<div style="margin-top:3px;font-size:11px;color:#64748b;font-weight:400">${t.owner}</div>` : ''}
      </td>
      <td style="padding:10px 8px;font-size:12px;color:#475569;">${t.date}<br/><span style="color:#94a3b8;font-size:11px">${t.time || ''}</span></td>
      <td style="padding:10px 8px;"><span style="background:#eff6ff;color:#1e40af;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600">${t.category}</span></td>
      <td style="padding:10px 8px;">${priorityBadge(t.priority)}</td>
      <td style="padding:10px 8px;">${statusBadge(t.status)}</td>
      <td style="padding:10px 8px;font-size:12px;color:#475569;max-width:200px">${t.notes || '—'}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CEO Daily Report — ${today}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', Arial, sans-serif; color: #0f172a; background: #fff; font-size: 13px; }
    .page { max-width: 1100px; margin: 0 auto; padding: 40px; }
    .header { background: linear-gradient(135deg,#163a63,#244f80); color: #fff; padding: 28px 32px; border-radius: 16px; margin-bottom: 28px; }
    .header h1 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
    .header .sub { color: #d8e5f4; font-size: 13px; }
    .header .meta { font-size: 12px; color: #e6eef7; margin-top: 12px; }
    .stats { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; margin-bottom: 28px; }
    .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 12px; position: relative; overflow: hidden; }
    .stat-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; border-radius: 12px 0 0 12px; }
    .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; font-weight: 700; margin-bottom: 6px; }
    .stat-value { font-size: 26px; font-weight: 800; color: #0f172a; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #163a63; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f8fafc; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .06em; padding: 10px 8px; text-align: left; border-bottom: 2px solid #e2e8f0; }
    .notes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .note-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .note-box h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #163a63; margin-bottom: 12px; }
    .note-box p { font-size: 13px; color: #334155; line-height: 1.7; white-space: pre-wrap; min-height: 60px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    .priority-group { margin-bottom: 24px; }
    .priority-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px 12px; border-radius: 8px; }
    @media print { body { font-size: 11px; } .page { padding: 20px; } .stat-value { font-size: 20px; } }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <h1>CEO Daily Executive Report</h1>
        <div class="sub">Corporate Task Tracker — Prepared by Executive Assistant</div>
      </div>
      <div style="text-align:right">
        <div class="meta"><strong>Date:</strong> ${today}</div>
        <div class="meta"><strong>Prepared by:</strong> ${userName}</div>
        <div class="meta"><strong>Total Active Tasks:</strong> ${active.length}</div>
      </div>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats">
    <div class="stat"><div class="stat-accent" style="background:#3b82f6"></div><div class="stat-label">Total Tasks</div><div class="stat-value">${active.length}</div></div>
    <div class="stat"><div class="stat-accent" style="background:#ef4444"></div><div class="stat-label">High Priority</div><div class="stat-value" style="color:#ef4444">${high.length}</div></div>
    <div class="stat"><div class="stat-accent" style="background:#22c55e"></div><div class="stat-label">Completed</div><div class="stat-value" style="color:#22c55e">${done.length}</div></div>
    <div class="stat"><div class="stat-accent" style="background:#3b82f6"></div><div class="stat-label">In Progress</div><div class="stat-value" style="color:#3b82f6">${inProg.length}</div></div>
    <div class="stat"><div class="stat-accent" style="background:#f59e0b"></div><div class="stat-label">Pending/Wait</div><div class="stat-value" style="color:#f59e0b">${pending.length}</div></div>
    <div class="stat"><div class="stat-accent" style="background:#f43f5e"></div><div class="stat-label">Overdue</div><div class="stat-value" style="color:#f43f5e">${overdue.length}</div></div>
    <div class="stat"><div class="stat-accent" style="background:#94a3b8"></div><div class="stat-label">Archived</div><div class="stat-value">${archivedTasks.length}</div></div>
  </div>

  <!-- End of Day Notes -->
  <div class="section">
    <div class="section-title">📝 End-of-Day Summary & Tomorrow's Priorities</div>
    <div class="notes-grid">
      <div class="note-box">
        <h3>End-of-Day Summary</h3>
        <p>${notes.summary || 'No summary added for today.'}</p>
      </div>
      <div class="note-box">
        <h3>Tomorrow's Priorities</h3>
        <p>${notes.tomorrow || 'No priorities set for tomorrow.'}</p>
      </div>
    </div>
  </div>

  <!-- Priority Report -->
  <div class="section">
    <div class="section-title">📊 All Tasks — Priority Report (High → Low)</div>
    <table>
      <thead>
        <tr>
          <th>Task / Owner</th>
          <th>Date / Deadline</th>
          <th>Category</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Notes / Update</th>
        </tr>
      </thead>
      <tbody>
        ${taskRows(prioritySorted)}
      </tbody>
    </table>
  </div>

  ${high.length > 0 ? `
  <!-- High Priority Focus -->
  <div class="section">
    <div class="section-title">🔴 High Priority Focus — Action Required</div>
    <table>
      <thead><tr><th>Task / Owner</th><th>Date / Deadline</th><th>Category</th><th>Priority</th><th>Status</th><th>Notes</th></tr></thead>
      <tbody>${taskRows(high)}</tbody>
    </table>
  </div>` : ''}

  ${overdue.length > 0 ? `
  <!-- Overdue -->
  <div class="section">
    <div class="section-title">⚠️ Overdue Tasks — Immediate Attention Required</div>
    <table>
      <thead><tr><th>Task / Owner</th><th>Date / Deadline</th><th>Category</th><th>Priority</th><th>Status</th><th>Notes</th></tr></thead>
      <tbody>${taskRows(overdue)}</tbody>
    </table>
  </div>` : ''}

  <!-- Footer -->
  <div class="footer">
    CEO Executive Tracker — Confidential | Generated ${new Date().toLocaleString()} | ${active.length} active tasks
  </div>

</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (win) {
    win.onload = () => {
      setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500);
    };
  }
}

// ── PDF Download Button component ────────────────────────────────────────────
interface PDFButtonProps {
  tasks: Task[];
  archivedTasks: Task[];
  notes: DashboardNotes;
  userName: string;
  dark: boolean;
}

export function PDFButton({ tasks, archivedTasks, notes, userName, dark }: PDFButtonProps) {
  return (
    <button
      onClick={() => generatePDF(tasks, archivedTasks, notes, userName)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: dark ? 'rgba(200,155,60,0.15)' : '#fffbeb',
        color: dark ? '#fbbf24' : '#92400e',
        border: `1px solid ${dark ? 'rgba(200,155,60,0.3)' : '#fde68a'}`,
      }}
    >
      📄 Download PDF Report
    </button>
  );
}
