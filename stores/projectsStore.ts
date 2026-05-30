import { create } from 'zustand';
import { onProjectCreated } from '../lib/notifications';
import { Project } from '../types';
import { storage } from '../lib/storage';

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  userId: string | null;
  loadProjects: (userId: string) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;
}

const key = (userId: string) => `projects:${userId}`;

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  isLoading: false,
  userId: null,

  loadProjects: async (userId) => {
    set({ isLoading: true, userId });
    const cached = await storage.get<Project[]>(key(userId));
    const currentProjects = get().projects;
    
    if (currentProjects.length > 0 && (!cached || cached.length === 0)) {
      set({ isLoading: false });
      await storage.set(key(userId), currentProjects);
    } else {
      set({ projects: cached ?? [], isLoading: false });
    }
  },

  addProject: async (project) => {
    const projects = [project, ...get().projects];
    set({ projects });
    const uid = get().userId || project.user_id;
    if (uid) await storage.set(key(uid), projects);
    onProjectCreated(project);
  },

  updateProject: async (id, updates) => {
    const projects = get().projects.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    set({ projects });
    const uid = get().userId;
    if (uid) await storage.set(key(uid), projects);
  },

  deleteProject: async (id) => {
    const projects = get().projects.filter((p) => p.id !== id);
    set({ projects });
    const uid = get().userId;
    if (uid) await storage.set(key(uid), projects);
  },

  getProjectById: (id) => get().projects.find((p) => p.id === id),
}));

