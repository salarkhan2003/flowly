import { create } from 'zustand';
import { storage } from '../lib/storage';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  init: () => Promise<void>;
  toggle: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',

  init: async () => {
    const saved = await storage.get<ThemeMode>('theme_mode');
    if (saved) set({ mode: saved });
    else { await storage.set('theme_mode', 'light'); }
  },

  toggle: async () => {
    const next: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
    await storage.set('theme_mode', next);
    set({ mode: next });
    const { useAuthStore } = require('./authStore');
    const user = useAuthStore.getState().user;
    if (user) {
      await useAuthStore.getState().updateSettings({ theme: next });
    }
  },

  setMode: async (mode) => {
    await storage.set('theme_mode', mode);
    set({ mode });
  },
}));
