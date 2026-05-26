import { create } from 'zustand';
import { isOverdueDueDate, isSameCalendarDay } from '../lib/dates';
import { storage } from '../lib/storage';
import { Task, TaskStatus } from '../types';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  userId: string | null;
  loadTasks: (userId: string) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  getTasksByProject: (projectId: string) => Task[];
  getTodayTasks: () => Task[];
  getOverdueTasks: () => Task[];
}

const key = (userId: string) => `tasks:${userId}`;

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  userId: null,

  loadTasks: async (userId) => {
    set({ isLoading: true, userId });
    const cached = await storage.get<Task[]>(key(userId));
    const currentTasks = get().tasks;
    
    if (currentTasks.length > 0 && (!cached || cached.length === 0)) {
      set({ isLoading: false });
      await storage.set(key(userId), currentTasks);
    } else {
      set({ tasks: cached ?? [], isLoading: false });
    }
  },

  addTask: async (task) => {
    const tasks = [task, ...get().tasks];
    set({ tasks });
    const uid = get().userId || task.user_id;
    if (uid) await storage.set(key(uid), tasks);
  },

  updateTask: async (id, updates) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    );
    set({ tasks });
    const uid = get().userId;
    if (uid) await storage.set(key(uid), tasks);
  },

  deleteTask: async (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    const uid = get().userId;
    if (uid) await storage.set(key(uid), tasks);
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    await get().updateTask(id, {
      status: newStatus,
      completed_at: newStatus === 'done' ? new Date().toISOString() : undefined,
    });
  },

  getTasksByProject: (projectId) => get().tasks.filter((t) => t.project_id === projectId),

  getTodayTasks: () => {
    const today = new Date();
    return get().tasks.filter((t) => {
      if (!t.due_date || t.status === 'done') return false;
      return isSameCalendarDay(t.due_date, today);
    });
  },

  getOverdueTasks: () => {
    return get().tasks.filter((t) => {
      if (!t.due_date || t.status === 'done') return false;
      return isOverdueDueDate(t.due_date);
    });
  },
}));
