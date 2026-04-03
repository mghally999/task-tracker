"use client";
import type { Task, User, OnlineUser, DashboardNotes } from "@/types";
import { StatsBar } from "./StatsBar";
import { TaskRow } from "./TaskRow";
import { NotesSection } from "./NotesSection";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "@/lib/utils";

interface Props {
  tasks: Task[];
  stats: Record<string, number>;
  notes: DashboardNotes;
  currentUser: User;
  onlineUsers: OnlineUser[];
  dark: boolean;
  onComment: (task: Task) => void;
  onStatusChange: (id: string, status: any) => void;
}

export function CEODashboard({
  tasks,
  stats,
  notes,
  currentUser,
  onlineUsers,
  dark,
  onComment,
  onStatusChange,
}: Props) {
  const high = tasks.filter((t) => t.priority === "High" && !t.archived);
  const medium = tasks.filter((t) => t.priority === "Medium" && !t.archived);
  const low = tasks.filter((t) => t.priority === "Low" && !t.archived);

  const byStatus = (list: Task[]) => ({
    pending: list.filter((t) => t.status === "pending").length,
    progress: list.filter((t) => t.status === "progress").length,
    done: list.filter((t) => t.status === "done").length,
    hold: list.filter((t) => t.status === "hold").length,
  });

  const cardStyle = {
    background: dark ? "rgba(17,24,39,0.8)" : "#fff",
    border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "#e2e8f0"}`,
    borderRadius: "20px",
    padding: "20px",
    boxShadow: dark
      ? "0 4px 24px rgba(0,0,0,0.3)"
      : "0 2px 12px rgba(13,27,42,0.06)",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Online presence banner */}
      {onlineUsers.filter((u) => u.userId !== currentUser.id).length > 0 && (
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-2xl"
          style={{
            background: dark ? "rgba(34,197,94,0.08)" : "#f0fdf4",
            border: `1px solid ${dark ? "rgba(34,197,94,0.2)" : "#86efac"}`,
          }}
        >
          <div className="online-dot" />
          <span
            className="text-sm font-medium"
            style={{ color: dark ? "#86efac" : "#166534" }}
          >
            {onlineUsers
              .filter((u) => u.userId !== currentUser.id)
              .map((u) => u.userName)
              .join(", ")}{" "}
            is active right now — changes appear live
          </span>
        </div>
      )}

      {/* Stats */}
      <StatsBar stats={stats} dark={dark} />

      {/* Priority summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {(
          [
            {
              label: "High Priority",
              tasks: high,
              color: "#ef4444",
              icon: "🔴",
            },
            {
              label: "Medium Priority",
              tasks: medium,
              color: "#f59e0b",
              icon: "🟡",
            },
            { label: "Low Priority", tasks: low, color: "#22c55e", icon: "🟢" },
          ] as const
        ).map(({ label, tasks: list, color, icon }) => {
          const counts = byStatus(list);
          return (
            <div key={label} style={cardStyle}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{icon}</span>
                <h3
                  className="font-semibold text-sm"
                  style={{ color: dark ? "#f1f5f9" : "#0d1b2a" }}
                >
                  {label}
                </h3>
                <span
                  className="ml-auto font-bold font-display text-2xl"
                  style={{ color }}
                >
                  {list.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(counts).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                    style={{
                      background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                    }}
                  >
                    <span style={{ color: dark ? "#64748b" : "#94a3b8" }}>
                      {
                        STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
                          ?.label
                      }
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: dark ? "#f1f5f9" : "#0d1b2a" }}
                    >
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full task table — CEO read only */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2
              className="font-display font-bold text-lg"
              style={{ color: dark ? "#f1f5f9" : "#0d1b2a" }}
            >
              CEO Priority Dashboard
            </h2>
            <p
              className="text-xs mt-1"
              style={{ color: dark ? "#64748b" : "#94a3b8" }}
            >
              All active tasks sorted by priority. Click any task to expand
              details. Leave comments using 💬.
            </p>
          </div>
          <div
            className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{
              background: dark ? "rgba(59,130,246,0.1)" : "#eff6ff",
              color: "#3b82f6",
            }}
          >
            👔 Read Mode
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          {[
            { color: "#ef4444", label: "High" },
            { color: "#f59e0b", label: "Medium" },
            { color: "#22c55e", label: "Low" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: color }}
              />
              <span style={{ color: dark ? "#64748b" : "#94a3b8" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Table header */}
        <div
          className="grid grid-cols-12 gap-2 px-4 pb-2 text-xs font-bold uppercase tracking-wider"
          style={{ color: dark ? "#475569" : "#94a3b8" }}
        >
          <div className="col-span-4">Task</div>
          <div className="col-span-2 hidden md:block">Date</div>
          <div className="col-span-2 hidden lg:block">Category</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Notes</div>
        </div>

        {/* Task rows */}
        <div>
          {tasks
            .filter((t) => !t.archived)
            .map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                currentUser={currentUser}
                canEdit={false}
                dark={dark}
                onStatusChange={onStatusChange}
                onEdit={() => {}}
                onArchive={() => {}}
                onRestore={() => {}}
                onDelete={() => {}}
                onComment={onComment}
              />
            ))}
          {tasks.filter((t) => !t.archived).length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p style={{ color: dark ? "#475569" : "#94a3b8" }}>
                No active tasks
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <NotesSection notes={notes} onChange={() => {}} dark={dark} readOnly />
    </div>
  );
}
