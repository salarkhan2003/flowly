import { create } from 'zustand';
import { User, UserSettings } from '../types';
import { storage } from '../lib/storage';
import { useTasksStore } from './tasksStore';
import { useNotesStore } from './notesStore';
import { useProjectsStore } from './projectsStore';
import { useThemeStore } from './themeStore';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  notifications_enabled: true,
  daily_brief_time: '08:00',
  update_check_policy: 'notify',
};

interface AppState {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  // Actions
  init: () => Promise<void>;
  setupProfile: (name: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar_url'>>) => Promise<void>;
  resetApp: () => Promise<void>;
}

export const useAuthStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: true,
  isOnboarded: false,

  init: async () => {
    const user = await storage.get<User>('user_profile');
    const onboarded = await storage.get<boolean>('onboarded');

    if (!user || !onboarded) {
      set({ user: null, isOnboarded: false, isLoading: false });
      return;
    }

    set({ user, isOnboarded: true, isLoading: false });
  },

  setupProfile: async (name: string) => {
    const user: User = {
      id: 'local_user',
      name: name.trim() || 'User',
      created_at: new Date().toISOString(),
      settings: DEFAULT_SETTINGS,
    };
    await storage.set('user_profile', user);
    await storage.set('onboarded', true);
    set({ user, isOnboarded: true });
  },

  updateSettings: async (settings) => {
    const user = get().user;
    if (!user) return;
    const updated: User = { ...user, settings: { ...user.settings, ...settings } };
    await storage.set('user_profile', updated);
    set({ user: updated });
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return;
    const updated: User = { ...user, ...updates };
    await storage.set('user_profile', updated);
    set({ user: updated });
  },

  resetApp: async () => {
    await storage.clear();
    useTasksStore.setState({ tasks: [], userId: null, isLoading: false });
    useNotesStore.setState({ notes: [], userId: null, isLoading: false });
    useProjectsStore.setState({ projects: [], userId: null, isLoading: false });
    useThemeStore.setState({ mode: 'dark' });
    const { useAIStore } = require('./aiStore');
    useAIStore.setState({ conversations: [], activeConversationId: null, dailyBrief: null, appContext: {} });
    set({ user: null, isOnboarded: false, isLoading: false });
  },
}));
