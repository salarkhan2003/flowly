import { useModalStore } from '../stores/modalStore';

export function showAlert(title: string, message: string) {
  useModalStore.getState().showAlert(title, message, 'info');
}

export function showSuccess(title: string, message: string) {
  useModalStore.getState().showAlert(title, message, 'success');
}

export function showError(title: string, message: string) {
  useModalStore.getState().showAlert(title, message, 'error');
}

export function showConfirm(options: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}) {
  useModalStore.getState().showConfirm(options);
}
