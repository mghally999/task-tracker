import { v4 as uuidv4 } from 'uuid';
import { HashMap } from './ds/HashMap';
import { MinHeap } from './ds/MinHeap';
import { DoublyLinkedList } from './ds/DoublyLinkedList';
import { Trie } from './ds/Trie';
import type { Task, Comment, Priority, TaskStatus, Category, TaskFilters, DashboardNotes } from '../types';
import { INITIAL_TASKS, INITIAL_NOTES } from './initialData';

// Priority ordering for the heap comparator
const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
const STATUS_ORDER: Record<TaskStatus, number> = { pending: 0, progress: 1, hold: 2, done: 3 };

function taskComparator(a: Task, b: Task): number {
  // Sort by: pinned first, then priority, then date descending
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (pd !== 0) return pd;
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export class TaskStore {
  // O(1) task access — primary store
  private taskMap = new HashMap<Task>(64);

  // DLL for ordered iteration (newest first)
  private taskList = new DoublyLinkedList<Task>(t => t.id);

  // MinHeap for priority-sorted views
  private priorityHeap = new MinHeap<Task>(taskComparator);

  // Secondary indexes for O(1) filtering
  private byPriority = new HashMap<Set<string>>();
  private byStatus = new HashMap<Set<string>>();
  private byCategory = new HashMap<Set<string>>();
  private byDate = new HashMap<Set<string>>();

  // Comments indexed by task ID
  private commentsByTask = new HashMap<Comment[]>();

  // Trie for search
  private searchTrie = new Trie();

  // Notes
  private notes: DashboardNotes = { ...INITIAL_NOTES };

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    for (const task of INITIAL_TASKS) {
      this._insert(task);
    }
  }

  private _addToIndex(map: HashMap<Set<string>>, key: string, id: string): void {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(id);
  }

  private _removeFromIndex(map: HashMap<Set<string>>, key: string, id: string): void {
    map.get(key)?.delete(id);
  }

  private _insert(task: Task): void {
    this.taskMap.set(task.id, task);
    this.taskList.prepend(task);
    this.priorityHeap.insert(task);
    this._addToIndex(this.byPriority, task.priority, task.id);
    this._addToIndex(this.byStatus, task.status, task.id);
    this._addToIndex(this.byCategory, task.category, task.id);
    this._addToIndex(this.byDate, task.date, task.id);
    this.searchTrie.indexTask(task);
    this.commentsByTask.set(task.id, task.comments || []);
  }

  // === TASK CRUD ===

  createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'pinned'>): Task {
    const task: Task = {
      ...data,
      id: `t-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      pinned: false,
    };
    this._insert(task);
    return task;
  }

  getTask(id: string): Task | undefined {
    return this.taskMap.get(id);
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const existing = this.taskMap.get(id);
    if (!existing) return undefined;

    // Remove old indexes
    this._removeFromIndex(this.byPriority, existing.priority, id);
    this._removeFromIndex(this.byStatus, existing.status, id);
    this._removeFromIndex(this.byCategory, existing.category, id);
    this._removeFromIndex(this.byDate, existing.date, id);
    this.searchTrie.deindexTask(existing);

    const updated: Task = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
      comments: existing.comments,
    };

    this.taskMap.set(id, updated);
    this.taskList.update(id, updated);
    this.priorityHeap.update(t => t.id === id, updated);

    // Re-add indexes
    this._addToIndex(this.byPriority, updated.priority, id);
    this._addToIndex(this.byStatus, updated.status, id);
    this._addToIndex(this.byCategory, updated.category, id);
    this._addToIndex(this.byDate, updated.date, id);
    this.searchTrie.indexTask(updated);

    return updated;
  }

  deleteTask(id: string): boolean {
    const task = this.taskMap.get(id);
    if (!task) return false;

    this._removeFromIndex(this.byPriority, task.priority, id);
    this._removeFromIndex(this.byStatus, task.status, id);
    this._removeFromIndex(this.byCategory, task.category, id);
    this._removeFromIndex(this.byDate, task.date, id);
    this.searchTrie.deindexTask(task);
    this.taskList.delete(id);
    this.priorityHeap.remove(t => t.id === id);
    this.commentsByTask.delete(id);
    return this.taskMap.delete(id);
  }

  archiveTask(id: string): Task | undefined {
    return this.updateTask(id, {
      archived: true,
      archivedOn: todayStr(),
    });
  }

  restoreTask(id: string): Task | undefined {
    return this.updateTask(id, {
      archived: false,
      archivedOn: undefined,
    });
  }

  pinTask(id: string, pinned: boolean): Task | undefined {
    return this.updateTask(id, { pinned });
  }

  // === QUERYING ===

  getAllTasks(): Task[] {
    return this.taskMap.values();
  }

  getActiveTasks(): Task[] {
    return this.taskMap.values().filter(t => !t.archived);
  }

  getArchivedTasks(): Task[] {
    return this.taskMap.values().filter(t => t.archived);
  }

  // Priority-sorted tasks (uses heap) — O(n log n)
  getTasksSortedByPriority(archivedOnly = false): Task[] {
    const tasks = archivedOnly
      ? this.getArchivedTasks()
      : this.getActiveTasks();
    return MinHeap.fromArray(tasks, taskComparator).toSortedArray();
  }

  // Filtered tasks with search — O(k + m) where m = results
  filterTasks(filters: TaskFilters): Task[] {
    let candidates: Set<string> | null = null;

    // Use Trie for text search — O(k)
    if (filters.search && filters.search.trim().length >= 2) {
      candidates = this.searchTrie.searchMultiple(filters.search);
    }

    // Use index for priority — O(1)
    if (filters.priority) {
      const ids = this.byPriority.get(filters.priority) || new Set<string>();
      candidates = candidates ? this.intersect(candidates, ids) : new Set(ids);
    }

    // Use index for status — O(1)
    if (filters.status) {
      const ids = this.byStatus.get(filters.status) || new Set<string>();
      candidates = candidates ? this.intersect(candidates, ids) : new Set(ids);
    }

    // Use index for category — O(1)
    if (filters.category) {
      const ids = this.byCategory.get(filters.category) || new Set<string>();
      candidates = candidates ? this.intersect(candidates, ids) : new Set(ids);
    }

    // Get actual tasks
    let tasks: Task[];
    if (candidates !== null) {
      tasks = [];
      for (const id of candidates) {
        const task = this.taskMap.get(id);
        if (task) tasks.push(task);
      }
    } else {
      tasks = this.taskMap.values();
    }

    // Apply archived filter
    tasks = tasks.filter(t => filters.archived === true ? t.archived : !t.archived);

    // Date range — O(m)
    if (filters.dateFrom) {
      tasks = tasks.filter(t => t.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      tasks = tasks.filter(t => t.date <= filters.dateTo!);
    }

    // Sort by priority then date
    return MinHeap.fromArray(tasks, taskComparator).toSortedArray();
  }

  private intersect(a: Set<string>, b: Set<string>): Set<string> {
    const result = new Set<string>();
    const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
    for (const id of smaller) { if (larger.has(id)) result.add(id); }
    return result;
  }

  // === COMMENTS ===

  addComment(taskId: string, data: Omit<Comment, 'id' | 'createdAt'>): Comment | undefined {
    const task = this.taskMap.get(taskId);
    if (!task) return undefined;

    const comment: Comment = {
      ...data,
      id: `c-${uuidv4()}`,
      createdAt: new Date().toISOString(),
    };

    const comments = this.commentsByTask.get(taskId) || [];
    comments.push(comment);
    this.commentsByTask.set(taskId, comments);

    // Update task with new comment
    task.comments = comments;
    this.taskMap.set(taskId, task);
    this.taskList.update(taskId, task);

    return comment;
  }

  getComments(taskId: string): Comment[] {
    return this.commentsByTask.get(taskId) || [];
  }

  // === NOTES ===

  getNotes(): DashboardNotes { return this.notes; }

  updateNotes(updates: Partial<DashboardNotes>): DashboardNotes {
    this.notes = { ...this.notes, ...updates };
    return this.notes;
  }

  // === STATS ===

  getStats(): Record<string, number> {
    const all = this.getActiveTasks();
    const today = todayStr();
    return {
      total: all.length,
      high: (this.byPriority.get('High')?.size || 0),
      done: all.filter(t => t.status === 'done').length,
      inProgress: all.filter(t => t.status === 'progress').length,
      pendingOrWaiting: all.filter(t => t.status === 'pending' || t.status === 'hold').length,
      confidential: all.filter(t => t.category === 'Confidential').length,
      overdue: all.filter(t => t.date < today && t.status !== 'done').length,
      archived: this.getArchivedTasks().length,
    };
  }
}

// Global singleton — shared across Next.js API routes and WS server
declare global {
  var __taskStore: TaskStore | undefined;
}

if (!global.__taskStore) {
  global.__taskStore = new TaskStore();
}

export const store = global.__taskStore;
