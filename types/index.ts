// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  settings: UserSettings;
}

export type UpdateCheckPolicy = 'never' | 'notify' | 'on_launch';

export interface UserSettings {
  theme: 'dark' | 'light';
  notifications_enabled: boolean;
  daily_brief_time: string; // HH:mm
  /** APK update checks: never | badge in Settings | prompt on launch */
  update_check_policy?: UpdateCheckPolicy;
}

// ─── Notes ───────────────────────────────────────────────────────────────────
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string; // rich text / markdown
  tags: string[];
  attachments: Attachment[];
  linked_note_ids: string[];
  project_id?: string;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  synced_at?: string;
}

export interface Attachment {
  id: string;
  name: string;
  uri: string;
  type: 'image' | 'file' | 'audio';
  size: number;
  mime_type: string;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export type TaskPriority = 'high' | 'medium' | 'low' | 'none';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  reminder_at?: string;
  recurring?: RecurringInterval;
  subtasks: Subtask[];
  tags: string[];
  project_id?: string;
  note_id?: string;
  is_starred: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Subtask {
  id: string;
  title: string;
  is_done: boolean;
}

// ─── Projects ────────────────────────────────────────────────────────────────
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  due_date?: string;
  task_ids: string[];
  note_ids: string[];
  created_at: string;
  updated_at: string;
}

// ─── Calendar ────────────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  color: string;
  task_id?: string;
  project_id?: string;
  created_at: string;
}

// ─── AI ──────────────────────────────────────────────────────────────────────
export type AIProvider = 'grok' | 'openai' | 'claude';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  messages: AIMessage[];
  created_at: string;
  updated_at: string;
}

export interface DailyBrief {
  greeting: string;
  summary: string;
  focus_tasks: Task[];
  insights: string[];
  generated_at: string;
}

// ─── Search ──────────────────────────────────────────────────────────────────
export type SearchResultType = 'note' | 'task' | 'project' | 'event';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  excerpt: string;
  score: number;
  item: Note | Task | Project | CalendarEvent;
}
