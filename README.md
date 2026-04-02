# 🚀 CEO Executive Tracker

A real-time full-stack executive task management system for CEO and Executive Assistant collaboration.

---

## ✨ Features

| Feature | Detail |
|---------|--------|
| **Real-time sync** | WebSocket — changes appear instantly, no refresh needed |
| **Live cursors** | See each other's mouse cursor with name label |
| **Dual roles** | CEO view (read + comment) & Assistant view (full CRUD) |
| **Inline comments** | Leave comments on any task, both roles, real-time |
| **Smart search** | Trie-based O(k) prefix search across all task fields |
| **Priority queue** | Min-heap sorted task display — O(n log n) |
| **Dark / Light theme** | Persisted preference, beautiful on both |
| **Archive system** | Archive completed tasks, restore anytime |
| **End-of-day notes** | Summary & tomorrow priorities, synced live |
| **Preloaded data** | All 31 tasks from original tracker pre-loaded |

---

## 🏗️ Data Structures Used

```
HashMap<T>           → O(1) task lookup by ID (primary store)
MinHeap<Task>        → O(log n) priority-sorted views
DoublyLinkedList<T>  → O(1) ordered insert/delete
Trie                 → O(k) prefix search & autocomplete
Secondary indexes    → O(1) filtering by priority/status/category
```

---

## 🔐 Login Credentials

| Role | Username | Password |
|------|----------|----------|
| 👔 CEO (Mr. Mohammad) | `ceo` | `ceo2026` |
| 💼 Executive Assistant (Darlene) | `darlene` | `assist2026` |

---

## 🛠️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Run in development
```bash
npm run dev
```

### 3. Open in browser
```
http://localhost:3000
```

> **Open two browser windows** — one as CEO, one as Darlene — to see real-time sync and live cursors in action!

---

## 📁 Project Structure

```
ceo-tracker/
├── server.ts                    # Custom HTTP + WebSocket server
├── src/
│   ├── app/
│   │   ├── login/page.tsx       # Login page
│   │   ├── dashboard/page.tsx   # Main dashboard
│   │   └── api/                 # REST API routes
│   │       ├── auth/            # Login, logout, me
│   │       ├── tasks/           # CRUD + [id]/comments
│   │       └── notes/           # End-of-day notes
│   ├── components/
│   │   ├── Navbar.tsx           # Top bar with online presence
│   │   ├── TaskRow.tsx          # Individual task row
│   │   ├── TaskForm.tsx         # Add/edit task modal
│   │   ├── CommentPanel.tsx     # Slide-in comment panel
│   │   ├── FilterPanel.tsx      # Search & filter controls
│   │   ├── StatsBar.tsx         # KPI summary cards
│   │   ├── CEODashboard.tsx     # CEO read-only view
│   │   ├── AssistantDashboard.tsx  # Full management view
│   │   ├── NotesSection.tsx     # End-of-day notes
│   │   └── LiveCursors.tsx      # Real-time cursor overlay
│   ├── hooks/
│   │   ├── useWebSocket.ts      # WS connection + events
│   │   └── useTasks.ts          # Task CRUD with optimistic UI
│   ├── lib/
│   │   ├── ds/
│   │   │   ├── HashMap.ts       # Custom hash map
│   │   │   ├── MinHeap.ts       # Priority queue
│   │   │   ├── DoublyLinkedList.ts
│   │   │   └── Trie.ts          # Prefix tree for search
│   │   ├── store.ts             # Global in-memory store
│   │   ├── auth.ts              # JWT authentication
│   │   ├── initialData.ts       # Pre-loaded tasks
│   │   └── utils.ts             # Helpers & constants
│   └── types/index.ts           # All TypeScript types
```

---

## 🌐 Tech Stack

- **Next.js 14** — App Router, Server Components
- **TypeScript** — Strict mode throughout
- **WebSocket (ws)** — Real-time bidirectional sync
- **JWT** — Secure session management
- **Tailwind CSS** — Utility-first styling
- **Custom DSA** — No external state management needed

---

## 💡 How Real-Time Works

```
[Assistant edits task]
    → PUT /api/tasks/:id
    → store.updateTask()
    → broadcast(task_updated) via global wss
    → CEO receives WebSocket message
    → CEO UI updates instantly
```

```
[CEO moves mouse]
    → WS cursor_move event
    → throttled at 50ms intervals (~20fps)
    → Assistant sees CEO cursor with label
    → Auto-hides after 5s inactivity
```

---

## 📊 Time & Space Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Get task by ID | O(1) | O(1) |
| Create/Update task | O(log n) | O(1) |
| Delete task | O(log n) | O(1) |
| Search by text | O(k) | O(k) |
| Filter by priority/status | O(result set) | O(1) |
| Sort by priority | O(n log n) | O(n) |
| Add/get comments | O(1) | O(c) |

Where n = total tasks, k = query length, c = comment count
