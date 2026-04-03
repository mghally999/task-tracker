export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'pending' | 'progress' | 'done' | 'hold';
export type Category =
  | 'CEO Meeting' | 'Follow-up' | 'Approval' | 'Travel'
  | 'Communication' | 'Confidential' | 'Personal Assistance' | 'PRO & Compliance';
export type UserRole = 'mohammed' | 'darlene';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  color: string;
  initials: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  date: string;
  name: string;
  category: Category;
  priority: Priority;
  status: TaskStatus;
  time: string;
  owner: string;
  notes: string;
  archived: boolean;
  archivedOn?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  pinned: boolean;
}

export interface DailyNotes {
  date: string;
  summary: string;
  tomorrow: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface CursorData {
  userId: string;
  userName: string;
  userRole: UserRole;
  color: string;
  x: number;
  y: number;
  lastSeen: number;
}

export interface OnlineUser {
  userId: string;
  userName: string;
  userRole: UserRole;
  color: string;
}

export type WSEventType =
  | 'auth' | 'initial_state' | 'online_users'
  | 'task_created' | 'task_updated' | 'task_deleted'
  | 'comment_added' | 'cursor_move'
  | 'user_joined' | 'user_left'
  | 'notes_updated' | 'chat_message'
  | 'typing' | 'ping' | 'pong' | 'error';

export interface WSMessage {
  type: WSEventType;
  payload?: any;
  timestamp?: number;
}

export interface AuthPayload {
  userId: string;
  role: UserRole;
  name: string;
  color: string;
  iat?: number;
  exp?: number;
}

export interface TaskFilters {
  search?: string;
  priority?: Priority | '';
  status?: TaskStatus | '';
  category?: Category | '';
  dateFrom?: string;
  dateTo?: string;
  archived?: boolean;
}
