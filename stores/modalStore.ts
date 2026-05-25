import { create } from 'zustand';

export type AppModalVariant = 'info' | 'confirm' | 'destructive' | 'success' | 'error';

export interface AppModalState {
  visible: boolean;
  variant: AppModalVariant;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  loading: boolean;
}

interface ShowConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ModalStore extends AppModalState {
  showConfirm: (options: ShowConfirmOptions) => void;
  showAlert: (title: string, message: string, variant?: AppModalVariant) => void;
  hideModal: () => void;
  runConfirm: () => Promise<void>;
  runCancel: () => void;
  _onConfirm?: () => void | Promise<void>;
  _onCancel?: () => void;
}

const CLOSED: AppModalState = {
  visible: false,
  variant: 'info',
  title: '',
  message: '',
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  loading: false,
};

export const useModalStore = create<ModalStore>((set, get) => ({
  ...CLOSED,
  _onConfirm: undefined,
  _onCancel: undefined,

  hideModal: () => set({ ...CLOSED, _onConfirm: undefined, _onCancel: undefined }),

  showAlert: (title, message, variant = 'info') => {
    set({
      visible: true,
      variant,
      title,
      message,
      confirmLabel: 'Got it',
      cancelLabel: '',
      loading: false,
      _onConfirm: () => get().hideModal(),
      _onCancel: undefined,
    });
  },

  showConfirm: (options) => {
    set({
      visible: true,
      variant: options.destructive ? 'destructive' : 'confirm',
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel ?? (options.destructive ? 'Delete' : 'Confirm'),
      cancelLabel: options.cancelLabel ?? 'Cancel',
      loading: false,
      _onConfirm: options.onConfirm,
      _onCancel: options.onCancel,
    });
  },

  runCancel: () => {
    const { _onCancel } = get();
    get().hideModal();
    _onCancel?.();
  },

  runConfirm: async () => {
    const { _onConfirm, loading } = get();
    if (loading || !_onConfirm) return;
    set({ loading: true });
    try {
      await _onConfirm();
      get().hideModal();
    } catch {
      set({ loading: false });
    }
  },
}));
