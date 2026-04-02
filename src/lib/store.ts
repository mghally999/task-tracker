import { v4 as uuidv4 } from 'uuid';
import { query } from './db';
import { HashMap } from './ds/HashMap';
import { MinHeap } from './ds/MinHeap';
import { Trie } from './ds/Trie';
import type { Task, Comment, Priority, TaskStatus, TaskFilters, DashboardNotes } from '../types';

const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

function taskComparator(a: Task, b: Task): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (pd !== 0) return pd;
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

function rowToTask(row: any, comments: Comment[] = []): Task {
  return {
    id: row.id, date: row.date, name: row.name,
    category: row.category, priority: row.priority as Priority,
    status: row.status as TaskStatus,
    time: row.time || '', owner: row.owner || '', notes: row.notes || '',
    archived: row.archived, archivedOn: row.archived_on || undefined,
    pinned: row.pinned || false,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    comments,
  };
}

function rowToComment(row: any): Comment {
  return {
    id: row.id, taskId: row.task_id,
    userId: row.user_id, userName: row.user_name, userRole: row.user_role,
    text: row.text,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

export class TaskStore {
  // L1 write-through cache — O(1) reads
  private cache      = new HashMap<Task>(64);
  private trie       = new Trie();
  private byPriority = new HashMap<Set<string>>();
  private byStatus   = new HashMap<Set<string>>();
  private byCategory = new HashMap<Set<string>>();
  private _notes: DashboardNotes = { summary: '', tomorrow: '' };
  private _notesLoaded = false;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    console.log('[Store] Loading from database…');

    const taskRows = await query<any>(`
      SELECT t.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', c.id, 'task_id', c.task_id,
              'user_id', c.user_id, 'user_name', c.user_name,
              'user_role', c.user_role, 'text', c.text,
              'created_at', c.created_at
            ) ORDER BY c.created_at
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS comments_json
      FROM tasks t
      LEFT JOIN comments c ON c.task_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    for (const row of taskRows) {
      const comments = (row.comments_json || []).map(rowToComment);
      this._addToCache(rowToTask(row, comments));
    }

    const noteRows = await query<{ key: string; value: string }>('SELECT key, value FROM notes');
    noteRows.forEach(r => { (this._notes as any)[r.key] = r.value; });
    this._notesLoaded = true;

    console.log(`[Store] Loaded ${this.cache.size} tasks ✓`);
    this.initialized = true;
  }

  private _addToCache(task: Task): void {
    this.cache.set(task.id, task);
    this.trie.indexTask(task);
    this._idx(this.byPriority, task.priority, task.id);
    this._idx(this.byStatus, task.status, task.id);
    this._idx(this.byCategory, task.category, task.id);
  }

  private _removeFromCache(task: Task): void {
    this.trie.deindexTask(task);
    this.byPriority.get(task.priority)?.delete(task.id);
    this.byStatus.get(task.status)?.delete(task.id);
    this.byCategory.get(task.category)?.delete(task.id);
    this.cache.delete(task.id);
  }

  private _idx(map: HashMap<Set<string>>, key: string, id: string): void {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(id);
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async getTask(id: string): Promise<Task | undefined> { return this.cache.get(id); }

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'pinned'>): Promise<Task> {
    const id = `t-${uuidv4()}`;
    const now = new Date().toISOString();
    const rows = await query<any>(
      `INSERT INTO tasks
         (id,date,name,category,priority,status,time,owner,notes,archived,archived_on,pinned,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false,$12,$12) RETURNING *`,
      [id, data.date, data.name, data.category, data.priority, data.status,
       data.time||'', data.owner||'', data.notes||'',
       data.archived||false, data.archivedOn||null, now]
    );
    const task = rowToTask(rows[0], []);
    this._addToCache(task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const existing = this.cache.get(id);
    if (!existing) return undefined;
    const now = new Date().toISOString();
    const m = { ...existing, ...updates, id, updatedAt: now, comments: existing.comments };
    await query(
      `UPDATE tasks SET
         date=$2,name=$3,category=$4,priority=$5,status=$6,
         time=$7,owner=$8,notes=$9,archived=$10,archived_on=$11,
         pinned=$12,updated_at=$13
       WHERE id=$1`,
      [id, m.date, m.name, m.category, m.priority, m.status,
       m.time, m.owner, m.notes, m.archived, m.archivedOn||null, m.pinned, now]
    );
    this._removeFromCache(existing);
    this._addToCache(m);
    return m;
  }

  async deleteTask(id: string): Promise<boolean> {
    const existing = this.cache.get(id);
    if (!existing) return false;
    await query('DELETE FROM tasks WHERE id=$1', [id]);
    this._removeFromCache(existing);
    return true;
  }

  async archiveTask(id: string): Promise<Task | undefined> {
    return this.updateTask(id, { archived: true, archivedOn: todayStr() });
  }

  async restoreTask(id: string): Promise<Task | undefined> {
    return this.updateTask(id, { archived: false, archivedOn: undefined });
  }

  async pinTask(id: string, pinned: boolean): Promise<Task | undefined> {
    return this.updateTask(id, { pinned });
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  getActiveTasks(): Task[]  { return this.cache.values().filter(t => !t.archived); }
  getArchivedTasks(): Task[] { return this.cache.values().filter(t => t.archived); }

  filterTasks(filters: TaskFilters): Task[] {
    let candidates: Set<string> | null = null;

    if (filters.search?.trim()?.length! >= 2) {
      candidates = this.trie.searchMultiple(filters.search!);
    }

    const intersect = (ids: Set<string>) => {
      candidates = candidates ? this._intersect(candidates, ids) : new Set(ids);
    };

    if (filters.priority) intersect(this.byPriority.get(filters.priority) || new Set());
    if (filters.status)   intersect(this.byStatus.get(filters.status)     || new Set());
    if (filters.category) intersect(this.byCategory.get(filters.category) || new Set());

    let tasks: Task[] = candidates !== null
      ? [...candidates].map(id => this.cache.get(id)).filter(Boolean) as Task[]
      : this.cache.values();

    tasks = tasks.filter(t => filters.archived === true ? t.archived : !t.archived);
    if (filters.dateFrom) tasks = tasks.filter(t => t.date >= filters.dateFrom!);
    if (filters.dateTo)   tasks = tasks.filter(t => t.date <= filters.dateTo!);

    return MinHeap.fromArray(tasks, taskComparator).toSortedArray();
  }

  private _intersect(a: Set<string>, b: Set<string>): Set<string> {
    const [sm, lg] = a.size <= b.size ? [a, b] : [b, a];
    const out = new Set<string>();
    for (const id of sm) if (lg.has(id)) out.add(id);
    return out;
  }

  // ── Comments ───────────────────────────────────────────────────────────────

  async addComment(taskId: string, data: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment | undefined> {
    const task = this.cache.get(taskId);
    if (!task) return undefined;
    const rows = await query<any>(
      `INSERT INTO comments (id,task_id,user_id,user_name,user_role,text)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [`c-${uuidv4()}`, taskId, data.userId, data.userName, data.userRole, data.text]
    );
    const comment = rowToComment(rows[0]);
    this.cache.set(taskId, { ...task, comments: [...task.comments, comment] });
    return comment;
  }

  getComments(taskId: string): Comment[] { return this.cache.get(taskId)?.comments || []; }

  // ── Notes ──────────────────────────────────────────────────────────────────

  async getNotes(): Promise<DashboardNotes> { return this._notes; }

  async updateNotes(updates: Partial<DashboardNotes>): Promise<DashboardNotes> {
    this._notes = { ...this._notes, ...updates };
    for (const [key, value] of Object.entries(updates)) {
      await query(
        `INSERT INTO notes (key,value,updated_at) VALUES ($1,$2,NOW())
         ON CONFLICT (key) DO UPDATE SET value=$2,updated_at=NOW()`,
        [key, value]
      );
    }
    return this._notes;
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  getStats(): Record<string, number> {
    const active = this.getActiveTasks();
    const today = todayStr();
    return {
      total:            active.length,
      high:             active.filter(t => t.priority === 'High').length,
      done:             active.filter(t => t.status === 'done').length,
      inProgress:       active.filter(t => t.status === 'progress').length,
      pendingOrWaiting: active.filter(t => t.status === 'pending' || t.status === 'hold').length,
      confidential:     active.filter(t => t.category === 'Confidential').length,
      overdue:          active.filter(t => t.date < today && t.status !== 'done').length,
      archived:         this.getArchivedTasks().length,
    };
  }
}

// Global singleton
declare global { var __taskStore: TaskStore | undefined; }
if (!global.__taskStore) global.__taskStore = new TaskStore();
export const store = global.__taskStore;
