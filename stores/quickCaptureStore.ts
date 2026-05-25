import { create } from 'zustand';

interface QuickCaptureState {
  visible: boolean;
  show: () => void;
  hide: () => void;
}

export const useQuickCaptureStore = create<QuickCaptureState>((set) => ({
  visible: false,
  show: () => set({ visible: true }),
  hide: () => set({ visible: false }),
}));
